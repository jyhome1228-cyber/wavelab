import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const SOURCE_URL = 'https://worldbranddesign.com/that-joe-pizza-shop-branding-by-tanaya-designs';
const ASSET_DIR = path.join(process.cwd(), 'assets/reference/that-joe');
const DETAIL_FILE = path.join(process.cwd(), 'reference-that-joe-pizza.html');
const BOARD_FILE = path.join(process.cwd(), 'reference.html');
const CSS_FILE = path.join(process.cwd(), 'reference.css');

await fs.mkdir(ASSET_DIR, { recursive: true });
for (const file of await fs.readdir(ASSET_DIR)) {
  await fs.rm(path.join(ASSET_DIR, file), { force: true });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
});
const page = await context.newPage();
await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(5000);

for (let i = 0; i < 18; i += 1) {
  await page.evaluate(() => window.scrollBy(0, Math.max(700, window.innerHeight * 0.85)));
  await page.waitForTimeout(650);
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(3000);

const candidates = await page.evaluate(() => {
  const urls = [];
  const selectors = ['main img', 'article img', '.entry-content img', '.post-content img'];
  const seenElements = new Set();

  for (const selector of selectors) {
    for (const img of document.querySelectorAll(selector)) {
      if (seenElements.has(img)) continue;
      seenElements.add(img);
      const rect = img.getBoundingClientRect();
      const src = img.currentSrc || img.src || img.dataset.src || img.dataset.lazySrc || '';
      if (!src) continue;
      urls.push({
        src,
        width: img.naturalWidth || Math.round(rect.width),
        height: img.naturalHeight || Math.round(rect.height),
        alt: img.alt || ''
      });
    }
  }

  for (const node of document.querySelectorAll('main [style*="background-image"], article [style*="background-image"]')) {
    const match = getComputedStyle(node).backgroundImage.match(/url\(["']?(.*?)["']?\)/i);
    if (match?.[1]) urls.push({ src: match[1], width: node.clientWidth, height: node.clientHeight, alt: '' });
  }
  return urls;
});

const normalized = [];
const seen = new Set();
for (const item of candidates) {
  let url;
  try {
    url = new URL(item.src, SOURCE_URL);
  } catch {
    continue;
  }
  const clean = `${url.origin}${url.pathname}`;
  const lower = clean.toLowerCase();
  if (!lower.includes('worldbranddesign.com/wp-content/uploads/')) continue;
  if (!/\.(?:jpe?g|png|webp)$/i.test(url.pathname)) continue;
  if (/(avatar|gravatar|favicon|emoji|icon|badge|author|profile|site-logo|world-brand-design)/i.test(url.pathname)) continue;
  if ((item.width || 0) < 700 || (item.height || 0) < 450) continue;
  if (seen.has(clean)) continue;
  seen.add(clean);
  normalized.push({ ...item, url: url.href, clean });
}

if (normalized.length < 4) {
  throw new Error(`프로젝트 이미지 후보가 충분하지 않습니다. 발견 수: ${normalized.length}`);
}

const saved = [];
for (const item of normalized.slice(0, 20)) {
  const response = await context.request.get(item.url, {
    headers: {
      referer: SOURCE_URL,
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    },
    timeout: 90000
  });
  if (!response.ok()) continue;
  const body = await response.body();
  if (body.byteLength < 35000) continue;
  const type = (response.headers()['content-type'] || '').toLowerCase();
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  const filename = `${String(saved.length + 1).padStart(2, '0')}.${ext}`;
  await fs.writeFile(path.join(ASSET_DIR, filename), body);
  saved.push({ filename, alt: item.alt });
}

await browser.close();

if (saved.length < 4) {
  throw new Error(`다운로드된 프로젝트 이미지가 충분하지 않습니다. 저장 수: ${saved.length}`);
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
const marker = '.reference-image-gallery{';
if (!css.includes(marker)) {
  css += '.reference-image-gallery{display:grid;gap:16px;margin:36px 0 64px}.reference-project-image{margin:0;overflow:hidden;border:1px solid var(--line);border-radius:18px;background:#101012}.reference-project-image img{display:block;width:100%;height:auto}.reference-gallery-caption{margin:2px 0 0;color:#716e76;font-size:10px;line-height:1.65}@media(max-width:540px){.reference-image-gallery{gap:10px;margin-top:30px}.reference-project-image{border-radius:13px}}';
}
await fs.writeFile(CSS_FILE, css);

console.log(`Imported ${saved.length} images from ${SOURCE_URL}`);
