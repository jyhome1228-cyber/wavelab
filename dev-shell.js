const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const isDemoPath=location.pathname.includes('/demo/');
const isActive=(url)=>current===url;
const solutionsActive=current==='system-solutions.html'||isDemoPath;
const logo='<img src="aesost-logo.svg?v=20260803-4" alt="AESOST">';
const activeAttr=(url)=>isActive(url)?' aria-current="page"':'';

function ensureStylesheet(href,id){
  if(document.getElementById(id))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.id=id;document.head.appendChild(link);
}
function ensureScript(src,id){
  if(document.getElementById(id))return;
  const script=document.createElement('script');script.src=src;script.defer=true;script.id=id;document.head.appendChild(script);
}
ensureStylesheet('dev-operational.css?v=20260906-2','aesost-operational-css');
ensureScript('site-runtime.js?v=20260906-1','aesost-site-runtime');

const themeMeta=document.querySelector('meta[name="theme-color"]');
if(themeMeta)themeMeta.setAttribute('content','#09090a');
else{
  const meta=document.createElement('meta');
  meta.name='theme-color';
  meta.content='#09090a';
  document.head.appendChild(meta);
}

const solutionDropdown=`
  <div class="dev-nav-dropdown${solutionsActive?' is-active':''}" data-solutions-dropdown>
    <button class="dev-nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="aesost-solutions-dropdown" data-solutions-trigger>
      SYSTEM SOLUTIONS <span aria-hidden="true">⌄</span>
    </button>
    <div class="dev-dropdown-panel" id="aesost-solutions-dropdown" data-solutions-panel>
      <div class="dev-dropdown-head"><span>AESOST SYSTEM SOLUTIONS</span><small>Interactive product demos</small></div>
      <a class="dev-dropdown-item" href="demo/solodesk/">
        <span class="dev-dropdown-index">01</span>
        <span><strong>SoloDesk</strong><small>1인사업자 · 프리랜서 업무관리</small></span>
        <em class="is-live">LIVE DEMO</em>
      </a>
      <div class="dev-dropdown-item is-disabled">
        <span class="dev-dropdown-index">02</span>
        <span><strong>B2B Inquiry Hub</strong><small>기업 문의 · 영업 파이프라인</small></span>
        <em>COMING SOON</em>
      </div>
      <div class="dev-dropdown-item is-disabled">
        <span class="dev-dropdown-index">03</span>
        <span><strong>Company CMS</strong><small>회사 홈페이지 · 관리자 시스템</small></span>
        <em>COMING SOON</em>
      </div>
      <a class="dev-dropdown-all" href="system-solutions.html">전체 시스템 솔루션 보기 <span aria-hidden="true">↗</span></a>
    </div>
  </div>`;

const headerMarkup=`<div class="shell dev-header-inner">
  <a class="dev-brand" href="index.html" aria-label="AESOST 홈">${logo}</a>
  <nav class="dev-nav" aria-label="주요 메뉴">
    <a href="about.html" class="${isActive('about.html')?'is-active':''}"${activeAttr('about.html')}>ABOUT</a>
    <a href="services.html" class="${isActive('services.html')?'is-active':''}"${activeAttr('services.html')}>SERVICES</a>
    ${solutionDropdown}
    <a href="works.html" class="${isActive('works.html')?'is-active':''}"${activeAttr('works.html')}>WORKS</a>
  </nav>
  <a class="dev-contact" href="request.html"${activeAttr('request.html')}>CONTACT ↗</a>
  <button class="dev-menu" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="aesost-mobile-nav" data-dev-menu><span></span><span></span></button>
</div>
<nav class="dev-mobile-nav" id="aesost-mobile-nav" data-dev-mobile aria-label="모바일 메뉴">
  <a href="about.html"${activeAttr('about.html')}><span>ABOUT</span><span aria-hidden="true">↗</span></a>
  <a href="services.html"${activeAttr('services.html')}><span>SERVICES</span><span aria-hidden="true">↗</span></a>
  <div class="dev-mobile-solutions${solutionsActive?' is-active':''}">
    <button type="button" aria-expanded="false" data-mobile-solutions-trigger><span>SYSTEM SOLUTIONS</span><span aria-hidden="true">+</span></button>
    <div class="dev-mobile-solutions-panel" data-mobile-solutions-panel>
      <a href="system-solutions.html"><span>전체 시스템 솔루션</span><small>Overview</small></a>
      <a href="demo/solodesk/"><span>SoloDesk</span><small>LIVE DEMO ↗</small></a>
      <div><span>B2B Inquiry Hub</span><small>COMING SOON</small></div>
      <div><span>Company CMS</span><small>COMING SOON</small></div>
    </div>
  </div>
  <a href="works.html"${activeAttr('works.html')}><span>WORKS</span><span aria-hidden="true">↗</span></a>
  <a href="request.html"${activeAttr('request.html')}><span>CONTACT</span><span aria-hidden="true">↗</span></a>
</nav>`;

