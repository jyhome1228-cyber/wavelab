import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ASSET_DIR = path.join(ROOT, 'assets/reference/that-joe');
const DETAIL_FILE = path.join(ROOT, 'reference-that-joe-pizza.html');
const BOARD_FILE = path.join(ROOT, 'reference.html');
const SOURCE_CSS_FILE = path.join(ROOT, 'reference-source-images.css');

const imagePaths = [];
for (let index = 1; index <= 10; index += 1) {
  const number = String(index).padStart(2, '0');
  const oldPath = path.join(ASSET_DIR, `${number}.webp`);
  const newPath = path.join(ASSET_DIR, `${number}.avif`);

  let sourcePath = oldPath;
  try {
    await fs.access(sourcePath);
  } catch {
    sourcePath = newPath;
  }

  const bytes = await fs.readFile(sourcePath);
  const signature = bytes.subarray(4, 12).toString('ascii');
  if (signature !== 'ftypavif' && signature !== 'ftypavis') {
    throw new Error(`${path.basename(sourcePath)} is not an AVIF image: ${signature}`);
  }

  if (sourcePath === oldPath) {
    await fs.rename(oldPath, newPath);
  }
  imagePaths.push(`assets/reference/that-joe/${number}.avif`);
}

const figures = imagePaths.map((src, index) => {
  const loading = index < 2 ? 'eager' : 'lazy';
  return `          <figure class="reference-source-item is-wide"><img src="${src}" alt="That Joe Pizza Shop 브랜딩 프로젝트 이미지 ${index + 1}" loading="${loading}" decoding="async"></figure>`;
}).join('\n');

let detail = await fs.readFile(DETAIL_FILE, 'utf8');
detail = detail
  .replace(/<meta property="og:image" content="[^"]+">/, '<meta property="og:image" content="https://wavelab.my/assets/reference/that-joe/01.avif">')
  .replace(/reference-source-images\.css\?v=[^"']+/, 'reference-source-images.css?v=20260804-3')
  .replace(
    /<p class="reference-source-note">[\s\S]*?<\/p>/,
    '<p class="reference-source-note">아래 이미지는 World Brand Design Society 원문 프로젝트에서 가져와 웨이블랩 내부에 저장한 시각자료입니다. 이미지와 디자인 결과물의 권리는 Tanaya Designs, 프로젝트 클라이언트, World Brand Design Society 및 해당 권리자에게 있습니다.</p>'
  )
  .replace(
    /<div class="reference-source-gallery">[\s\S]*?<\/div>/,
    `<div class="reference-source-gallery">\n${figures}\n        </div>`
  )
  .replaceAll(/assets\/reference\/that-joe\/(\d{2})\.webp/g, 'assets/reference/that-joe/$1.avif');
await fs.writeFile(DETAIL_FILE, detail);

let board = await fs.readFile(BOARD_FILE, 'utf8');
board = board
  .replace(/reference-source-images\.css\?v=[^"']+/, 'reference-source-images.css?v=20260804-3')
  .replace(
    /(<a class="reference-card"[^>]*href="reference-that-joe-pizza\.html"[\s\S]*?<div class="reference-thumb">\s*)<img\b[^>]*>/,
    '$1<img src="assets/reference/that-joe/01.avif" alt="That Joe Pizza Shop 브랜딩 프로젝트 대표 이미지" loading="eager" decoding="async">'
  )
  .replaceAll(/assets\/reference\/that-joe\/(\d{2})\.webp/g, 'assets/reference/that-joe/$1.avif');
await fs.writeFile(BOARD_FILE, board);

let css = await fs.readFile(SOURCE_CSS_FILE, 'utf8');
css = css
  .replace(/\.reference-source-gallery\{[^}]*\}/, '.reference-source-gallery{display:grid;grid-template-columns:1fr;gap:18px;margin:34px 0 68px}')
  .replace(/\.reference-source-item\.is-wide\{[^}]*\}/, '.reference-source-item.is-wide{grid-column:auto}')
  .replace(/\.reference-source-item img\{[^}]*\}/, '.reference-source-item img{display:block;width:100%;height:auto;min-height:0;max-height:none;object-fit:contain;border:1px solid var(--line);border-radius:18px;background:#111}')
  .replace(/\.reference-source-item\.is-wide img\{[^}]*\}/, '.reference-source-item.is-wide img{height:auto;min-height:0;object-fit:contain}');
await fs.writeFile(SOURCE_CSS_FILE, css);

console.log('Renamed and linked 10 local AVIF project images.');
