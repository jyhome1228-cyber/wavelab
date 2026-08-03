import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const SOURCE_URL = 'https://worldbranddesign.com/that-joe-pizza-shop-branding-by-tanaya-designs';
const ASSET_DIR = path.join(process.cwd(), 'assets/reference/that-joe');
const DETAIL_FILE = path.join(process.cwd(), 'reference-that-joe-pizza.html');
const BOARD_FILE = path.join(process.cwd(), 'reference.html');
const CSS_FILE = path.join(process.cwd(), 'reference.css');
const PROJECT_IMAGE_PATTERN = /\/api\/storage\/objects\/uploads\/[^/?]+_(\d+)-world-brand-design-society\.webp\?w=1200(?:&|$)/i;

await fs.mkdir(ASSET_DIR, { recursive: true });
for (const file of await fs.readdir(ASSET_DIR)) {
  await fs.rm(path.join(ASSET_DIR, file), { force: true });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
  locale: 'en-GB',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
});
const page = await context.newPage();

const responsePromises = [];
const responseUrls = new Set();
page.on('response', (response) => {
  const url = response.url();
  const match = url.match(PROJECT_IMAGE_PATTERN);
  if (!match || responseUrls.has(url)) return;
  responseUrls.add(url);
  responsePromises.push((async () => {
    try {
      const body = await response.body();
      return {
        url,
        number: Number(match[1]),
        type: (response.headers()['content-type'] || '').toLowerCase(),
        body
      };
    } catch {
      return null;
    }
  })());
});

await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(4500);

for (const label of ['Accept', 'Accept all', 'I agree', 'Agree', 'Allow all']) {
  const button = page.getByRole('button', { name: new RegExp(`^${label}$`, 'i') }).first();
  if (await button.isVisible().catch(() => false)) {
    await button.click().catch(() => {});
    await page.waitForTimeout(800);
    break;
  }
}

let previousHeight = 0;
for (let i = 0; i < 32; i += 1) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate(() => window.scrollBy(0, Math.max(900, window.innerHeight * 0.88)));
  await page.waitForTimeout(480);
  const position = await page.evaluate(() => window.scrollY + window.innerHeight);
  if (height === previousHeight && position >= height - 30) break;
  previousHeight = height;
}
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(3000);

const pageInfo = await page.evaluate(() => ({
  title: document.title,
  imageCount: document.images.length,
  scrollHeight: document.documentElement.scrollHeight
}));
console.log('PAGE_INFO', JSON.stringify(pageInfo));

let projectImages = (await Promise.all(responsePromises))
  .filter(Boolean)
  .filter((item) => item.body.byteLength > 20000)
  .sort((a, b) => a.number - b.number);

// The article currently contains ten numbered project images. If a response body
// was released before Playwright could read it, request the same loaded URL again.
if (projectImages.length < 4 && responseUrls.size >= 4) {
  projectImages = [];
  for (const url of responseUrls) {
    const match = url.match(PROJECT_IMAGE_PATTERN);
    const response = await context.request.get(url, {
      headers: {
        referer: SOURCE_URL,
        accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
      },
      timeout: 90000,
      failOnStatusCode: false
    }).catch(() => null);
    if (!response?.ok()) continue;
    const body = await response.body();
    if (body.byteLength < 20000) continue;
    projectImages.push({
      url,
      number: Number(match?.[1] || projectImages.length + 1),
      type: (response.headers()['content-type'] || '').toLowerCase(),
      body
    });
  }
  projectImages.sort((a, b) => a.number - b.number);
}

await browser.close();

console.log('PROJECT_IMAGE_URLS', JSON.stringify(projectImages.map((item) => item.url)));
if (projectImages.length < 4) {
  throw new Error(`That Joe 프로젝트 이미지를 충분히 불러오지 못했습니다. 발견 ${responseUrls.size}개, 저장 가능 ${projectImages.length}개`);
}

const saved = [];
for (const item of projectImages.slice(0, 20)) {
  const filename = `${String(saved.length + 1).padStart(2, '0')}.webp`;
  await fs.writeFile(path.join(ASSET_DIR, filename), item.body);
  saved.push({ filename, originalUrl: item.url, bytes: item.body.byteLength });
  console.log('SAVED_IMAGE', filename, item.body.byteLength, item.url);
}

const gallery = saved.map((image, index) => {
  const loading = index === 0 ? 'eager' : 'lazy';
  const alt = `That Joe Pizza Shop 브랜딩 프로젝트 이미지 ${index + 1}`;
  return `          <figure class="reference-project-image${index === 0 ? ' is-featured' : ''}">\n            <img src="assets/reference/that-joe/${image.filename}" alt="${alt}" loading="${loading}" decoding="async">\n          </figure>`;
}).join('\n');

const localFirst = `assets/reference/that-joe/${saved[0].filename}`;
const absoluteFirst = `https://wavelab.my/${localFirst}`;

let detail = await fs.readFile(DETAIL_FILE, 'utf8');
detail = detail.replace(/<meta property="og:image" content="[^"]+">/, `<meta property="og:image" content="${absoluteFirst}">`);
detail = detail.replace(
  /\s*<figure class="reference-cover">[\s\S]*?<\/figure>/,
  `\n\n        <section class="reference-image-gallery" aria-label="That Joe Pizza Shop 프로젝트 이미지">\n${gallery}\n          <p class="reference-gallery-caption">Images © Tanaya Designs · World Brand Design Society. 디자인 연구와 비평을 위한 출처 표기형 열람입니다.</p>\n        </section>`
);
await fs.writeFile(DETAIL_FILE, detail);

let board = await fs.readFile(BOARD_FILE, 'utf8');
board = board.replace(
  /<img src="https:\/\/image\.thum\.io\/get\/width\/1200\/crop\/1200\/noanimate\/https:\/\/worldbranddesign\.com\/that-joe-pizza-shop-branding-by-tanaya-designs"([^>]*)>/,
  `<img src="${localFirst}"$1>`
);
await fs.writeFile(BOARD_FILE, board);

let css = await fs.readFile(CSS_FILE, 'utf8');
if (!css.includes('.reference-image-gallery{')) {
  css += '.reference-image-gallery{display:grid;gap:16px;margin:36px 0 64px}.reference-project-image{margin:0;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:#101012}.reference-project-image img{display:block;width:100%;height:auto}.reference-gallery-caption{margin:2px 0 0;color:#716e76;font-size:10px;line-height:1.65}@media(max-width:540px){.reference-image-gallery{gap:10px;margin-top:30px}.reference-project-image{border-radius:13px}}';
}
await fs.writeFile(CSS_FILE, css);

console.log(`Imported ${saved.length} project images from ${SOURCE_URL}`);
