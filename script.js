const page = location.pathname.split('/').pop() || 'index.html';

const nav = [
  ['매거진', 'magazine.html'],
  ['아티클', 'article.html'],
  ['뉴스', 'news.html'],
  ['스터디', 'study.html']
];

function headerMarkup() {
  const navigation = nav.map(([name, url]) =>
    `<a href="${url}" class="${page === url ? 'is-active' : ''}">${name}</a>`
  ).join('');

  return `<div class="header-inner shell">
    <a class="brand" href="index.html" aria-label="WAVELAB 홈으로 이동">
      <span class="brand-mark" aria-hidden="true">✦</span>
      <span>WAVELAB</span>
    </a>
    <nav class="desktop-nav" aria-label="주요 메뉴">${navigation}</nav>
    <div class="header-actions">
      <input class="search-box" type="text" placeholder="검색" data-search-open readonly aria-label="검색 열기">
      <a class="login" href="login.html">로그인</a>
      <a class="cta" href="study.html">시작하기</a>
      <button class="menu-btn" type="button" data-menu aria-label="메뉴 열기" aria-expanded="false"><i></i><i></i></button>
    </div>
  </div>
  <nav class="mobile-nav" data-mobile aria-label="모바일 메뉴">
    <a href="index.html">홈</a>
    ${navigation}
    <a href="about.html">웨이블랩 소개</a>
    <a href="login.html">로그인</a>
    <button type="button" data-search-open>검색</button>
  </nav>`;
}

function footerMarkup() {
  return `<div class="shell">
    <div class="footer-grid">
      <div>
        <a class="brand" href="index.html"><span class="brand-mark">✦</span><span>WAVELAB</span></a>
        <p>디자인, 기획, 개발과 비즈니스를 연결해 배우고 직접 만드는 올라운더 실무 학습 플랫폼.</p>
      </div>
      <div><h3>CONTENT</h3><nav><a href="magazine.html">매거진</a><a href="article.html">아티클</a><a href="news.html">뉴스</a><a href="study.html">스터디</a></nav></div>
      <div><h3>WAVELAB</h3><nav><a href="about.html">웨이블랩 소개</a><a href="#">문의하기</a><a href="#">인스타그램</a></nav></div>
      <div><h3>ACCOUNT</h3><nav><a href="login.html">로그인</a><a href="login.html#signup">회원가입</a><a href="#">이용약관</a><a href="#">개인정보처리방침</a></nav></div>
    </div>
    <div class="footer-bottom"><span>LEARN. CONNECT. MAKE.</span><span>© 2026 WAVELAB.</span></div>
  </div>`;
}

const header = document.querySelector('[data-header]');
const footer = document.querySelector('[data-footer]');
if (header) header.innerHTML = headerMarkup();
if (footer) footer.innerHTML = footerMarkup();

const menuButton = document.querySelector('[data-menu]');
const mobileMenu = document.querySelector('[data-mobile]');
menuButton?.addEventListener('click', () => {
  const opened = mobileMenu.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(opened));
});

mobileMenu?.querySelectorAll('a, button').forEach(item => item.addEventListener('click', () => {
  mobileMenu.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const group = button.closest('.filters');
  group?.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('is-active'));
  button.classList.add('is-active');
  const selected = button.dataset.filter;
  document.querySelectorAll('[data-category]').forEach(card => {
    card.hidden = selected !== '전체' && card.dataset.category !== selected;
  });
}));

const searchPanel = document.querySelector('[data-search-panel]');
document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', () => {
  searchPanel?.classList.add('is-open');
  searchPanel?.querySelector('input')?.focus();
}));
searchPanel?.querySelector('[data-search-close]')?.addEventListener('click', () => searchPanel.classList.remove('is-open'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') searchPanel?.classList.remove('is-open');
});

document.querySelectorAll('[data-auth-tab]').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('[data-auth-tab]').forEach(item => item.classList.remove('is-active'));
  document.querySelectorAll('[data-auth-panel]').forEach(panel => panel.classList.remove('is-active'));
  tab.classList.add('is-active');
  document.querySelector(`[data-auth-panel="${tab.dataset.authTab}"]`)?.classList.add('is-active');
}));

if (location.hash === '#signup') {
  document.querySelector('[data-auth-tab="signup"]')?.click();
}

document.querySelectorAll('[data-demo-auth]').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault();
  const notice = document.querySelector('[data-auth-notice]');
  if (notice) notice.textContent = '입력 UI가 정상 작동합니다. 실제 인증은 Firebase 연결 단계에서 활성화됩니다.';
}));