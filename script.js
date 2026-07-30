const currentPage = location.pathname.split('/').pop() || 'index.html';

const navItems = [
  ['MAGAZINE', 'magazine.html'],
  ['ARTICLE', 'article.html'],
  ['STUDY', 'study.html'],
  ['ABOUT', 'about.html']
];

const articles = [
  {category:'BRANDING',date:'2026.07.30',read:'8 MIN',title:'브랜드 콘셉트를 정리하는 방법',description:'이미지를 꾸미는 단어가 아니라 선택의 기준이 되는 브랜드 콘셉트를 만듭니다.',visual:'thumb-blue thumb-grid',label:'CONCEPT\nBEFORE\nDESIGN',url:'article-detail.html'},
  {category:'PLANNING',date:'2026.07.29',read:'7 MIN',title:'좋은 웹사이트의 정보 구조',description:'사용자가 길을 잃지 않도록 콘텐츠의 우선순위와 이동 구조를 설계하는 방법입니다.',visual:'thumb-black thumb-circle',label:'CLEAR\nINFORMATION\nFLOW',url:'article-detail.html'},
  {category:'DEVELOPMENT',date:'2026.07.28',read:'10 MIN',title:'디자이너를 위한 HTML과 CSS 기초',description:'화면을 직접 구현하기 위해 가장 먼저 이해해야 할 웹의 구조와 스타일 원리입니다.',visual:'thumb-lilac thumb-lines',label:'DESIGN\nMEETS\nCODE',url:'article-detail.html'},
  {category:'CAREER',date:'2026.07.27',read:'6 MIN',title:'포트폴리오 프로젝트를 설명하는 방법',description:'무엇을 만들었는지보다 어떤 문제를 어떻게 해결했는지 전달하는 구조를 살펴봅니다.',visual:'thumb-cyan thumb-block',label:'SHOW\nYOUR\nTHINKING',url:'article-detail.html'},
  {category:'PLANNING',date:'2026.07.25',read:'5 MIN',title:'서비스 기획자가 피그마를 배워야 하는 이유',description:'기획과 디자인 사이의 거리를 줄이고 아이디어를 빠르게 검증하는 방법입니다.',visual:'thumb-green thumb-circle',label:'PLAN\nWITH\nFIGMA',url:'article-detail.html'},
  {category:'DEVELOPMENT',date:'2026.07.23',read:'12 MIN',title:'혼자서 홈페이지를 제작하는 과정',description:'기획, 디자인, 퍼블리싱, 배포까지 작은 웹사이트를 완성하는 전체 흐름을 정리합니다.',visual:'thumb-red thumb-grid',label:'FROM\nZERO\nTO WEB',url:'article-detail.html'},
  {category:'TECHNOLOGY',date:'2026.07.21',read:'9 MIN',title:'AI를 활용해 디자인 작업을 확장하는 방법',description:'아이디어 탐색부터 비주얼 제작과 반복 작업까지 AI를 실무에 연결합니다.',visual:'thumb-silver thumb-lines',label:'AI ×\nCREATIVE\nWORK',url:'article-detail.html'},
  {category:'BUSINESS',date:'2026.07.19',read:'7 MIN',title:'작은 브랜드가 고객을 만드는 과정',description:'제품을 알리는 것에서 시작해 관계와 반복 구매를 만드는 기본 구조를 살펴봅니다.',visual:'thumb-navy thumb-block',label:'SMALL\nBRAND\nGROWTH',url:'article-detail.html'},
  {category:'DESIGN',date:'2026.07.17',read:'6 MIN',title:'레이아웃에서 위계를 만드는 가장 단순한 방법',description:'크기, 간격, 정렬과 대비를 사용해 읽는 순서를 설계합니다.',visual:'thumb-black thumb-lines',label:'VISUAL\nHIERARCHY',url:'article-detail.html'},
  {category:'BRANDING',date:'2026.07.15',read:'8 MIN',title:'브랜드 언어와 시각 체계를 연결하기',description:'메시지와 디자인이 서로 다른 이야기를 하지 않도록 하나의 기준으로 묶습니다.',visual:'thumb-blue thumb-circle',label:'ONE\nBRAND\nSYSTEM',url:'article-detail.html'},
  {category:'BUSINESS',date:'2026.07.12',read:'7 MIN',title:'아이디어를 작은 서비스로 검증하는 법',description:'크게 만들기 전에 핵심 가치를 가장 작은 형태로 실험하는 방법입니다.',visual:'thumb-green thumb-grid',label:'TEST\nBEFORE\nSCALE',url:'article-detail.html'},
  {category:'CAREER',date:'2026.07.10',read:'5 MIN',title:'올라운더에게 필요한 중심 역량',description:'많이 아는 것보다 자신의 전문성을 기준으로 다른 역량을 연결하는 방법입니다.',visual:'thumb-lilac thumb-block',label:'YOUR\nCORE\nSKILL',url:'article-detail.html'}
];

