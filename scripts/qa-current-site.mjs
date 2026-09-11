import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=[
  'index.html','about.html','services.html','system-solutions.html','works.html','technology.html','request.html',
  'solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html',
  'solution-booking-os.html','solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html',
  'solution-project-room.html','solution-quote-flow.html'
];
const lightPaintPages=[...pages,'login.html','404.html'];

const replaceOrInsert=(html,regex,tag,anchor=/<\/head>/i)=>regex.test(html)?html.replace(regex,tag):html.replace(anchor,`${tag}\n</head>`);
const ensureHeadTag=(html,needle,tag)=>html.includes(needle)?html:html.replace(/<\/head>/i,`  ${tag}\n</head>`);
const ensureBodyTag=(html,needle,tag)=>html.includes(needle)?html:html.replace(/<\/body>/i,`  ${tag}\n</body>`);

const criticalStyle='<style id="aesost-critical-light">html,body{margin:0;background:#fff!important;color:#17181c!important;color-scheme:light}.dev-header{background:rgba(255,255,255,.96)!important}.dev-header:empty{min-height:104px}.hero,.page-hero,.section{background:#fff}@media(max-width:760px){.dev-header:empty{min-height:76px}}</style>';
const responsiveHeaderStyle='<style id="aesost-header-responsive">@media(max-width:960px){.dev-nav,.dev-contact{display:none!important}.dev-menu{display:block!important}.dev-brand{width:116px}.dev-mobile-nav{padding-inline:16px}}</style>';
const sharedStyles=[
  ['aesost-operational-css','dev-operational.css?v=20260906-3'],
  ['aesost-universal-ui-css','universal-web-system.css?v=20260906-2'],
  ['aesost-custom-development-css','custom-development.css?v=20260906-1'],
  ['aesost-site-polish-css','site-polish.css?v=20260907-1'],
  ['aesost-project-room-fix-css','project-room-fix.css?v=20260907-1'],
  ['aesost-motion-widgets-css','motion-widgets.css?v=20260907-1'],
  ['aesost-alignment-system-css','alignment-system.css?v=20260907-2'],
  ['aesost-light-theme-css','light-theme.css?v=20260911-3'],
  ['aesost-light-theme-polish-css','light-theme-polish.css?v=20260911-3'],
  ['aesost-solution-custom-fit-css','solution-custom-fit.css?v=20260907-1']
];

