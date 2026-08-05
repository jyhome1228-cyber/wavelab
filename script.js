function ensureHeadTag(selector,create){if(document.head.querySelector(selector))return;document.head.appendChild(create())}
function loadStylesheet(href){if(document.querySelector(`link[href="${href}"]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link)}
ensureHeadTag('link[rel="icon"]',()=>{const e=document.createElement('link');e.rel='icon';e.type='image/svg+xml';e.href='favicon.svg?v=20260803-4';return e});
ensureHeadTag('link[rel="manifest"]',()=>{const e=document.createElement('link');e.rel='manifest';e.href='site.webmanifest?v=20260802-3';return e});
ensureHeadTag('meta[name="theme-color"]',()=>{const e=document.createElement('meta');e.name='theme-color';e.content='#651DDC';return e});
ensureHeadTag('meta[name="description"]',()=>{const e=document.createElement('meta');e.name='description';e.content='AESOST는 배우고 기록하며 자신의 커리어를 만드는 사람들을 위한 플랫폼입니다.';return e});
loadStylesheet('refine.css');
loadStylesheet('member-gate.css');
loadStylesheet('mobile-spacing.css?v=20260802-2');
loadStylesheet('grid-four.css?v=20260801-1');
loadStylesheet('wavelab-philosophy.css?v=20260801-1');
loadStylesheet('search-refine.css?v=20260804-1');
loadStylesheet('image-fallback.css?v=20260801-2');
loadStylesheet('real-content.css?v=20260802-6');
loadStylesheet('aesost-theme.css?v=20260804-3');

const page=location.pathname.split('/').pop()||'index.html';
const nav=[
  ['매거진','magazine.html','list'],
  ['아티클','article.html','document'],
  ['칼럼','column.html','edit'],
  ['해외 매거진','overseas-magazine.html','globe'],
  ['해외 레퍼런스','reference.html','reference'],
  ['커리어 컨설팅','expert-feedback.html','expert'],
  ['뉴스','news.html','news'],
  ['공지사항','notice.html','news']
];
function active(url){
  if(page===url)return true;
  if(url==='class.html'&&page==='study-detail.html')return true;
  if(url==='overseas-magazine.html'&&page==='magazine-fold-studio-room-divider.html')return true;
  if(url==='reference.html'&&(page.startsWith('reference-')||page==='my-references.html'))return true;
  if(url==='expert-feedback.html'&&(page.startsWith('expert-')||page==='career-consulting-request.html'))return true;
  return false;
}
function brandMarkup(){return '<img class="brand-logo" src="aesost-logo.svg?v=20260801-2" alt="AESOST">'}
function menuIcon(type){
  const icons={
    list:'<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="3" cy="6" r=".7"/><circle cx="3" cy="12" r=".7"/><circle cx="3" cy="18" r=".7"/>',
    reference:'<path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 15h6v4h-6z"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
    document:'<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h6"/>',
    edit:'<path d="m4 20 4.2-1 10-10a2 2 0 0 0-3-3l-10 10z"/><path d="m13.5 7.5 3 3"/>',
    class:'<path d="m3 9 9-5 9 5-9 5z"/><path d="M7 12v5c3 2 7 2 10 0v-5M21 9v6"/>',
    expert:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
    news:'<path d="M4 10v4h4l8 4V6l-8 4z"/><path d="M8 14v5M19 9a4 4 0 0 1 0 6"/>'
  };
  return `<span class="mobile-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[type]||icons.list}</svg></span>`;
}
function desktopNavigation(){return nav.map(([name,url])=>`<a href="${url}" class="${active(url)?'is-active':''}">${name}</a>`).join('')}
function mobileNavigation(){return nav.map(([name,url,icon])=>`<a href="${url}" class="mobile-menu-link ${active(url)?'is-active':''}">${menuIcon(icon)}<span class="mobile-menu-label">${name}</span><span class="mobile-menu-arrow" aria-hidden="true">›</span></a>`).join('')}
function headerMarkup(){return `<div class="header-inner shell"><a class="brand" href="index.html" aria-label="AESOST 홈으로 이동">${brandMarkup()}</a><nav class="desktop-nav" aria-label="주요 메뉴">${desktopNavigation()}</nav><div class="header-actions"><input class="search-box" type="text" placeholder="검색" data-search-open readonly aria-label="검색 열기"><a class="cta" href="column-write.html" data-column-write hidden>칼럼 쓰기</a><a class="login" href="login.html" data-auth-login>로그인</a><a class="mypage-link" href="mypage.html" data-auth-mypage hidden>마이페이지</a><a class="logout-link" href="#" data-auth-logout hidden>로그아웃</a><button class="menu-btn" type="button" data-menu aria-label="메뉴 열기" aria-expanded="false"><i></i><i></i><i></i></button></div></div><nav class="mobile-nav" data-mobile aria-label="모바일 메뉴"><div class="mobile-menu-links">${mobileNavigation()}</div><div class="mobile-account-actions"><a href="login.html" data-mobile-login>로그인 <span>›</span></a><a href="column-write.html" data-mobile-column-write hidden>칼럼 쓰기 <span>›</span></a><a href="mypage.html" data-mobile-mypage hidden>마이페이지 <span>›</span></a><a href="my-references.html">나의 레퍼런스 <span>›</span></a><a href="#" data-mobile-logout hidden>로그아웃 <span>›</span></a></div></nav>`}
function footerMarkup(){return `<div class="shell"><div class="footer-grid"><div><a class="brand" href="index.html">${brandMarkup()}</a><p>지식을 얻고 관점을 기록하며, 자신의 경험을 커리어 자산으로 만드는 플랫폼.</p></div><div><h3>CONTENT</h3><nav><a href="magazine.html">매거진</a><a href="article.html">아티클</a><a href="column.html">칼럼</a><a href="overseas-magazine.html">해외 매거진</a><a href="reference.html">해외 레퍼런스</a><a href="news.html">뉴스</a><a href="notice.html">공지사항</a></nav></div><div><h3>AESOST</h3><nav><a href="expert-feedback.html">커리어 컨설팅</a><a href="columnist-apply.html">칼럼니스트 신청</a><a href="about.html">운영자 소개</a></nav></div><div><h3>ACCOUNT</h3><nav><a href="login.html">로그인</a><a href="login.html?mode=signup">회원가입</a><a href="mypage.html">마이페이지</a><a href="my-references.html">나의 레퍼런스</a><a href="ability-edit.html">커리어 아카이브</a></nav></div></div><div class="footer-bottom"><span>LEARN · THINK · WRITE · GROW</span><span>© 2026 AESOST.</span></div></div>`}

const header=document.querySelector('[data-header]');
const footer=document.querySelector('[data-footer]');
if(header)header.innerHTML=headerMarkup();
if(footer)footer.innerHTML=footerMarkup();

const menuButton=document.querySelector('[data-menu]');
const mobileMenu=document.querySelector('[data-mobile]');
menuButton?.addEventListener('click',()=>{
  const opened=mobileMenu.classList.toggle('is-open');
  menuButton.classList.toggle('is-open',opened);
  menuButton.setAttribute('aria-expanded',String(opened));
});
mobileMenu?.querySelectorAll('a,button').forEach(item=>item.addEventListener('click',()=>{
  mobileMenu.classList.remove('is-open');
  menuButton?.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded','false');
}));

document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
  const group=button.closest('.filters,.reference-filters');
  group?.querySelectorAll('[data-filter]').forEach(item=>item.classList.remove('is-active'));
  button.classList.add('is-active');
  const selected=button.dataset.filter;
  document.querySelectorAll('[data-category]').forEach(card=>{card.hidden=selected!=='전체'&&card.dataset.category!==selected});
}));

