const page = location.pathname.split('/').pop() || 'index.html';

const nav = [
  ['매거진', 'magazine.html'],
  ['아티클', 'article.html'],
  ['스터디', 'study.html']
];

const searchContent = [
  ['MAGAZINE', '올라운더의 시대', 'magazine.html'],
  ['MAGAZINE', '바이브 코딩과 새로운 창작자', 'magazine.html'],
  ['ARTICLE', '브랜드 콘셉트 문장 만들기', 'article-detail.html'],
  ['ARTICLE', '좋은 웹사이트의 정보 구조', 'article-detail.html'],
  ['ARTICLE', '디자이너를 위한 HTML과 CSS', 'article-detail.html'],
  ['STUDY', '기획부터 배포까지 나만의 웹사이트 만들기', 'study-detail.html'],
  ['STUDY', '4주 만에 개인 브랜드 만들기', 'study-detail.html']
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
      <button class="login" type="button" data-login-open>로그인</button>
      <a class="cta" href="study.html">시작하기</a>
      <button class="menu-btn" type="button" data-menu aria-label="메뉴 열기" aria-expanded="false"><i></i><i></i></button>
    </div>
  </div>
  <nav class="mobile-nav" data-mobile aria-label="모바일 메뉴">
    <a href="index.html">홈</a>
    ${navigation}
    <a href="about.html">웨이블랩 소개</a>
    <button type="button" data-search-open>검색</button>
    <button type="button" data-login-open>로그인</button>
  </nav>`;
}

function footerMarkup() {
  return `<div class="shell">
    <div class="footer-grid">
      <div>
        <a class="brand" href="index.html" aria-label="WAVELAB 홈으로 이동"><span class="brand-mark">✦</span><span>WAVELAB</span></a>
        <p>디자인, 기획, 개발과 비즈니스를 연결해 배우고 직접 만드는 올라운더 실무 학습 플랫폼.</p>
      </div>
      <div><h3>CONTENT</h3><nav><a href="magazine.html">매거진</a><a href="article.html">아티클</a><a href="study.html">스터디</a></nav></div>
      <div><h3>WAVELAB</h3><nav><a href="about.html">웨이블랩 소개</a><a href="#">문의하기</a><a href="#">인스타그램</a></nav></div>
      <div><h3>LEGAL</h3><nav><a href="#">이용약관</a><a href="#">개인정보처리방침</a></nav></div>
    </div>
    <div class="footer-bottom"><span>LEARN. CONNECT. MAKE.</span><span>© 2026 WAVELAB.</span></div>
  </div>`;
}

function loginMarkup() {
  return `<div class="login-modal" data-login-modal aria-hidden="true">
    <button class="login-backdrop" type="button" data-login-close aria-label="로그인 창 닫기"></button>
    <section class="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button class="login-close" type="button" data-login-close aria-label="닫기">×</button>
      <a class="login-brand" href="index.html"><span>✦</span><strong>WAVELAB</strong></a>
      <div class="login-tabs" role="tablist">
        <button class="is-active" type="button" data-auth-tab="login">로그인</button>
        <button type="button" data-auth-tab="signup">회원가입</button>
      </div>
      <div class="auth-panel is-active" data-auth-panel="login">
        <h2 id="login-title">다시 만나 반가워요.</h2>
        <p>저장한 콘텐츠와 스터디 정보를 확인하려면 로그인해 주세요.</p>
        <form class="auth-form" data-demo-auth>
          <label><span>이메일</span><input type="email" placeholder="name@example.com" autocomplete="email" required></label>
          <label><span>비밀번호</span><input type="password" placeholder="비밀번호를 입력해 주세요" autocomplete="current-password" required></label>
          <div class="auth-options"><label class="remember"><input type="checkbox"><span>로그인 상태 유지</span></label><a href="#">비밀번호 찾기</a></div>
          <button class="auth-submit" type="submit">로그인</button>
        </form>
        <div class="auth-divider"><span>또는</span></div>
        <div class="social-login"><button type="button">G&nbsp;&nbsp;Google로 계속하기</button><button type="button">K&nbsp;&nbsp;Kakao로 계속하기</button></div>
      </div>
      <div class="auth-panel" data-auth-panel="signup">
        <h2>웨이블랩을 시작해 보세요.</h2>
        <p>관심 있는 콘텐츠를 저장하고 새로운 스터디 소식을 받아보세요.</p>
        <form class="auth-form" data-demo-auth>
          <label><span>이름</span><input type="text" placeholder="이름을 입력해 주세요" autocomplete="name" required></label>
          <label><span>이메일</span><input type="email" placeholder="name@example.com" autocomplete="email" required></label>
          <label><span>비밀번호</span><input type="password" placeholder="8자 이상 입력해 주세요" autocomplete="new-password" required></label>
          <label class="agreement"><input type="checkbox" required><span>이용약관과 개인정보처리방침에 동의합니다.</span></label>
          <button class="auth-submit" type="submit">회원가입</button>
        </form>
      </div>
      <p class="auth-notice" data-auth-notice>현재는 UI 확인용 화면이며 실제 로그인 기능은 다음 단계에서 연결됩니다.</p>
    </section>
  </div>`;
}

function addLoginStylesheet() {
  if (document.querySelector('link[href="login.css"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'login.css';
  document.head.appendChild(link);
}

const header = document.querySelector('[data-header]');
const footer = document.querySelector('[data-footer]');
if (header) header.innerHTML = headerMarkup();
if (footer) footer.innerHTML = footerMarkup();

addLoginStylesheet();
document.body.insertAdjacentHTML('beforeend', loginMarkup());

const menuButton = document.querySelector('[data-menu]');
const mobileMenu = document.querySelector('[data-mobile]');
menuButton?.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

mobileMenu?.querySelectorAll('a, button').forEach(item => item.addEventListener('click', () => {
  mobileMenu.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filterGroup = button.closest('.filters');
  filterGroup?.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('is-active'));
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
searchPanel?.querySelector('input')?.addEventListener('input', event => {
  const query = event.target.value.trim().toLowerCase();
  const results = searchPanel.querySelector('[data-results]');
  if (!query) { results.innerHTML = ''; return; }
  results.innerHTML = searchContent
    .filter(item => `${item[0]} ${item[1]}`.toLowerCase().includes(query))
    .map(item => `<a class="search-result" href="${item[2]}"><small>${item[0]}</small><h3>${item[1]}</h3></a>`).join('') || '<p>일치하는 콘텐츠가 없습니다.</p>';
});

const loginModal = document.querySelector('[data-login-modal]');
const openLogin = () => {
  loginModal.classList.add('is-open');
  loginModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  loginModal.querySelector('input')?.focus();
};
const closeLogin = () => {
  loginModal.classList.remove('is-open');
  loginModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

document.querySelectorAll('[data-login-open]').forEach(button => button.addEventListener('click', openLogin));
document.querySelectorAll('[data-login-close]').forEach(button => button.addEventListener('click', closeLogin));

document.querySelectorAll('[data-auth-tab]').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('[data-auth-tab]').forEach(item => item.classList.remove('is-active'));
  document.querySelectorAll('[data-auth-panel]').forEach(panel => panel.classList.remove('is-active'));
  tab.classList.add('is-active');
  document.querySelector(`[data-auth-panel="${tab.dataset.authTab}"]`)?.classList.add('is-active');
}));

document.querySelectorAll('[data-demo-auth]').forEach(form => form.addEventListener('submit', event => {
  event.preventDefault();
  const notice = document.querySelector('[data-auth-notice]');
  notice.textContent = '입력 UI가 정상 작동합니다. 실제 계정 인증은 아직 연결되지 않았습니다.';
  notice.classList.add('is-success');
}));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeLogin();
    searchPanel?.classList.remove('is-open');
  }
});

document.querySelectorAll('.newsletter-form').forEach(form => form.addEventListener('submit', event => event.preventDefault()));