const fields = [
  ['01','DESIGN','브랜딩, 그래픽, 웹, UI·UX와 콘텐츠를 시각적인 결과물로 표현합니다.'],
  ['02','PLANNING','문제를 정의하고 사용자를 이해하며 아이디어를 서비스 구조로 바꿉니다.'],
  ['03','DEVELOPMENT','웹사이트와 디지털 서비스를 직접 구현하기 위한 지식과 도구를 익힙니다.'],
  ['04','BRANDING','브랜드의 개념, 언어와 시각 체계를 만들고 일관된 경험으로 확장합니다.'],
  ['05','BUSINESS','아이디어를 고객, 시장과 수익 구조에 연결해 실제 프로젝트로 발전시킵니다.'],
  ['06','CAREER','학습과 프로젝트를 포트폴리오, 취업, 창업과 개인 브랜드로 연결합니다.']
];

function headerMarkup() {
  const nav = navItems.map(([label,url]) => `<a href="${url}" ${currentPage===url?'aria-current="page"':''}>${label}</a>`).join('');
  return `<div class="site-header-inner">
    <a class="wordmark" href="index.html" aria-label="WAVELAB 홈">WAVELAB<sup>®</sup></a>
    <nav class="desktop-nav" aria-label="주요 메뉴">${nav}</nav>
    <div class="header-actions">
      <button class="header-search" type="button" data-search-open>SEARCH</button>
      <button class="menu-button" type="button" aria-expanded="false" aria-label="메뉴 열기" data-menu-button><i></i><i></i></button>
    </div>
  </div>
  <nav class="mobile-menu" aria-label="모바일 메뉴" data-mobile-menu>${nav}<button type="button" data-search-open>SEARCH <span>↗</span></button></nav>`;
}

function footerMarkup() {
  return `<div class="shell">
    <div class="footer-grid">
      <div class="footer-brand"><a class="wordmark" href="index.html">WAVELAB<sup>®</sup></a><p>디자인, 기획, 개발, 브랜딩과 비즈니스를 연결해 직접 결과물을 만드는 사람들을 위한 실무형 학습 플랫폼.</p></div>
      <div class="footer-column"><p>CONTENT</p><nav><a href="magazine.html">Magazine</a><a href="article.html">Article</a><a href="study.html">Study</a></nav></div>
      <div class="footer-column"><p>FIELDS</p><nav><a href="article.html?field=DESIGN">Design</a><a href="article.html?field=PLANNING">Planning</a><a href="article.html?field=DEVELOPMENT">Development</a><a href="article.html?field=BRANDING">Branding</a></nav></div>
      <div class="footer-column"><p>WAVELAB</p><nav><a href="about.html">About</a><a href="#">Instagram ↗</a><a href="#">Contact ↗</a></nav></div>
    </div>
    <div class="footer-bottom"><span>LEARN. CONNECT. MAKE.</span><span>© <span data-year></span> WAVELAB. ALL RIGHTS RESERVED.</span></div>
  </div>`;
}

const header = document.querySelector('[data-site-header]');
if (header) { header.className = 'site-header'; header.innerHTML = headerMarkup(); }
const footer = document.querySelector('[data-site-footer]');
if (footer) { footer.className = 'site-footer'; footer.innerHTML = footerMarkup(); }

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded','false');
    mobileMenu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }));
}

function articleCard(article) {
  return `<article class="article-card reveal" data-category="${article.category}">
    <a class="article-card-link" href="${article.url}">
      <div class="article-thumb visual ${article.visual}"><span>${article.category}</span><strong>${article.label.replaceAll('\n','<br>')}</strong></div>
      <div class="article-meta"><span>${article.date}</span><span>${article.category} · ${article.read}</span></div>
      <h3>${article.title}</h3><p>${article.description}</p><span class="read-more">READ MORE ↗</span>
    </a>
  </article>`;
}