const searchPanel=document.querySelector('[data-search-panel]');
document.querySelectorAll('[data-search-open]').forEach(button=>button.addEventListener('click',()=>{
  searchPanel?.classList.add('is-open');
  searchPanel?.querySelector('input')?.focus();
}));
searchPanel?.querySelector('[data-search-close]')?.addEventListener('click',()=>searchPanel.classList.remove('is-open'));
document.addEventListener('keydown',event=>{if(event.key==='Escape')searchPanel?.classList.remove('is-open')});

function activateAuthTab(name){
  document.querySelectorAll('[data-auth-tab]').forEach(item=>item.classList.toggle('is-active',item.dataset.authTab===name));
  document.querySelectorAll('[data-auth-panel]').forEach(panel=>panel.classList.toggle('is-active',panel.dataset.authPanel===name));
}
document.querySelectorAll('[data-auth-tab]').forEach(tab=>tab.addEventListener('click',()=>activateAuthTab(tab.dataset.authTab)));
const authMode=new URLSearchParams(location.search).get('mode');
if(authMode==='signup'||location.hash==='#signup')activateAuthTab('signup');

const gatedPages=new Set(['magazine.html','overseas-magazine.html','article.html','column.html','class.html','news.html']);
function applyMemberAccess(user=null){
  if(!gatedPages.has(page))return;
  const grid=document.querySelector('.grid,.study-grid');
  if(!grid)return;
  grid.querySelector('.member-gate-banner')?.remove();
  const cards=[...grid.querySelectorAll(':scope > .card,:scope > .study-card')];
  const signed=Boolean(user);
  cards.forEach(card=>{
    card.classList.remove('member-locked');
    card.querySelector('.member-lock-overlay')?.remove();
    if(card.dataset.originalHref)card.setAttribute('href',card.dataset.originalHref);
  });
  cards.forEach((card,index)=>{
    if(!card.dataset.originalHref)card.dataset.originalHref=card.getAttribute('href')||'#';
    if(index<4||signed){card.setAttribute('href',card.dataset.originalHref);return}
    card.classList.add('member-locked');
    card.setAttribute('href',`login.html?mode=signup&next=${encodeURIComponent(card.dataset.originalHref)}`);
    const thumb=card.querySelector('.thumb,.real-thumb');
    if(thumb&&!thumb.querySelector('.member-lock-overlay'))thumb.insertAdjacentHTML('beforeend','<div class="member-lock-overlay"><span class="member-lock-icon">⌑</span><strong>MEMBERS ONLY</strong><span>에이소스트 시작하기</span></div>');
  });
  if(!signed&&cards.length>4){
    const banner=document.createElement('div');
    banner.className='member-gate-banner';
    banner.innerHTML='<div class="member-gate-philosophy"><span>LEARN · THINK · WRITE · GROW</span><h3>다른 사람의 지식과 관점을 읽고, 자신의 경험도 커리어 자산으로 남겨보세요.</h3><p>에이소스트에서 전체 콘텐츠를 읽고, 커리어 컨설팅을 요청하고, 자신의 생각과 경험을 기록할 수 있습니다.</p></div><a href="login.html?mode=signup">에이소스트 시작하기</a>';
    grid.insertBefore(banner,cards[4]);
  }
}
window.applyMemberAccess=applyMemberAccess;
applyMemberAccess(null);

