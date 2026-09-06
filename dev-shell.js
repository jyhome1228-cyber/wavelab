const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const nav=[
  ['ABOUT','about.html'],
  ['SERVICES','services.html'],
  ['WORKS','works.html']
];
const isActive=(url)=>current===url;
const logo='<img src="aesost-logo.svg?v=20260803-4" alt="AESOST">';
const activeAttr=(url)=>isActive(url)?' aria-current="page"':'';
const desktopNav=nav.map(([label,url])=>`<a href="${url}" class="${isActive(url)?'is-active':''}"${activeAttr(url)}>${label}</a>`).join('');
const mobileNav=[...nav,['CONTACT','request.html']].map(([label,url])=>`<a href="${url}"${activeAttr(url)}><span>${label}</span><span aria-hidden="true">↗</span></a>`).join('');

function ensureStylesheet(href,id){
  if(document.getElementById(id))return;
  const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.id=id;document.head.appendChild(link);
}
function ensureScript(src,id){
  if(document.getElementById(id))return;
  const script=document.createElement('script');script.src=src;script.defer=true;script.id=id;document.head.appendChild(script);
}
ensureStylesheet('dev-operational.css?v=20260906-1','aesost-operational-css');
ensureScript('site-runtime.js?v=20260906-1','aesost-site-runtime');

const themeMeta=document.querySelector('meta[name="theme-color"]');
if(themeMeta)themeMeta.setAttribute('content','#09090a');
else{
  const meta=document.createElement('meta');
  meta.name='theme-color';
  meta.content='#09090a';
  document.head.appendChild(meta);
}

const headerMarkup=`<div class="shell dev-header-inner">
  <a class="dev-brand" href="index.html" aria-label="AESOST 홈">${logo}</a>
  <nav class="dev-nav" aria-label="주요 메뉴">${desktopNav}</nav>
  <a class="dev-contact" href="request.html"${activeAttr('request.html')}>CONTACT ↗</a>
  <button class="dev-menu" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="aesost-mobile-nav" data-dev-menu><span></span><span></span></button>
</div>
<nav class="dev-mobile-nav" id="aesost-mobile-nav" data-dev-mobile aria-label="모바일 메뉴">${mobileNav}</nav>`;

const footerMarkup=`<div class="shell">
  <div class="footer-top">
    <div>
      <a class="footer-brand" href="index.html" aria-label="AESOST 홈">${logo}</a>
      <p class="footer-intro">회사 홈페이지부터 맞춤형 업무 시스템까지. AESOST는 필요한 디지털 환경을 기획·디자인·개발하고 실제 운영까지 연결합니다.</p>
    </div>
    <div class="footer-col"><h4>MENU</h4><a href="about.html">About</a><a href="services.html">Services</a><a href="works.html">Works</a></div>
    <div class="footer-col"><h4>PROJECT</h4><a href="request.html">Project Request ↗</a><a href="index.html#process">Process</a></div>
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
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
window.addEventListener('resize',()=>{if(window.innerWidth>760)closeMenu()},{passive:true});
