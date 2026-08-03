const sources = [
  { url: 'magazine.html', type: '매거진', priority: 50 },
  { url: 'overseas-magazine.html', type: '해외 매거진', priority: 40 },
  { url: 'news.html', type: '뉴스', priority: 30 },
  { url: 'article.html', type: '아티클', priority: 20 },
  { url: 'column.html', type: '칼럼', priority: 10 }
];

const supplementalCards = [
  {
    type: '매거진',
    priority: 240,
    html: '<a class="card" data-category="브랜딩" href="magazine-matcha-society-modern-tradition.html"><div class="real-thumb"><img src="https://design-plus.storage.googleapis.com/wp-content/uploads/2026/01/01203950/Matchasociety_Image-3-1.jpg" alt="말차 소사이어티의 컬러 틴 패키지와 브랜드 아이덴티티"><span class="label">MAGAZINE · BRANDING · F&B</span></div><h2>말차 소사이어티, 전통 차 문화를 위한 가장 현대적인 포맷</h2><div class="meta"><span>브랜딩</span><span>AESOST MAGAZINE</span><span>2026.08.04</span></div></a>'
  },
  {
    type: '매거진',
    priority: 230,
    html: '<a class="card" data-category="디자인" href="magazine-montana-hannam-color-modular.html"><div class="real-thumb"><img src="https://design-plus.storage.googleapis.com/wp-content/uploads/2026/05/15115622/20260515025620-0.jpg" alt="컬러와 모듈 가구로 구성된 몬타나 한남 모노 스토어"><span class="label">MAGAZINE · DESIGN · SPACE</span></div><h2>몬타나, 컬러와 모듈로 완성한 취향의 시스템</h2><div class="meta"><span>디자인</span><span>AESOST MAGAZINE</span><span>2026.08.04</span></div></a>'
  },
  {
    type: '매거진',
    priority: 220,
    html: '<a class="card" data-category="디자인" href="magazine-ferrari-yoonseul-korean-craft.html"><div class="real-thumb"><img src="https://design-plus.storage.googleapis.com/wp-content/uploads/2026/02/24012150/00-1.jpg" alt="한국의 공예와 예술을 담은 페라리 12칠린드리 테일러메이드"><span class="label">MAGAZINE · DESIGN · ART & CRAFT</span></div><h2>페라리 12칠린드리 ‘윤슬’, 한국 공예를 품은 제작 방식</h2><div class="meta"><span>디자인</span><span>AESOST MAGAZINE</span><span>2026.08.04</span></div></a>'
  },
  {
    type: '매거진',
    priority: 210,
    html: '<a class="card" data-category="브랜딩" href="magazine-muds-global-cultural-brand.html"><div class="real-thumb"><img src="https://design-plus.storage.googleapis.com/wp-content/uploads/2026/06/09155504/20260609065503-10.jpg" alt="국립중앙박물관 문화상품 브랜드 뮷즈"><span class="label">MAGAZINE · BRANDING · CULTURE</span></div><h2>뮷즈, 한국 문화를 세계인의 일상으로 번역하다</h2><div class="meta"><span>브랜딩</span><span>AESOST MAGAZINE</span><span>2026.08.04</span></div></a>'
  },
  {
    type: '매거진',
    priority: 120,
    html: '<a class="card" data-category="디자인" href="magazine-rareraw-system000.html"><div class="real-thumb"><img src="https://du85s6yu4vjql.cloudfront.net/fit-in/1000x1000/pictures/images/001/330/507/original/2a90e534341fc34f1b09062289296c77.jpeg" alt="레어로우 SYSTEM000 모듈 선반 시스템"><span class="label">MAGAZINE · DESIGN · SYSTEM FURNITURE</span></div><h2>레어로우 SYSTEM000, 선반을 하나의 시스템으로 설계하다</h2><div class="meta"><span>디자인</span><span>AESOST MAGAZINE</span><span>2026.08.03</span></div></a>'
  },
  {
    type: '매거진',
    priority: 110,
    html: '<a class="card" data-category="브랜딩" href="magazine-puma-sneaker-box-seoul.html"><div class="real-thumb"><img src="https://design-plus.storage.googleapis.com/wp-content/uploads/2026/06/15133051/20260615043047-2Q3A3591_compressed1.jpeg" alt="푸마 스니커 박스 플래그십 스토어"><span class="label">MAGAZINE · BRANDING · SPACE</span></div><h2>푸마 스니커 박스, 신발 상자를 플래그십 공간으로 확장하다</h2><div class="meta"><span>브랜딩</span><span>AESOST MAGAZINE</span><span>2026.08.02</span></div></a>'
  }
];