function renderArticles(filter = 'ALL') {
  document.querySelectorAll('[data-article-grid]').forEach(grid => {
    const limit = Number(grid.dataset.limit || articles.length);
    const selected = articles.filter(a => filter === 'ALL' || a.category === filter).slice(0,limit);
    grid.innerHTML = selected.map(articleCard).join('');
    const empty = document.querySelector('[data-empty-message]');
    if (empty) empty.hidden = selected.length > 0;
  });
  observeReveals();
}

if (document.querySelector('[data-article-grid]')) renderArticles(new URLSearchParams(location.search).get('field') || 'ALL');

document.querySelectorAll('[data-field-list]').forEach(list => {
  list.innerHTML = fields.map(([no,title,description]) => `<a href="article.html?field=${title}"><span>${no}</span><b>${title}</b><p>${description}</p><i>↗</i></a>`).join('');
});

const filterList = document.querySelector('[data-filter-list]');
if (filterList) {
  const categories = ['ALL','DESIGN','PLANNING','DEVELOPMENT','BRANDING','BUSINESS','CAREER','TECHNOLOGY'];
  const initial = new URLSearchParams(location.search).get('field') || 'ALL';
  filterList.innerHTML = categories.map(category => `<button type="button" class="${category===initial?'is-active':''}" data-filter="${category}">${category}</button>`).join('');
  filterList.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filterList.querySelectorAll('button').forEach(item => item.classList.remove('is-active'));
    button.classList.add('is-active');
    renderArticles(button.dataset.filter);
  });
}

function searchMarkup() {
  return `<div class="search-inner">
    <div class="search-top"><strong>WAVELAB SEARCH</strong><button class="search-close" type="button" data-search-close>CLOSE ×</button></div>
    <label class="search-form"><span class="sr-only">검색어</span><input type="search" placeholder="Search articles" data-search-input autocomplete="off"></label>
    <div class="search-results" data-search-results><p class="search-empty">검색어를 입력해 주세요.</p></div>
  </div>`;
}

const searchPanel = document.querySelector('[data-search-panel]');
if (searchPanel) {
  searchPanel.innerHTML = searchMarkup();
  const input = searchPanel.querySelector('[data-search-input]');
  const results = searchPanel.querySelector('[data-search-results]');
  const closeSearch = () => {
    searchPanel.classList.remove('is-open');
    searchPanel.setAttribute('aria-hidden','true');
    document.body.classList.remove('search-open');
  };
  document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', () => {
    searchPanel.classList.add('is-open');
    searchPanel.setAttribute('aria-hidden','false');
    document.body.classList.add('search-open');
    input.focus();
  }));
  searchPanel.querySelector('[data-search-close]').addEventListener('click', closeSearch);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSearch(); });
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) { results.innerHTML = '<p class="search-empty">검색어를 입력해 주세요.</p>'; return; }
    const matches = articles.filter(article => `${article.title} ${article.description} ${article.category}`.toLowerCase().includes(query));
    results.innerHTML = matches.length ? matches.map(article => `<a class="search-result" href="${article.url}"><span>${article.category} · ${article.read}</span><h3>${article.title}</h3></a>`).join('') : '<p class="search-empty">일치하는 콘텐츠가 없습니다.</p>';
  });
}

const newsletterForm = document.querySelector('[data-newsletter-form]');
if (newsletterForm) {
  const message = document.querySelector('[data-form-message]');
  newsletterForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = new FormData(newsletterForm).get('email').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    message.textContent = valid ? '구독 신청이 저장되었습니다. 정식 뉴스레터 연동 전 데모 메시지입니다.' : '올바른 이메일 주소를 입력해 주세요.';
    if (valid) newsletterForm.reset();
  });
}

let lastScroll = 0;
window.addEventListener('scroll', () => {
  const now = window.scrollY;
  if (header && now > 160) header.classList.toggle('is-hidden', now > lastScroll);
  else if (header) header.classList.remove('is-hidden');
  lastScroll = now;
}, {passive:true});

function observeReveals() {
  const elements = document.querySelectorAll('.reveal:not([data-reveal-ready])');
  if (!('IntersectionObserver' in window)) { elements.forEach(el => el.classList.add('is-visible')); return; }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    });
  }, {threshold:.08, rootMargin:'0px 0px -40px'});
  elements.forEach(el => { el.dataset.revealReady = 'true'; observer.observe(el); });
}
observeReveals();
