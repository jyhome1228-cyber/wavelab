const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const nav=[
  ['ABOUT','about.html'],
  ['SERVICES','services.html'],
  ['WORKS','works.html']
];
const isActive=(url)=>current===url;
const logo='<img src="aesost-logo.svg?v=20260803-4" alt="AESOST">';
const desktopNav=nav.map(([label,url])=>`<a href="${url}" class="${isActive(url)?'is-active':''}">${label}</a>`).join('');
const mobileNav=[...nav,['CONTACT','request.html']].map(([label,url])=>`<a href="${url}"><span>${label}</span><span>↗</span></a>`).join('');

const themeMeta=document.querySelector('meta[name="theme-color"]');
if(themeMeta)themeMeta.setAttribute('content','#09090a');
else{
  const meta=document.createElement('meta');
  meta.name='theme-color';
  meta.content='#09090a';
  document.head.appendChild(meta);
}

const headerMarkup=`<div class="shell dev-header-inner">
  <a class="dev-brand" href="index.html" aria-label="AESOST home">${logo}</a>
  <nav class="dev-nav" aria-label="Primary navigation">${desktopNav}</nav>
  <a class="dev-contact" href="request.html">CONTACT ↗</a>
  <button class="dev-menu" type="button" aria-label="Open menu" aria-expanded="false" data-dev-menu><span></span><span></span></button>
</div>
<nav class="dev-mobile-nav" data-dev-mobile>${mobileNav}</nav>`;

const footerMarkup=`<div class="shell">
  <div class="footer-top">
    <div>
      <a class="footer-brand" href="index.html">${logo}</a>
      <p class="footer-intro">AESOST는 비즈니스에 필요한 웹사이트와 맞춤형 시스템을 기획, 디자인, 개발하고 실제 운영 환경까지 연결합니다.</p>
    </div>
    <div class="footer-col"><h4>MENU</h4><a href="about.html">About</a><a href="services.html">Services</a><a href="works.html">Works</a></div>
    <div class="footer-col"><h4>PROJECT</h4><a href="request.html">Project Request ↗</a><a href="index.html#process">Process</a></div>
  </div>
  <div class="footer-bottom"><span>WEB · SYSTEM · PLATFORM · AUTOMATION</span><span>© 2026 AESOST. SEOUL, KOREA.</span></div>
</div>`;

document.querySelectorAll('[data-dev-header]').forEach(el=>el.innerHTML=headerMarkup);
document.querySelectorAll('[data-dev-footer]').forEach(el=>el.innerHTML=footerMarkup);

const button=document.querySelector('[data-dev-menu]');
const mobile=document.querySelector('[data-dev-mobile]');
button?.addEventListener('click',()=>{
  const opened=mobile?.classList.toggle('is-open');
  button.setAttribute('aria-expanded',String(Boolean(opened)));
});
mobile?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  mobile.classList.remove('is-open');
  button?.setAttribute('aria-expanded','false');
}));
