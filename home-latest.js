const sources = [
  { url: 'magazine.html', type: '매거진', priority: 50 },
  { url: 'overseas-magazine.html', type: '해외 매거진', priority: 40 },
  { url: 'news.html', type: '뉴스', priority: 30 },
  { url: 'article.html', type: '아티클', priority: 20 },
  { url: 'column.html', type: '칼럼', priority: 10 }
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

function makeMagazineFeedCard(item) {
  const card = document.createElement('a');
  card.className = 'card';
  card.dataset.category = item.category;
  if (item.publishedAt) card.dataset.publishedAt = item.publishedAt;
  card.href = item.href;
  card.innerHTML = `<div class="real-thumb"><img src="${item.image}" alt="${item.alt || item.title}"><span class="label">${item.label}</span></div><h2>${item.title}</h2><div class="meta"><span>${item.category}</span><span>AESOST MAGAZINE</span><span>${item.date}</span></div>`;
  return card;
}

async function readMagazineFeed() {
  try {
    const response = await fetch(`magazine-feed.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch magazine-feed.json');
    const feed = await response.json();
    if (!Array.isArray(feed)) return [];
    return feed.map((item, index) => normalizeCard(
      makeMagazineFeedCard(item),
      'magazine.html',
      '매거진',
      100,
      3000 - index
    ));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function loadLatestContent() {
  if (!container) return;

  try {
    const [groups, magazineFeed] = await Promise.all([
      Promise.all(sources.map(readSource)),
      readMagazineFeed()
    ]);
    const unique = new Map();

    [...magazineFeed, ...groups.flat()].forEach(card => {
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