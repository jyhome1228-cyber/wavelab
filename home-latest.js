const sources = [
  { url: 'magazine.html', type: '매거진' },
  { url: 'article.html', type: '아티클' },
  { url: 'column.html', type: '칼럼' }
];

const container = document.querySelector('[data-home-latest-content]');

function parseCardDate(card) {
  const values = [...card.querySelectorAll('.meta span')].map(item => item.textContent.trim());
  const dateText = values.find(value => /^\d{4}\.\d{2}\.\d{2}$/.test(value));
  if (!dateText) return 0;
  return new Date(`${dateText.replaceAll('.', '-')}T00:00:00`).getTime();
}

function normalizeCard(card, source, type) {
  const base = new URL(source, location.href);
  const href = card.getAttribute('href');
  if (href) card.setAttribute('href', new URL(href, base).href);

  card.querySelectorAll('img').forEach(image => {
    const src = image.getAttribute('src');
    if (src) image.setAttribute('src', new URL(src, base).href);
  });

  card.dataset.contentType = type;
  card.dataset.publishedAt = String(parseCardDate(card));
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
  return [...documentFragment.querySelectorAll('.grid > .card')]
    .map(card => normalizeCard(card, source.url, source.type));
}

async function loadLatestContent() {
  if (!container) return;

  try {
    const groups = await Promise.all(sources.map(readSource));
    const latest = groups
      .flat()
      .sort((a, b) => Number(b.dataset.publishedAt) - Number(a.dataset.publishedAt))
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