if(page==='magazine.html'){
  const extra=document.createElement('script');
  extra.src='magazine-extra.js?v=20260804-2';
  document.body.appendChild(extra);
}
if(page.startsWith('magazine-')){
  const titles=document.createElement('script');
  titles.src='magazine-titles.js?v=20260804-1';
  document.body.appendChild(titles);
}
if(document.body.classList.contains('reference-detail-page')||page==='my-references.html'){
  loadStylesheet('reference-save.css?v=20260804-4');
  const references=document.createElement('script');
  references.src='reference-save.js?v=20260804-3';
  document.body.appendChild(references);
}

const firebaseModule=document.createElement('script');
firebaseModule.type='module';
firebaseModule.src='firebase-auth.js?v=20260802-3';
document.body.appendChild(firebaseModule);
const columnistModule=document.createElement('script');
columnistModule.type='module';
columnistModule.src='columnist-access.js?v=20260801-2';
document.body.appendChild(columnistModule);
const enhance=document.createElement('script');
enhance.src='site-enhance.js?v=20260803-1';
document.body.appendChild(enhance);

document.title=document.title.replaceAll('WAVELAB','AESOST').replaceAll('웨이블랩','에이소스트').replaceAll('전문가 피드백','커리어 컨설팅');
document.querySelectorAll('meta[name="description"],meta[property="og:site_name"],meta[property="og:title"],meta[property="og:description"]').forEach(meta=>{
  if(meta.content)meta.content=meta.content.replaceAll('WAVELAB','AESOST').replaceAll('웨이블랩','에이소스트');
});

