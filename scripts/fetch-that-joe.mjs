import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const SOURCE_URL = 'https://worldbranddesign.com/that-joe-pizza-shop-branding-by-tanaya-designs';
const ASSET_DIR = path.join(process.cwd(), 'assets/reference/that-joe');
const DETAIL_FILE = path.join(process.cwd(), 'reference-that-joe-pizza.html');
const BOARD_FILE = path.join(process.cwd(), 'reference.html');
const CSS_FILE = path.join(process.cwd(), 'reference.css');
const IMAGE_EXT = /\.(?:avif|jpe?g|png|webp)(?:$|[?#])/i;

await fs.mkdir(ASSET_DIR, { recursive: true });
for (const file of await fs.readdir(ASSET_DIR)) {
  await fs.rm(path.join(ASSET_DIR, file), { force: true });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1600, height: 1200 },
  deviceScaleFactor: 1,
  locale: 'en-GB',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'
});
const page = await context.newPage();

const networkImages = [];
const networkSeen = new Set();
page.on('response', async (response) => {
  const url = response.url();
  const headers = response.headers();
  const type = (headers['content-type'] || '').toLowerCase();
  if ((!type.startsWith('image/') && !IMAGE_EXT.test(url)) || networkSeen.has(url)) return;
  networkSeen.add(url);
  networkImages.push({
    url,
    type,
    length: Number(headers['content-length'] || 0),
    source: 'network'
  });
});

await page.goto(SOURCE_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
await page.waitForTimeout(5000);

for (const label of ['Accept', 'Accept all', 'I agree', 'Agree', 'Allow all']) {
  const button = page.getByRole('button', { name: new RegExp(`^${label}$`, 'i') }).first();
  if (await button.isVisible().catch(() => false)) {
    await button.click().catch(() => {});
    await page.waitForTimeout(1000);
    break;
  }
}

let previousHeight = 0;
for (let i = 0; i < 30; i += 1) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate(() => window.scrollBy(0, Math.max(900, window.innerHeight * 0.9)));
  await page.waitForTimeout(500);
  const y = await page.evaluate(() => window.scrollY + window.innerHeight);
  if (height === previousHeight && y >= height - 20) break;
  previousHeight = height;
}
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(3500);

const pageInfo = await page.evaluate(() => ({
  title: document.title,
  url: location.href,
  text: document.body?.innerText?.slice(0, 500) || '',
  htmlLength: document.documentElement.outerHTML.length,
  imageCount: document.images.length,
  scrollHeight: document.documentElement.scrollHeight
}));
console.log('PAGE_INFO', JSON.stringify(pageInfo));

const domCandidates = await page.evaluate(() => {
  const values = [];
  const add = (value, source, width = 0, height = 0, alt = '') => {
    if (!value || typeof value !== 'string') return;
    for (const part of value.split(',').map((item) => item.trim().split(/\s+/)[0])) {
      if (part) values.push({ url: part, source, width, height, alt });
    }
  };

  for (const img of document.querySelectorAll('img')) {
    const rect = img.getBoundingClientRect();
    const width = img.naturalWidth || Math.round(rect.width);
    const height = img.naturalHeight || Math.round(rect.height);
    for (const key of ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-url', 'data-image']) {
      add(img.getAttribute(key), `img:${key}`, width, height, img.alt || '');
    }
    add(img.currentSrc, 'img:currentSrc', width, height, img.alt || '');
    add(img.getAttribute('srcset'), 'img:srcset', width, height, img.alt || '');
    add(img.getAttribute('data-srcset'), 'img:data-srcset', width, height, img.alt || '');
  }

  for (const source of document.querySelectorAll('source')) {
    add(source.getAttribute('src'), 'source:src');
    add(source.getAttribute('srcset'), 'source:srcset');
    add(source.getAttribute('data-srcset'), 'source:data-srcset');
  }

  for (const node of document.querySelectorAll('*')) {
    const style = getComputedStyle(node).backgroundImage;
    const matches = [...style.matchAll(/url\(["']?(.*?)["']?\)/gi)];
    for (const match of matches) add(match[1], 'background');
    for (const key of ['data-bg', 'data-background', 'data-background-image']) {
      add(node.getAttribute(key), key);
    }
  }
  return values;
});

const rawHtml = await page.content();
const htmlCandidates = [...rawHtml.matchAll(/https?:\\?\/\\?\/[^"'<>\s)]+?\.(?:avif|jpe?g|png|webp)(?:\?[^"'<>\s)]*)?/gi)]
  .map((match) => ({ url: match[0].replaceAll('\\/', '/').replaceAll('&amp;', '&'), source: 'html' }));

console.log('NETWORK_IMAGE_COUNT', networkImages.length);
console.log('DOM_IMAGE_COUNT', domCandidates.length);
console.log('NETWORK_SAMPLE', JSON.stringify(networkImages.slice(0, 30).map((item) => item.url)));
console.log('DOM_SAMPLE', JSON.stringify(domCandidates.slice(0, 30).map((item) => item.url)));

const candidateMap = new Map();
for (const candidate of [...domCandidates, ...networkImages, ...htmlCandidates]) {
  let url;
  try {
    url = new URL(candidate.url, SOURCE_URL);
  } catch {
    continue;
  }
  if (!['http:', 'https:'].includes(url.protocol)) continue;
  const clean = `${url.origin}${url.pathname}`;
  const lower = `${clean} ${candidate.alt || ''}`.toLowerCase();
  if (!IMAGE_EXT.test(url.href)) continue;
  if (/(avatar|gravatar|favicon|emoji|icon|badge|author|profile|site-logo|logo-world|world-brand-design-society|flags\/|advert|banner-ads|pixel)/i.test(lower)) continue;
  if (!candidateMap.has(clean)) candidateMap.set(clean, { ...candidate, url: url.href, clean });
}

const candidates = [...candidateMap.values()];
console.log('FILTERED_CANDIDATE_COUNT', candidates.length);
console.log('FILTERED_SAMPLE', JSON.stringify(candidates.slice(0, 50).map((item) => item.url)));

const saved = [];
for (const item of candidates) {
  if (saved.length >= 20) break;
  const response = await context.request.get(item.url, {
    headers: {
      referer: SOURCE_URL,
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
    },
    timeout: 90000,
    failOnStatusCode: false
  }).catch(() => null);
  if (!response?.ok()) continue;
  const body = await response.body();
  const type = (response.headers()['content-type'] || '').toLowerCase();
  if (!type.startsWith('image/') || body.byteLength < 45000) continue;

  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : type.includes('avif') ? 'avif' : 'jpg';
  const filename = `${String(saved.length + 1).padStart(2, '0')}.${ext}`;
  await fs.writeFile(path.join(ASSET_DIR, filename), body);
  saved.push({ filename, alt: item.alt || '', originalUrl: item.url, bytes: body.byteLength });
  console.log('SAVED_IMAGE', filename, body.byteLength, item.url);
}

await browser.close();

if (saved.length < 4) {
  throw new Error(`다운로드된 프로젝트 이미지가 충분하지 않습니다. 후보 ${candidates.length}개, 저장 ${saved.length}개`);
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
