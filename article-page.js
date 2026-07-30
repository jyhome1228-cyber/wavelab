(() => {
  const labels = {
    MAGAZINE: '매거진',
    ARTICLE: '아티클',
    STUDY: '스터디',
    ABOUT: '소개'
  };

  document.querySelectorAll('.desktop-nav a, .mobile-menu a').forEach((link) => {
    const key = link.textContent.trim();
    if (labels[key]) link.textContent = labels[key];
  });

  const desktopNav = document.querySelector('.desktop-nav');
  if (desktopNav && !desktopNav.querySelector('.article-more')) {
    const more = document.createElement('a');
    more.href = '#';
    more.className = 'article-more';
    more.innerHTML = '더 보기 <span aria-hidden="true">▾</span>';
    desktopNav.appendChild(more);
  }

  const actions = document.querySelector('.header-actions');
  const searchButton = actions?.querySelector('.header-search');
  const menuButton = actions?.querySelector('.menu-button');

  if (searchButton) {
    searchButton.textContent = '검색';
    searchButton.setAttribute('aria-label', '사이트 검색');
  }

  if (actions && !actions.querySelector('.article-login')) {
    const extras = document.createElement('div');
    extras.className = 'article-header-extras';
    extras.innerHTML = `
      <span class="article-bag" aria-hidden="true"></span>
      <a class="article-login" href="#">로그인</a>
      <a class="article-plus" href="#">Plus</a>`;

    [...extras.children].forEach((element) => {
      actions.insertBefore(element, menuButton || null);
    });
  }

  const filterLabels = {
    ALL: '전체',
    DESIGN: '디자인',
    PLANNING: '기획',
    DEVELOPMENT: '개발',
    BRANDING: '브랜딩',
    BUSINESS: '비즈니스',
    CAREER: '커리어',
    TECHNOLOGY: '테크놀로지'
  };

  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.textContent = filterLabels[button.dataset.filter] || button.dataset.filter;
  });
})();
