import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const base='https://aesost.com';
const ogImage=`${base}/assets/dev/hero-system.svg`;
const commonKeywords=['AESOST','에이소스트','웹개발','시스템 개발','맞춤형 개발'];

const pages={
  'index.html':{
    path:'/',
    title:'AESOST | 기업 홈페이지·맞춤형 업무 시스템 개발',
    description:'AESOST는 기업 홈페이지, CRM, 관리자 페이지, 고객 포털, 예약·발주·멤버십 등 업무 시스템을 기획·디자인·개발합니다. 실제 일하는 방식을 듣고 맞춰 설계합니다.',
    keywords:['기업 홈페이지 제작','회사 홈페이지 제작','맞춤형 업무 시스템','CRM 개발','관리자 페이지 개발','고객 포털','업무 자동화'],
    schema:'WebSite'
  },
  'about.html':{
    path:'/about.html',
    title:'AESOST 소개 | 웹·시스템 개발 파트너',
    description:'AESOST는 기업과 브랜드의 업무 방식을 이해하고 홈페이지, 관리자, CRM, 포털, 운영 시스템을 기획·UI·개발까지 한 흐름으로 구축합니다.',
    keywords:['AESOST 소개','웹 개발사','시스템 개발사','기업 웹개발','맞춤 개발','UI UX 개발'],
    schema:'AboutPage'
  },
  'services.html':{
    path:'/services.html',
    title:'서비스 | 기업 홈페이지·업무 시스템 개발 | AESOST',
    description:'기업 홈페이지 제작부터 CRM, 관리자 페이지, 플랫폼·MVP, API·AI 연동과 업무 자동화까지 필요한 디지털 환경을 설계하고 개발합니다.',
    keywords:['기업 홈페이지 제작','CRM 개발','관리자 페이지','플랫폼 개발','MVP 개발','API 연동','AI 업무 자동화'],
    schema:'Service'
  },
  'system-solutions.html':{
    path:'/system-solutions.html',
    title:'업무 시스템 솔루션 10종 | 인터랙티브 데모 | AESOST',
    description:'1인사업자 관리, B2B 문의, CMS, 고객 포털, 예약, 발주, 멤버십, CS, 프로젝트, 견적 자동화 시스템을 실제 데모로 확인하세요.',
    keywords:['업무 관리 시스템','B2B 문의 관리','CMS 개발','고객 포털','예약 관리 시스템','발주 관리 시스템','멤버십 관리','CS 관리','프로젝트 관리','견적 자동화'],
    schema:'CollectionPage'
  },
  'works.html':{
    path:'/works.html',
    title:'구축 사례 | 웹사이트·CRM·업무 시스템 | AESOST',
    description:'AESOST의 기업 홈페이지, CRM, 관리자 페이지, 대시보드, 고객 포털 등 웹·시스템 구축 사례와 개발 방식을 확인하세요.',
    keywords:['웹사이트 구축 사례','CRM 구축 사례','관리자 페이지 사례','대시보드 개발','업무 시스템 포트폴리오'],
    schema:'CollectionPage'
  },
  'request.html':{
    path:'/request.html',
    title:'프로젝트 문의 | 웹·시스템 개발 상담 | AESOST',
    description:'회사 홈페이지, 관리자 페이지, CRM, 고객 포털, 예약·발주·프로젝트 관리 시스템 등 필요한 개발 범위를 AESOST와 함께 정리해 보세요.',
    keywords:['홈페이지 제작 문의','시스템 개발 문의','CRM 견적','관리자 페이지 견적','맞춤 개발 상담'],
    schema:'ContactPage'
  },
  'solution-solodesk.html':{
    path:'/solution-solodesk.html',
    title:'1인사업자 관리 시스템 SoloDesk | AESOST',
    description:'고객, 프로젝트, 일정, 청구·입금을 한 곳에서 관리하는 1인사업자용 업무 관리 시스템. 실제 일하는 방식에 맞춰 기능과 화면을 설계합니다.',
    keywords:['1인사업자 관리 시스템','프리랜서 업무 관리','고객 관리','프로젝트 관리','정산 관리','SoloDesk'],
    service:'1인사업자 업무 관리 시스템 SoloDesk'
  },
  'solution-b2b-inquiry.html':{
    path:'/solution-b2b-inquiry.html',
    title:'기업 B2B 문의·영업 관리 시스템 | AESOST',
    description:'문의 접수부터 담당자 배정, 상담, 제안, 계약까지 B2B 영업 파이프라인을 관리하는 시스템. 회사의 실제 영업 단계에 맞춰 설계합니다.',
    keywords:['B2B 문의 관리','영업 관리 시스템','리드 관리','영업 파이프라인','기업 문의 CRM','B2B Inquiry Hub'],
    service:'기업 B2B 문의·영업 관리 시스템'
  },
  'solution-company-cms.html':{
    path:'/solution-company-cms.html',
    title:'기업 홈페이지 CMS·관리자 시스템 | AESOST',
    description:'회사소개, 포트폴리오, 뉴스, 제품 정보와 SEO를 직접 운영하는 기업 홈페이지 CMS와 관리자 시스템을 브랜드 운영 방식에 맞춰 구축합니다.',
    keywords:['기업 CMS 개발','홈페이지 관리자','콘텐츠 관리 시스템','회사 홈페이지 운영','SEO 관리','Company CMS'],
    service:'기업 홈페이지 CMS·관리자 시스템'
  },
  'solution-client-portal.html':{
    path:'/solution-client-portal.html',
    title:'고객 프로젝트 공유 포털 시스템 | AESOST',
    description:'일정, 파일, 산출물, 피드백과 승인 요청을 고객과 안전하게 공유하는 프로젝트 포털. 기업별 공유 범위와 승인 방식에 맞춰 개발합니다.',
    keywords:['고객 포털 개발','프로젝트 공유 시스템','클라이언트 포털','파일 공유','피드백 관리','승인 시스템'],
    service:'고객 프로젝트 공유 포털 시스템'
  },
  'solution-booking-os.html':{
    path:'/solution-booking-os.html',
    title:'예약·고객·이용권 관리 시스템 Booking OS | AESOST',
    description:'예약, 고객, 이용권, 담당자, 노쇼와 재방문을 관리하는 예약 기반 사업 운영 시스템. 병원·뷰티·PT·스튜디오 등 업종별 규칙에 맞춰 설계합니다.',
    keywords:['예약 관리 시스템','고객 관리','이용권 관리','노쇼 관리','병원 예약 시스템','뷰티 예약 시스템','Booking OS'],
    service:'예약 기반 사업 관리 시스템 Booking OS'
  },
  'solution-vendor-desk.html':{
    path:'/solution-vendor-desk.html',
    title:'협력사·발주·납기 관리 시스템 Vendor Desk | AESOST',
    description:'협력사, 발주서, 품목·단가, 납기, 입고와 정산을 한 흐름으로 관리하는 구매·발주 시스템. 기업별 구매 프로세스에 맞춰 개발합니다.',
    keywords:['발주 관리 시스템','협력사 관리','구매 관리','납기 관리','입고 관리','정산 관리','Vendor Desk'],
    service:'협력사·발주 관리 시스템 Vendor Desk'
  },
  'solution-membership-admin.html':{
    path:'/solution-membership-admin.html',
    title:'회원·멤버십·구독 관리 시스템 | AESOST',
    description:'회원, 등급, 플랜, 혜택, 결제, 갱신과 휴면 상태를 관리하는 멤버십 운영 시스템. 서비스 정책과 브랜드 운영 방식에 맞춰 설계합니다.',
    keywords:['회원 관리 시스템','멤버십 관리','구독 관리','회원 등급','결제 관리','갱신 관리','Membership Admin'],
    service:'회원·멤버십 운영 시스템'
  },
  'solution-support-desk.html':{
    path:'/solution-support-desk.html',
    title:'고객 문의·CS·티켓 관리 시스템 Support Desk | AESOST',
    description:'고객 문의 접수, 담당자 배정, 우선순위, SLA, 해결과 재오픈을 관리하는 고객지원 시스템. 실제 CS 운영 기준에 맞춰 구축합니다.',
    keywords:['고객 문의 관리','CS 관리 시스템','티켓 관리','고객지원 시스템','SLA 관리','Support Desk'],
    service:'고객 문의·지원 관리 시스템 Support Desk'
  },
  'solution-project-room.html':{
    path:'/solution-project-room.html',
    title:'프로젝트 협업·진행·승인 관리 시스템 Project Room | AESOST',
    description:'업무, 일정, 담당자, 산출물, 피드백과 승인 상태를 한 공간에서 관리하는 프로젝트 협업 시스템. 팀의 실제 운영 방식에 맞춰 설계합니다.',
    keywords:['프로젝트 관리 시스템','협업 시스템','업무 관리','산출물 관리','피드백 관리','승인 관리','Project Room'],
    service:'프로젝트 협업·진행 관리 시스템 Project Room'
  },
  'solution-quote-flow.html':{
    path:'/solution-quote-flow.html',
    title:'견적·제안서 자동화 시스템 QuoteFlow | AESOST',
    description:'견적 항목, 단가, VAT, 버전, 발송, 열람과 승인을 관리하는 견적·제안서 자동화 시스템. 회사별 단가와 결재 흐름에 맞춰 개발합니다.',
    keywords:['견적서 자동화','제안서 관리','견적 관리 시스템','VAT 자동 계산','전자 승인','영업 자동화','QuoteFlow'],
    service:'견적·제안서 자동화 시스템 QuoteFlow'
  }
};