for(const file of lightPaintPages){
  const full=path.join(root,file);
  if(!fs.existsSync(full))throw new Error(`QA: missing site page ${file}`);
  let html=fs.readFileSync(full,'utf8');

  html=replaceOrInsert(html,/<meta\s+name=["']theme-color["'][^>]*>/i,'<meta name="theme-color" content="#ffffff">');
  html=replaceOrInsert(html,/<meta\s+name=["']color-scheme["'][^>]*>/i,'<meta name="color-scheme" content="light">');
  html=ensureHeadTag(html,'aesost-critical-light',criticalStyle);
  html=ensureHeadTag(html,'aesost-header-responsive',responsiveHeaderStyle);
  for(const [id,href] of sharedStyles)html=ensureHeadTag(html,`id="${id}"`,`<link id="${id}" rel="stylesheet" href="${href}">`);
  html=html.replace(/dev-shell\.js\?v=[^'"\s<]+/g,'dev-shell.js?v=20260911-5');

  if(file==='404.html'){
    html=ensureHeadTag(html,'aesost-404-light','<style id="aesost-404-light">.not-found p{color:#6f737b!important}.not-found{background:#fff!important}.not-found .btn.secondary{background:#fff!important;color:#17181c!important;border-color:#d4d7dd!important}</style>');
  }
  fs.writeFileSync(full,html);
}

// Technology SEO and inquiry coverage. apply-seo.mjs predates this page, so keep it complete here.
{
  const file='technology.html';
  const full=path.join(root,file);
  let html=fs.readFileSync(full,'utf8');
  const title='기술 역량 | 웹·시스템 아키텍처·자동화 | AESOST';
  const description='AESOST의 웹 애플리케이션, 업무 시스템, 데이터베이스, API 연동, 자동화, 클라우드 배포 기술 역량과 시스템 아키텍처를 소개합니다.';
  const canonical='https://aesost.com/technology.html';
  const ogImage='https://aesost.com/assets/dev/hero-system.svg';
  const keywords='AESOST, 에이소스트, 웹개발, 시스템 개발, 웹 애플리케이션, 시스템 아키텍처, API 연동, 업무 자동화, 데이터베이스, 클라우드 배포';

  html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${title}</title>`);
  html=replaceOrInsert(html,/<meta\s+name=["']description["'][^>]*>/i,`<meta name="description" content="${description}">`);
  html=replaceOrInsert(html,/<meta\s+name=["']keywords["'][^>]*>/i,`<meta name="keywords" content="${keywords}">`);
  html=replaceOrInsert(html,/<meta\s+name=["']robots["'][^>]*>/i,'<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">');
  html=replaceOrInsert(html,/<link\s+rel=["']canonical["'][^>]*>/i,`<link rel="canonical" href="${canonical}">`);
  html=ensureHeadTag(html,'property="og:type"','<meta property="og:type" content="website">');
  html=ensureHeadTag(html,'property="og:site_name"','<meta property="og:site_name" content="AESOST">');
  html=ensureHeadTag(html,'property="og:locale"','<meta property="og:locale" content="ko_KR">');
  html=replaceOrInsert(html,/<meta\s+property=["']og:title["'][^>]*>/i,`<meta property="og:title" content="${title}">`);
  html=replaceOrInsert(html,/<meta\s+property=["']og:description["'][^>]*>/i,`<meta property="og:description" content="${description}">`);
  html=replaceOrInsert(html,/<meta\s+property=["']og:url["'][^>]*>/i,`<meta property="og:url" content="${canonical}">`);
  html=replaceOrInsert(html,/<meta\s+property=["']og:image["'][^>]*>/i,`<meta property="og:image" content="${ogImage}">`);
  html=replaceOrInsert(html,/<meta\s+name=["']twitter:card["'][^>]*>/i,'<meta name="twitter:card" content="summary_large_image">');
  html=replaceOrInsert(html,/<meta\s+name=["']twitter:title["'][^>]*>/i,`<meta name="twitter:title" content="${title}">`);
  html=replaceOrInsert(html,/<meta\s+name=["']twitter:description["'][^>]*>/i,`<meta name="twitter:description" content="${description}">`);
  html=replaceOrInsert(html,/<meta\s+name=["']twitter:image["'][^>]*>/i,`<meta name="twitter:image" content="${ogImage}">`);

  const schema={
    '@context':'https://schema.org','@type':'WebPage',name:title,url:canonical,description,inLanguage:'ko-KR',
    isPartOf:{'@type':'WebSite',name:'AESOST',url:'https://aesost.com'}
  };
  const schemaTag=`<script id="aesost-seo-schema" type="application/ld+json">${JSON.stringify(schema)}</script>`;
  if(/<script[^>]+id=["']aesost-seo-schema["'][^>]*>[\s\S]*?<\/script>/i.test(html))html=html.replace(/<script[^>]+id=["']aesost-seo-schema["'][^>]*>[\s\S]*?<\/script>/i,schemaTag);
  else html=html.replace(/<\/head>/i,`  ${schemaTag}\n</head>`);

  html=ensureHeadTag(html,'inquiry-widget.css','<link rel="stylesheet" href="inquiry-widget.css?v=20260908-1">');
  html=ensureBodyTag(html,'inquiry-widget.js','<script type="module" src="inquiry-widget.js?v=20260908-1"></script>');
  fs.writeFileSync(full,html);
}

// Keep shared shell isolated from page-level classic scripts and align the tablet menu breakpoint.
{
  const shellPath=path.join(root,'dev-shell.js');
  let shell=fs.readFileSync(shellPath,'utf8').trim();
  shell=shell.replace(/window\.innerWidth>767/g,'window.innerWidth>960');
  if(!shell.startsWith('(()=>{'))shell=`(()=>{\n${shell}\n})();`;
  fs.writeFileSync(shellPath,`${shell}\n`);
}

// apply-seo.mjs regenerates the sitemap before this script; add Technology back if needed.
{
  const sitemapPath=path.join(root,'sitemap.xml');
  let sitemap=fs.readFileSync(sitemapPath,'utf8');
  const url='https://aesost.com/technology.html';
  if(!sitemap.includes(`<loc>${url}</loc>`)){
    const entry=`  <url><loc>${url}</loc><lastmod>2026-09-11</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`;
    sitemap=sitemap.replace(/<\/urlset>/,`${entry}\n</urlset>`);
    fs.writeFileSync(sitemapPath,sitemap);
  }
}

// Deployment-level assertions for regressions found during QA.
const errors=[];
const localRef=/\b(?:href|src)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g;
function checkLocalRefs(page,html){
  localRef.lastIndex=0;
  let match;
  while((match=localRef.exec(html))){
    const ref=match[1].trim();
    if(!ref||/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(ref))continue;
    const resolved=path.resolve(root,path.dirname(page),ref);
    if(!resolved.startsWith(root))continue;
    if(fs.existsSync(resolved)||fs.existsSync(resolved+'.html')||fs.existsSync(path.join(resolved,'index.html')))continue;
    errors.push(`${page}: broken local reference -> ${ref}`);
  }
}

for(const file of lightPaintPages){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  for(const [label,pattern] of [
    ['white theme color',/<meta\s+name=["']theme-color["'][^>]+content=["']#(?:fff|ffffff)["']/i],
    ['light color scheme',/<meta\s+name=["']color-scheme["'][^>]+content=["']light["']/i],
    ['critical light paint',/aesost-critical-light/],
    ['responsive header rule',/aesost-header-responsive/],
    ['operational stylesheet',/id=["']aesost-operational-css["']/],
    ['universal stylesheet',/id=["']aesost-universal-ui-css["']/],
    ['light theme stylesheet',/id=["']aesost-light-theme-css["']/],
    ['light polish stylesheet',/id=["']aesost-light-theme-polish-css["']/]
  ])if(!pattern.test(html))errors.push(`${file}: missing ${label}`);
  checkLocalRefs(file,html);
}

for(const file of pages){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  if(!/data-dev-header/.test(html))errors.push(`${file}: missing shared header`);
  if(!/data-dev-footer/.test(html))errors.push(`${file}: missing shared footer`);
}

const tech=fs.readFileSync(path.join(root,'technology.html'),'utf8');
for(const [label,pattern] of [
  ['keywords',/<meta\s+name=["']keywords["']/i],['Open Graph',/property=["']og:title["']/i],
  ['Twitter metadata',/name=["']twitter:title["']/i],['JSON-LD',/id=["']aesost-seo-schema["']/i],
  ['inquiry widget CSS',/inquiry-widget\.css/],['inquiry widget JS',/inquiry-widget\.js/]
])if(!pattern.test(tech))errors.push(`technology.html: missing ${label}`);

const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
if(!sitemap.includes('<loc>https://aesost.com/technology.html</loc>'))errors.push('sitemap.xml: technology page missing');
const shell=fs.readFileSync(path.join(root,'dev-shell.js'),'utf8');
if(!shell.trimStart().startsWith('(()=>{'))errors.push('dev-shell.js: global scope is not isolated');
if(!shell.includes('window.innerWidth>960'))errors.push('dev-shell.js: tablet menu breakpoint is not aligned');
if(fs.existsSync(path.join(root,'editorial-review.html')))errors.push('legacy editorial-review.html is still deployed');

if(errors.length){
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`QA hardened ${pages.length} public pages plus login/404: light first paint, preloaded shared styles, Technology SEO, sitemap, script scope, tablet navigation, local refs, and stale-route cleanup.`);
