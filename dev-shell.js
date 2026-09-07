const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
const isDemoPath=location.pathname.includes('/demo/');
const isActive=(url)=>current===url;
const solutionPages=['system-solutions.html','solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html','solution-booking-os.html','solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html','solution-project-room.html','solution-quote-flow.html'];
const solutionsActive=solutionPages.includes(current)||isDemoPath;
const logo='<img src="aesost-logo-dark.svg?v=20260907-1" alt="AESOST">';
const activeAttr=(url)=>isActive(url)?' aria-current="page"':'';
function ensureStylesheet(href,id){if(document.getElementById(id))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.id=id;document.head.appendChild(link)}
function ensureScript(src,id){if(document.getElementById(id))return;const script=document.createElement('script');script.src=src;script.defer=true;script.id=id;document.head.appendChild(script)}
ensureStylesheet('dev-operational.css?v=20260906-3','aesost-operational-css');
ensureStylesheet('universal-web-system.css?v=20260906-2','aesost-universal-ui-css');
ensureStylesheet('custom-development.css?v=20260906-1','aesost-custom-development-css');
ensureStylesheet('site-polish.css?v=20260907-1','aesost-site-polish-css');
ensureStylesheet('project-room-fix.css?v=20260907-1','aesost-project-room-fix-css');
ensureStylesheet('motion-widgets.css?v=20260907-1','aesost-motion-widgets-css');
ensureStylesheet('alignment-system.css?v=20260907-1','aesost-alignment-system-css');
ensureStylesheet('light-theme.css?v=20260907-1','aesost-light-theme-css');
ensureScript('site-runtime.js?v=20260906-1','aesost-site-runtime');
const themeMeta=document.querySelector('meta[name="theme-color"]');if(themeMeta)themeMeta.setAttribute('content','#ffffff');else{const meta=document.createElement('meta');meta.name='theme-color';meta.content='#ffffff';document.head.appendChild(meta)}

const items=[
['01','1인사업자를 위한 관리 시스템','SoloDesk','solution-solodesk.html'],
['02','기업 B2B 문의 관리 시스템','B2B Inquiry Hub','solution-b2b-inquiry.html'],
['03','기업 홈페이지 운영 시스템','Company CMS','solution-company-cms.html'],
['04','고객 프로젝트 공유 시스템','Client Portal','solution-client-portal.html'],
['05','예약 기반 사업 관리 시스템','Booking OS','solution-booking-os.html'],
['06','협력사·발주 관리 시스템','Vendor Desk','solution-vendor-desk.html'],
['07','회원·멤버십 운영 시스템','Membership Admin','solution-membership-admin.html'],
['08','고객 문의·지원 관리 시스템','Support Desk','solution-support-desk.html'],
['09','프로젝트 협업·진행 관리 시스템','Project Room','solution-project-room.html'],
['10','견적·제안서 자동화 시스템','QuoteFlow','solution-quote-flow.html']
];

const headerMarkup=`<div class="shell dev-header-inner">
  <a class="dev-brand" href="index.html" aria-label="AESOST 홈">${logo}</a>
  <nav class="dev-nav" aria-label="주요 메뉴">
    <a href="about.html" class="${isActive('about.html')?'is-active':''}"${activeAttr('about.html')}>ABOUT</a>
    <a href="services.html" class="${isActive('services.html')?'is-active':''}"${activeAttr('services.html')}>SERVICES</a>
    <a href="system-solutions.html" class="${solutionsActive?'is-active':''}"${solutionsActive?' aria-current="page"':''}>SYSTEM SOLUTIONS</a>
    <a href="works.html" class="${isActive('works.html')?'is-active':''}"${activeAttr('works.html')}>WORKS</a>
  </nav>
  <a class="dev-contact" href="request.html"${activeAttr('request.html')}>CONTACT ↗</a>
  <button class="dev-menu" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="aesost-mobile-nav" data-dev-menu><span></span><span></span></button>
</div>
<nav class="dev-mobile-nav" id="aesost-mobile-nav" data-dev-mobile aria-label="모바일 메뉴">
  <a href="about.html"${activeAttr('about.html')}><span>ABOUT</span><span aria-hidden="true">↗</span></a>
  <a href="services.html"${activeAttr('services.html')}><span>SERVICES</span><span aria-hidden="true">↗</span></a>
  <a href="system-solutions.html"${solutionsActive?' aria-current="page"':''}><span>SYSTEM SOLUTIONS</span><span aria-hidden="true">↗</span></a>
  <a href="works.html"${activeAttr('works.html')}><span>WORKS</span><span aria-hidden="true">↗</span></a>
  <a href="request.html"${activeAttr('request.html')}><span>CONTACT</span><span aria-hidden="true">↗</span></a>
</nav>`;

const footerSystem=items.map(([,title,product,url])=>`<a href="${url}">${title.replace(' 시스템','')} · ${product} ↗</a>`).join('');
const footerMarkup=`<div class="shell"><div class="dev-custom-build"><span>CUSTOM DEVELOPMENT</span><div><strong>각 기업·브랜드에 맞춰 기능부터 디자인, 레이아웃과 콘텐츠 구조까지 커스터마이징해 개발합니다.</strong><p>AESOST는 정해진 템플릿을 그대로 적용하지 않습니다. 실제 업무 방식, 필요한 기능, 브랜드의 시각 언어와 운영 방식을 확인한 뒤 웹사이트와 시스템 구조를 함께 설계합니다.</p></div></div><div class="footer-top"><div><a class="footer-brand" href="index.html" aria-label="AESOST 홈">${logo}</a><p class="footer-intro">회사 홈페이지부터 맞춤형 업무 시스템까지. AESOST는 필요한 디지털 환경을 기획·디자인·개발하고 실제 운영까지 연결합니다.</p></div><div class="footer-col"><h4>MENU</h4><a href="about.html">About</a><a href="services.html">Services</a><a href="system-solutions.html">System Solutions</a><a href="works.html">Works</a></div><div class="footer-col"><h4>SYSTEM</h4>${footerSystem}</div></div><div class="footer-bottom"><span>COMPANY WEBSITE · BUSINESS SYSTEM · PLATFORM</span><span>© 2026 AESOST. SEOUL, KOREA.</span></div></div>`;

document.querySelectorAll('[data-dev-header]').forEach(el=>el.innerHTML=headerMarkup);
document.querySelectorAll('[data-dev-footer]').forEach(el=>el.innerHTML=footerMarkup);

const button=document.querySelector('[data-dev-menu]');
const mobile=document.querySelector('[data-dev-mobile]');
const closeMenu=()=>{if(!mobile||!button)return;mobile.classList.remove('is-open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','메뉴 열기');document.body.classList.remove('menu-open')};
const openMenu=()=>{if(!mobile||!button)return;mobile.classList.add('is-open');button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','메뉴 닫기');document.body.classList.add('menu-open')};
button?.addEventListener('click',()=>mobile?.classList.contains('is-open')?closeMenu():openMenu());
mobile?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
window.addEventListener('resize',()=>{if(window.innerWidth>767)closeMenu()},{passive:true});