const SEO_DEFAULT_IMAGE='https://cdn.imweb.me/upload/S2023030963558ef55ba8e/533bf9324fd96.png';
const SEO_BASE='https://aesost.com/';
const seoPages={
  'index.html':{
    title:'AESOST | 커리어 성장과 디자인 인사이트 플랫폼',
    description:'커리어 성장, 디자인, 브랜딩, 비즈니스와 실무 지식을 읽고 기록하며 자신의 경험을 커리어 자산으로 만드는 AESOST 플랫폼입니다.',
    keywords:'에이소스트,AESOST,커리어 플랫폼,커리어 성장,디자인 매거진,디자인 아티클,브랜딩 인사이트',
    h1:'배우고, 기록하고, 자신의 커리어를 만드는 사람들.'
  },
  'magazine.html':{
    title:'디자인 매거진 | 브랜딩·공간·제품 디자인 트렌드 — AESOST',
    description:'국내외 브랜딩, 공간, 제품, 시각디자인과 비즈니스 사례를 분석하고 실무에 적용할 수 있는 디자인 인사이트를 소개합니다.',
    keywords:'디자인 매거진,브랜딩 매거진,디자인 트렌드,공간 브랜딩,제품 디자인,시각디자인',
    h1:'디자인 매거진'
  },
  'article.html':{
    title:'디자인 아티클 | 디자인·기획·개발 실무 지식 — AESOST',
    description:'디자인, 기획, 개발, 브랜딩과 비즈니스 실무에 필요한 방법과 관점을 AESOST 아티클에서 확인하세요.',
    keywords:'디자인 아티클,디자인 실무,기획 실무,개발 실무,브랜딩 아티클,비즈니스 인사이트',
    h1:'디자인 아티클'
  },
  'column.html':{
    title:'커리어 칼럼 | 디자이너·프리랜서·창업 경험 — AESOST',
    description:'디자이너, 기획자, 개발자와 창업가가 자신의 경험과 전문성을 기록한 커리어 칼럼을 소개합니다.',
    keywords:'커리어 칼럼,디자이너 커리어,프리랜서 커리어,창업 칼럼,전문가 칼럼',
    h1:'커리어 칼럼'
  },
  'overseas-magazine.html':{
    title:'해외 디자인 매거진 | 글로벌 디자인·브랜드 트렌드 — AESOST',
    description:'해외 디자인, 건축, 브랜드와 문화 매체의 주요 소식을 한국어로 정리하고 실무 관점에서 분석합니다.',
    keywords:'해외 디자인 매거진,글로벌 디자인 트렌드,해외 브랜딩,건축 매거진,디자인 뉴스',
    h1:'해외 디자인 매거진'
  },
  'reference.html':{
    title:'디자인 레퍼런스 | 브랜딩·패키지·공간 디자인 사례 — AESOST',
    description:'해외 브랜딩, 패키지, 공간, 그래픽과 디지털 디자인 프로젝트를 모아 한국어로 분석하는 디자인 레퍼런스 아카이브입니다.',
    keywords:'디자인 레퍼런스,브랜딩 레퍼런스,패키지 디자인 사례,공간 디자인 사례,그래픽 디자인 사례',
    h1:'디자인 레퍼런스'
  },
  'expert-feedback.html':{
    title:'커리어 컨설팅 | 취업·이직·프리랜서 방향 설계 — AESOST',
    description:'취업, 이직, 프리랜서 전환, 1인 사업과 창업을 위한 커리어 진단과 실행 방향을 전문 컨설턴트와 구체화하세요.',
    keywords:'커리어 컨설팅,취업 컨설팅,이직 컨설팅,프리랜서 컨설팅,창업 컨설팅,포트폴리오 피드백',
    h1:'커리어 컨설팅'
  },
  'news.html':{
    title:'디자인 뉴스 | AI·브랜딩·비즈니스 최신 소식 — AESOST',
    description:'디자인, AI, 브랜딩, 기술, 비즈니스와 커리어 분야에서 지금 주목할 최신 소식을 전합니다.',
    keywords:'디자인 뉴스,AI 뉴스,브랜딩 뉴스,비즈니스 뉴스,커리어 뉴스',
    h1:'디자인 뉴스'
  },
  'notice.html':{
    title:'AESOST 공지사항 | 서비스 및 운영 안내',
    description:'AESOST 서비스, 콘텐츠, 회원 기능과 운영에 관한 주요 공지사항을 확인하세요.',
    keywords:'AESOST 공지,에이소스트 공지사항,서비스 안내,운영 안내',
    h1:'공지사항'
  },
  'about.html':{
    title:'AESOST 소개 | 배우고 기록하며 커리어를 만드는 플랫폼',
    description:'AESOST가 지식, 기록, 경험과 커리어 성장을 연결하는 방식과 운영 방향을 소개합니다.',
    keywords:'AESOST 소개,에이소스트,커리어 플랫폼,디자인 플랫폼',
    h1:'AESOST 소개'
  }
};
const noindexPages=new Set(['login.html','mypage.html','ability-edit.html','column-write.html','notice-write.html','my-references.html','career-consulting-request.html','admin.html','admin-members.html','admin-columnists.html']);
function upsertMeta(selector,attributes){
  let element=document.head.querySelector(selector);
  if(!element){element=document.createElement('meta');document.head.appendChild(element)}
  Object.entries(attributes).forEach(([key,value])=>element.setAttribute(key,value));
  return element;
}
function upsertLink(selector,attributes){
  let element=document.head.querySelector(selector);
  if(!element){element=document.createElement('link');document.head.appendChild(element)}
  Object.entries(attributes).forEach(([key,value])=>element.setAttribute(key,value));
  return element;
}
function applySeo(){
  const canonicalUrl=page==='index.html'?SEO_BASE:`${SEO_BASE}${page}`;
  if(noindexPages.has(page)){
    upsertMeta('meta[name="robots"]',{name:'robots',content:'noindex,nofollow'});
    return;
  }
  const config=seoPages[page];
  if(!config)return;
  document.title=config.title;
  upsertMeta('meta[name="description"]',{name:'description',content:config.description});
  upsertMeta('meta[name="keywords"]',{name:'keywords',content:config.keywords});
  upsertMeta('meta[name="robots"]',{name:'robots',content:'index,follow,max-image-preview:large'});
  upsertLink('link[rel="canonical"]',{rel:'canonical',href:canonicalUrl});
  upsertMeta('meta[property="og:type"]',{property:'og:type',content:'website'});
  upsertMeta('meta[property="og:site_name"]',{property:'og:site_name',content:'AESOST'});
  upsertMeta('meta[property="og:title"]',{property:'og:title',content:config.title});
  upsertMeta('meta[property="og:description"]',{property:'og:description',content:config.description});
  upsertMeta('meta[property="og:url"]',{property:'og:url',content:canonicalUrl});
  upsertMeta('meta[property="og:image"]',{property:'og:image',content:SEO_DEFAULT_IMAGE});
  upsertMeta('meta[property="og:image:secure_url"]',{property:'og:image:secure_url',content:SEO_DEFAULT_IMAGE});
  upsertMeta('meta[property="og:image:type"]',{property:'og:image:type',content:'image/png'});
  upsertMeta('meta[property="og:image:width"]',{property:'og:image:width',content:'1200'});
  upsertMeta('meta[property="og:image:height"]',{property:'og:image:height',content:'630'});
  upsertMeta('meta[name="twitter:card"]',{name:'twitter:card',content:'summary_large_image'});
  upsertMeta('meta[name="twitter:title"]',{name:'twitter:title',content:config.title});
  upsertMeta('meta[name="twitter:description"]',{name:'twitter:description',content:config.description});
  upsertMeta('meta[name="twitter:image"]',{name:'twitter:image',content:SEO_DEFAULT_IMAGE});
  const h1=document.querySelector('.page-head h1,.notice-head h1,.expert-page-head h1');
  if(h1&&config.h1)h1.textContent=config.h1;
  let schema=document.head.querySelector('script[data-seo-schema]');
  if(!schema){schema=document.createElement('script');schema.type='application/ld+json';schema.dataset.seoSchema='';document.head.appendChild(schema)}
  schema.textContent=JSON.stringify({
    '@context':'https://schema.org',
    '@type':page==='index.html'?'WebSite':'CollectionPage',
    name:config.title.replace(/\s+[—|]\s+AESOST$/,''),
    description:config.description,
    url:canonicalUrl,
    isPartOf:{'@type':'WebSite',name:'AESOST',url:SEO_BASE},
    inLanguage:'ko-KR'
  });
}
applySeo();

const navSeoTitles={
  'magazine.html':'AESOST 디자인 매거진',
  'article.html':'AESOST 디자인 아티클',
  'column.html':'AESOST 커리어 칼럼',
  'overseas-magazine.html':'AESOST 해외 디자인 매거진',
  'reference.html':'AESOST 디자인 레퍼런스',
  'expert-feedback.html':'AESOST 커리어 컨설팅',
  'news.html':'AESOST 디자인 뉴스',
  'notice.html':'AESOST 공지사항'
};
document.querySelectorAll('header a[href],footer a[href]').forEach(link=>{
  const href=link.getAttribute('href')?.split('?')[0];
  if(navSeoTitles[href])link.title=navSeoTitles[href];
  if(active(href))link.setAttribute('aria-current','page');
});