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
ensureStylesheet('alignment-system.css?v=20260907-2','aesost-alignment-system-css');
ensureStylesheet('light-theme.css?v=20260907-1','aesost-light-theme-css');
ensureStylesheet('light-theme-polish.css?v=20260907-1','aesost-light-theme-polish-css');
ensureStylesheet('solution-custom-fit.css?v=20260907-1','aesost-solution-custom-fit-css');
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

const solutionFitCopy={
  'solution-solodesk.html':{title:'1인사업자의 일하는 방식부터 먼저 듣습니다.',body:'고객을 기록하는 방법, 프로젝트를 나누는 기준, 청구와 입금을 확인하는 방식은 사람마다 다릅니다. 현재 쓰고 있는 메신저·엑셀·캘린더 흐름을 먼저 확인한 뒤 SoloDesk의 화면, 기능과 데이터 구조를 실제 업무 습관에 맞춰 다시 설계합니다.',points:['고객 관리 방식','프로젝트 단계','정산 흐름']},
  'solution-b2b-inquiry.html':{title:'기업마다 영업과 문의를 처리하는 순서가 다릅니다.',body:'문의가 들어오는 채널, 담당자를 배정하는 기준, 상담·견적·협의·계약으로 넘어가는 단계가 회사마다 다릅니다. AESOST는 현재 영업 흐름과 팀 역할을 먼저 듣고 파이프라인, 상태값, 알림과 화면 구성을 그 방식에 맞춰 설계합니다.',points:['문의 유입 채널','영업 단계','담당자·알림']},
  'solution-company-cms.html':{title:'브랜드마다 콘텐츠를 운영하는 방식이 다릅니다.',body:'회사소개, 포트폴리오, 뉴스, 제품 정보와 SEO를 누가 작성하고 누가 승인하는지부터 확인합니다. 단순한 관리자 템플릿을 적용하기보다 브랜드의 콘텐츠 구조와 업데이트 빈도, 내부 승인 방식에 맞는 CMS로 설계합니다.',points:['콘텐츠 구조','운영 권한','승인·배포']},
  'solution-client-portal.html':{title:'고객에게 무엇을 어떻게 공유할지도 회사마다 다릅니다.',body:'일정, 파일, 계약서, 진행률, 피드백과 승인 요청 중 어떤 정보를 고객에게 보여줄지 먼저 정합니다. 프로젝트 운영 방식과 고객 커뮤니케이션 기준에 맞춰 공개 범위, 승인 단계와 포털 화면을 커스터마이징합니다.',points:['공유 범위','피드백 방식','승인 단계']},
  'solution-booking-os.html':{title:'예약 규칙은 업종과 브랜드마다 전혀 다릅니다.',body:'예약 단위, 담당자 배정, 이용권 차감, 취소·노쇼 규칙과 재방문 관리 방식까지 실제 운영 기준을 먼저 듣습니다. 병원, 뷰티, PT, 스튜디오, 공간대여 등 각 업종의 흐름에 맞춰 예약 화면과 관리 기능을 다시 설계합니다.',points:['예약 규칙','이용권·상태','담당자 배정']},
  'solution-vendor-desk.html':{title:'발주와 협력사 관리도 회사의 구매 방식에 맞춰야 합니다.',body:'품목 코드, 발주 승인, 납기 확인, 입고 처리와 정산 방식은 조직마다 다릅니다. 현재 구매팀이 사용하는 문서와 승인 순서를 확인한 뒤 협력사, 발주서, 배송·입고와 정산 화면을 실제 프로세스에 맞춰 연결합니다.',points:['발주 승인','납기·입고','정산 방식']},
  'solution-membership-admin.html':{title:'멤버십 정책과 회원 운영 방식에 맞춰 설계합니다.',body:'가입 조건, 등급, 혜택, 이용권, 결제 주기, 갱신과 휴면 기준은 서비스마다 다릅니다. 현재 회원 운영 정책을 먼저 정리한 뒤 필요한 상태값, 자동화, 결제 흐름과 관리자 화면을 브랜드에 맞춰 구성합니다.',points:['회원 정책','플랜·혜택','결제·갱신']},
  'solution-support-desk.html':{title:'고객지원은 회사의 응대 기준부터 반영해야 합니다.',body:'문의가 들어오는 채널, 우선순위, 담당자 배정, SLA와 해결 기준을 먼저 확인합니다. 단순 티켓함이 아니라 실제 CS팀의 응대 방식에 맞춰 상태, 알림, 내부 메모와 고객 이력을 설계합니다.',points:['문의 채널','SLA·우선순위','담당자·이력']},
  'solution-project-room.html':{title:'프로젝트를 운영하는 방식에 맞춰 협업 구조를 만듭니다.',body:'웹, 브랜딩, 개발, 제조, 연구처럼 프로젝트 성격에 따라 업무 단계, 역할, 산출물과 승인 방식이 달라집니다. 팀 내부와 외부 파트너가 실제로 어떻게 협업하는지 듣고 권한, 일정, 피드백과 승인 흐름을 그 방식에 맞춰 설계합니다.',points:['업무 단계','역할·권한','산출물·승인']},
  'solution-quote-flow.html':{title:'견적과 제안서가 만들어지는 방식부터 맞춥니다.',body:'회사별 단가표, 할인 규칙, VAT, 내부 결재선, 버전 관리와 고객 승인 과정이 모두 다릅니다. 현재 견적 작성과 승인 흐름을 먼저 확인한 뒤 항목 구성, 자동 계산, 발송과 계약 연결 구조를 실제 영업 방식에 맞춰 설계합니다.',points:['단가·할인','내부 결재','발송·승인']}
};

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

const fit=solutionFitCopy[current];
if(fit&&!document.querySelector('[data-solution-fit]')){
  const main=document.querySelector('main');
  if(main){
    const section=document.createElement('section');
    section.className='section solution-fit-section';
    section.setAttribute('data-solution-fit','');
    section.innerHTML=`<div class="shell solution-fit-grid"><p class="eyebrow">BUILT AROUND YOUR WORKFLOW</p><div class="solution-fit-copy"><h2>${fit.title}</h2><p>${fit.body}</p><div class="solution-fit-points">${fit.points.map(point=>`<span>${point}</span>`).join('')}</div></div></div>`;
    const target=main.querySelector('.pr-demo-section,.section.dark,.cta-section');
    if(target)main.insertBefore(section,target);else main.appendChild(section);
  }
}

const button=document.querySelector('[data-dev-menu]');
const mobile=document.querySelector('[data-dev-mobile]');
const closeMenu=()=>{if(!mobile||!button)return;mobile.classList.remove('is-open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','메뉴 열기');document.body.classList.remove('menu-open')};
const openMenu=()=>{if(!mobile||!button)return;mobile.classList.add('is-open');button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','메뉴 닫기');document.body.classList.add('menu-open')};
button?.addEventListener('click',()=>mobile?.classList.contains('is-open')?closeMenu():openMenu());
mobile?.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});
window.addEventListener('resize',()=>{if(window.innerWidth>767)closeMenu()},{passive:true});