const container = document.querySelector('[data-home-latest-content]');

function parseCardDate(card) {
  const explicit = card.dataset.publishedAt;
  if (explicit && !Number.isNaN(Date.parse(explicit))) return Date.parse(explicit);
  const values = [...card.querySelectorAll('.meta span')].map(item => item.textContent.trim());
  const dateText = values.find(value => /^\d{4}\.\d{2}\.\d{2}$/.test(value));
  if (!dateText) return 0;
  return new Date(`${dateText.replaceAll('.', '-')}T00:00:00`).getTime();
}

function normalizeCard(card, source, type, priority = 0, order = 0) {
  const base = new URL(source, location.href);
  const href = card.getAttribute('href');
  if (href) card.setAttribute('href', new URL(href, base).href);

  card.querySelectorAll('img').forEach(image => {
    const src = image.getAttribute('src');
    if (src) image.setAttribute('src', new URL(src, base).href);
  });

  card.dataset.contentType = type;
  card.dataset.publishedAtValue = String(parseCardDate(card));
  card.dataset.sourcePriority = String(priority);
  card.dataset.sourceOrder = String(order);
  card.classList.add('home-latest-card');

  const label = card.querySelector('.real-thumb .label, .thumb .label');
  if (label && !label.textContent.includes(type.toUpperCase())) {
    label.textContent = `${type.toUpperCase()} · ${label.textContent}`;
  }

  return card;
}

async function readSource(source) {
  const response = await fetch(`${source.url}?v=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to fetch ${source.url}`);

  const html = await response.text();
  const documentFragment = new DOMParser().parseFromString(html, 'text/html');
  return [...documentFragment.querySelectorAll('.grid > .card, .study-grid > .study-card')]
    .map((card, index) => normalizeCard(card, source.url, source.type, source.priority, 1000 - index));
}

function readSupplementalCards() {
  return supplementalCards.map((item, index) => {
    const doc = new DOMParser().parseFromString(item.html, 'text/html');
    const card = doc.querySelector('.card, .study-card');
    return normalizeCard(card, location.href, item.type, item.priority, 2000 - index);
  });
}

async function loadLatestContent() {
  if (!container) return;

  try {
    const groups = await Promise.all(sources.map(readSource));
    const unique = new Map();

    [...readSupplementalCards(), ...groups.flat()].forEach(card => {
      const key = new URL(card.getAttribute('href'), location.href).pathname;
      const current = unique.get(key);
      if (!current || Number(card.dataset.sourcePriority) > Number(current.dataset.sourcePriority)) unique.set(key, card);
    });

    const latest = [...unique.values()]
      .sort((a, b) => {
        const dateDifference = Number(b.dataset.publishedAtValue) - Number(a.dataset.publishedAtValue);
        if (dateDifference) return dateDifference;
        const priorityDifference = Number(b.dataset.sourcePriority) - Number(a.dataset.sourcePriority);
        if (priorityDifference) return priorityDifference;
        return Number(b.dataset.sourceOrder) - Number(a.dataset.sourceOrder);
      })
      .slice(0, 4);

    if (!latest.length) throw new Error('No latest content found');

    container.innerHTML = '';
    latest.forEach(card => container.appendChild(card));
  } catch (error) {
    container.innerHTML = '<div class="home-latest-empty"><strong>최신 콘텐츠를 불러오지 못했습니다.</strong><a href="magazine.html">전체 콘텐츠 보기</a></div>';
    console.error(error);
  }
}

loadLatestContent();