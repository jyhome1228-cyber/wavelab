const feeds = [
  { source: 'article.html', target: '[data-home-latest-article]', fallback: 'article.html' },
  { source: 'column.html', target: '[data-home-latest-column]', fallback: 'column.html' }
];

function parseCardDate(card) {
  const values = [...card.querySelectorAll('.meta span')].map(item => item.textContent.trim());
  const dateText = values.find(value => /^\d{4}\.\d{2}\.\d{2}$/.test(value));
  if (!dateText) return 0;
  return new Date(`${dateText.replaceAll('.', '-')}T00:00:00`).getTime();
}

function normalizeLinks(card, source) {
  const base = new URL(source, location.href);
  const href = card.getAttribute('href');
  if (href) card.setAttribute('href', new URL(href, base).href);
  card.querySelectorAll('img').forEach(image => {
    const src = image.getAttribute('src');
    if (src) image.setAttribute('src', new URL(src, base).href);
  });
}

async function loadLatest({ source, target, fallback }) {
  const container = document.querySelector(target);
  if (!container) return;

  try {
    const response = await fetch(`${source}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to fetch ${source}`);

    const html = await response.text();
    const documentFragment = new DOMParser().parseFromString(html, 'text/html');
    const cards = [...documentFragment.querySelectorAll('.grid > .card')]
      .sort((a, b) => parseCardDate(b) - parseCardDate(a));

    const latest = cards[0];
    if (!latest) throw new Error(`No card found in ${source}`);

    normalizeLinks(latest, source);
    latest.classList.add('home-latest-card');
    container.innerHTML = '';
    container.appendChild(latest);
  } catch (error) {
    container.innerHTML = `<div class="home-latest-empty"><strong>최신 콘텐츠를 불러오지 못했습니다.</strong><a href="${fallback}">전체 목록 보기</a></div>`;
    console.error(error);
  }
}

feeds.forEach(loadLatest);