const footerMarkup=`<div class="shell">
  <div class="footer-top">
    <div>
      <a class="footer-brand" href="index.html" aria-label="AESOST 홈">${logo}</a>
      <p class="footer-intro">회사 홈페이지부터 맞춤형 업무 시스템까지. AESOST는 필요한 디지털 환경을 기획·디자인·개발하고 실제 운영까지 연결합니다.</p>
    </div>
    <div class="footer-col"><h4>MENU</h4><a href="about.html">About</a><a href="services.html">Services</a><a href="system-solutions.html">System Solutions</a><a href="works.html">Works</a></div>
    <div class="footer-col"><h4>PROJECT</h4><a href="demo/solodesk/">SoloDesk Demo ↗</a><a href="request.html">Project Request ↗</a><a href="index.html#process">Process</a></div>
  </div>
  <div class="footer-bottom"><span>COMPANY WEBSITE · BUSINESS SYSTEM · PLATFORM</span><span>© 2026 AESOST. SEOUL, KOREA.</span></div>
</div>`;

document.querySelectorAll('[data-dev-header]').forEach(el=>el.innerHTML=headerMarkup);
document.querySelectorAll('[data-dev-footer]').forEach(el=>el.innerHTML=footerMarkup);

const button=document.querySelector('[data-dev-menu]');
const mobile=document.querySelector('[data-dev-mobile]');
const closeMenu=()=>{
  if(!mobile||!button)return;
  mobile.classList.remove('is-open');
  button.setAttribute('aria-expanded','false');
  button.setAttribute('aria-label','메뉴 열기');
  document.body.classList.remove('menu-open');
};
const openMenu=()=>{
  if(!mobile||!button)return;
  mobile.classList.add('is-open');
  button.setAttribute('aria-expanded','true');
  button.setAttribute('aria-label','메뉴 닫기');
  document.body.classList.add('menu-open');
};
button?.addEventListener('click',()=>mobile?.classList.contains('is-open')?closeMenu():openMenu());
mobile?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));

const solutionWrap=document.querySelector('[data-solutions-dropdown]');
const solutionTrigger=document.querySelector('[data-solutions-trigger]');
const closeSolutions=()=>{solutionWrap?.classList.remove('is-open');solutionTrigger?.setAttribute('aria-expanded','false')};
solutionTrigger?.addEventListener('click',event=>{
  event.stopPropagation();
  const open=solutionWrap?.classList.toggle('is-open');
  solutionTrigger.setAttribute('aria-expanded',String(Boolean(open)));
});
solutionWrap?.addEventListener('mouseenter',()=>{solutionWrap.classList.add('is-open');solutionTrigger?.setAttribute('aria-expanded','true')});
solutionWrap?.addEventListener('mouseleave',closeSolutions);
solutionWrap?.addEventListener('focusout',event=>{if(!solutionWrap.contains(event.relatedTarget))closeSolutions()});

document.addEventListener('click',event=>{if(solutionWrap&&!solutionWrap.contains(event.target))closeSolutions()});

const mobileSolutions=document.querySelector('[data-mobile-solutions-trigger]');
const mobileSolutionsPanel=document.querySelector('[data-mobile-solutions-panel]');
mobileSolutions?.addEventListener('click',()=>{
  const open=mobileSolutionsPanel?.classList.toggle('is-open');
  mobileSolutions.setAttribute('aria-expanded',String(Boolean(open)));
  const indicator=mobileSolutions.querySelector('span:last-child');
  if(indicator)indicator.textContent=open?'−':'+';
});

document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();closeSolutions()}});
window.addEventListener('resize',()=>{if(window.innerWidth>760)closeMenu()},{passive:true});
