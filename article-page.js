const cards = [...document.querySelectorAll('.article-card')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const emptyState = document.querySelector('[data-empty]');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));

    let visibleCount = 0;
    cards.forEach((card) => {
      const categories = (card.dataset.category || '').split(' ');
      const visible = filter === 'ALL' || categories.includes(filter);
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    if (emptyState) emptyState.hidden = visibleCount > 0;
  });
});

const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });
}

const searchLayer = document.querySelector('[data-search-layer]');
const searchInput = document.querySelector('[data-search-input]');
const searchResults = document.querySelector('[data-search-results]');

function closeSearch() {
  if (!searchLayer) return;
  searchLayer.classList.remove('is-open');
  searchLayer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('search-open');
}

function openSearch() {
  if (!searchLayer || !searchInput) return;
  searchLayer.classList.add('is-open');
  searchLayer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('search-open');
  window.setTimeout(() => searchInput.focus(), 30);
}

document.querySelectorAll('[data-search-open]').forEach((button) => {
  button.addEventListener('click', openSearch);
});

document.querySelector('[data-search-close]')?.addEventListener('click', closeSearch);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSearch();
});

searchInput?.addEventListener('input', () => {
  if (!searchResults) return;
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    searchResults.innerHTML = '<p>검색어를 입력해 주세요.</p>';
    return;
  }

  const matches = cards.filter((card) => card.textContent.toLowerCase().includes(query));
  searchResults.innerHTML = matches.length
    ? matches.map((card) => {
        const title = card.querySelector('h2')?.textContent || '아티클';
        const category = (card.dataset.category || '').split(' ')[0];
        const href = card.getAttribute('href') || 'article-detail.html';
        return `<a class="search-result" href="${href}"><small>${category}</small><strong>${title}</strong></a>`;
      }).join('')
    : '<p>일치하는 아티클이 없습니다.</p>';
});