const legacyPatterns=[
  /^article/i,/^magazine/i,/^column/i,/^overseas-/i,/^reference/i,/^expert-/i,/^career-/i,
  /^news/i,/^notice/i,/^class/i,/^study-/i,/^community/i,/^ability/i,/^mypage/i,/^my-references/i,
  /^columnist-/i,/^login\.html$/i
];

function escapeAttr(value=''){
  return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
function replaceOrInsert(html,regex,tag){
  if(regex.test(html))return html.replace(regex,tag);
  return html.replace(/<\/head>/i,`  ${tag}\n</head>`);
}
function setTitle(html,title){
  const tag=`<title>${title}</title>`;
  return replaceOrInsert(html,/<title>[\s\S]*?<\/title>/i,tag);
}
function setMeta(html,selectorRegex,tag){return replaceOrInsert(html,selectorRegex,tag)}
function setCanonical(html,url){return replaceOrInsert(html,/<link\s+rel=["']canonical["'][^>]*>/i,`<link rel="canonical" href="${escapeAttr(url)}">`)}
function removeJsonLd(html,id){
  const re=new RegExp(`<script[^>]+id=["']${id}["'][^>]*>[\\s\\S]*?<\\/script>`,`i`);
  return html.replace(re,'');
}
function schemaFor(file,meta){
  const canonical=`${base}${meta.path}`;
  const organization={
    '@type':'Organization',name:'AESOST',alternateName:'에이소스트',url:base,
    logo:`${base}/favicon.svg`,description:pages['index.html'].description
  };
  if(file==='index.html')return {'@context':'https://schema.org','@graph':[organization,{'@type':'WebSite',name:'AESOST',url:base,description:meta.description,inLanguage:'ko-KR'}]};
  if(meta.service)return {'@context':'https://schema.org','@type':'Service',name:meta.service,url:canonical,description:meta.description,provider:organization,areaServed:'KR',serviceType:meta.service};
  if(meta.schema==='Service')return {'@context':'https://schema.org','@type':'Service',name:'AESOST 웹·시스템 개발 서비스',url:canonical,description:meta.description,provider:organization,areaServed:'KR'};
  return {'@context':'https://schema.org','@type':meta.schema||'WebPage',name:meta.title,url:canonical,description:meta.description,inLanguage:'ko-KR',isPartOf:{'@type':'WebSite',name:'AESOST',url:base}};
}
function injectInquiryWidget(html){
  if(!/inquiry-widget\.css/i.test(html))html=html.replace(/<\/head>/i,'  <link rel="stylesheet" href="inquiry-widget.css?v=20260908-1">\n</head>');
  if(!/inquiry-widget\.js/i.test(html))html=html.replace(/<\/body>/i,'  <script type="module" src="inquiry-widget.js?v=20260908-1"></script>\n</body>');
  return html;
}
function applyMeta(file,meta){
  const full=path.join(root,file);
  if(!fs.existsSync(full))return;
  let html=fs.readFileSync(full,'utf8');
  const canonical=`${base}${meta.path}`;
  const keywords=[...commonKeywords,...meta.keywords].join(', ');
  html=setTitle(html,meta.title);
  html=setMeta(html,/<meta\s+name=["']description["'][^>]*>/i,`<meta name="description" content="${escapeAttr(meta.description)}">`);
  html=setMeta(html,/<meta\s+name=["']keywords["'][^>]*>/i,`<meta name="keywords" content="${escapeAttr(keywords)}">`);
  html=setMeta(html,/<meta\s+name=["']robots["'][^>]*>/i,'<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">');
  html=setCanonical(html,canonical);
  html=setMeta(html,/<meta\s+property=["']og:type["'][^>]*>/i,'<meta property="og:type" content="website">');
  html=setMeta(html,/<meta\s+property=["']og:site_name["'][^>]*>/i,'<meta property="og:site_name" content="AESOST">');
  html=setMeta(html,/<meta\s+property=["']og:locale["'][^>]*>/i,'<meta property="og:locale" content="ko_KR">');
  html=setMeta(html,/<meta\s+property=["']og:title["'][^>]*>/i,`<meta property="og:title" content="${escapeAttr(meta.title)}">`);
  html=setMeta(html,/<meta\s+property=["']og:description["'][^>]*>/i,`<meta property="og:description" content="${escapeAttr(meta.description)}">`);
  html=setMeta(html,/<meta\s+property=["']og:url["'][^>]*>/i,`<meta property="og:url" content="${escapeAttr(canonical)}">`);
  html=setMeta(html,/<meta\s+property=["']og:image["'][^>]*>/i,`<meta property="og:image" content="${escapeAttr(ogImage)}">`);
  html=setMeta(html,/<meta\s+name=["']twitter:card["'][^>]*>/i,'<meta name="twitter:card" content="summary_large_image">');
  html=setMeta(html,/<meta\s+name=["']twitter:title["'][^>]*>/i,`<meta name="twitter:title" content="${escapeAttr(meta.title)}">`);
  html=setMeta(html,/<meta\s+name=["']twitter:description["'][^>]*>/i,`<meta name="twitter:description" content="${escapeAttr(meta.description)}">`);
  html=setMeta(html,/<meta\s+name=["']twitter:image["'][^>]*>/i,`<meta name="twitter:image" content="${escapeAttr(ogImage)}">`);
  html=removeJsonLd(html,'aesost-seo-schema');
  const schema=JSON.stringify(schemaFor(file,meta));
  html=html.replace(/<\/head>/i,`  <script id="aesost-seo-schema" type="application/ld+json">${schema}</script>\n</head>`);
  html=injectInquiryWidget(html);
  fs.writeFileSync(full,html);
}

for(const [file,meta] of Object.entries(pages))applyMeta(file,meta);

for(const name of fs.readdirSync(root)){
  if(!name.endsWith('.html')||pages[name])continue;
  if(!legacyPatterns.some(pattern=>pattern.test(name))&&name!=='404.html')continue;
  const full=path.join(root,name);
  let html=fs.readFileSync(full,'utf8');
  html=setMeta(html,/<meta\s+name=["']robots["'][^>]*>/i,'<meta name="robots" content="noindex,nofollow,noarchive">');
  fs.writeFileSync(full,html);
}

const sitemapEntries=Object.entries(pages).map(([file,meta])=>{
  const priority=file==='index.html'?'1.0':file==='services.html'||file==='system-solutions.html'?'0.9':file.startsWith('solution-')?'0.8':'0.7';
  const freq=file==='index.html'?'weekly':'monthly';
  return `  <url><loc>${base}${meta.path}</loc><lastmod>2026-09-08</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`;
}).join('\n');
fs.writeFileSync(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`);

console.log(`Applied current AESOST SEO metadata and inquiry widget to ${Object.keys(pages).length} pages.`);
