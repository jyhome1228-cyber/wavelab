import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const pages=['index.html','about.html','services.html','system-solutions.html','solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html','solution-booking-os.html','solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html','solution-project-room.html','solution-quote-flow.html','works.html','request.html'];
const required=['dev-site.css','dev-operational.css','universal-web-system.css','custom-development.css','site-polish.css','solutions-index.css','project-room.css','motion-widgets.css','alignment-system.css','light-theme.css','solution-custom-fit.css','inquiry-widget.css','inquiry-widget.js','request-form.js','firestore.rules','login.html','login-current.css','firebase-auth.js','dev-shell.js','system-ui.css','solution-detail.css','solution-solodesk.js','solution-b2b-inquiry.js','solution-company-cms.js','solution-client-portal.js','solution-booking-os.js','solution-vendor-desk.js','solution-membership-admin.js','solution-support-desk.js','solution-project-room.js','solution-quote-flow.js','aesost-logo.svg','aesost-logo-dark.svg','favicon.svg','scripts/apply-seo.mjs','scripts/prune-legacy.mjs','sitemap.xml','robots.txt','site.webmanifest','.github/workflows/deploy-pages.yml'];
const adminRequired=['admin/index.html','admin/admin-current.css','admin/admin-entry.js','admin/admin-owner-dashboard.js','admin/admin-visitor-analytics.js','admin/admin-business-dashboard.js'];
const demoPages=['demo/solodesk/index.html','demo/b2b-inquiry/index.html','demo/company-cms/index.html','demo/client-portal/index.html','demo/booking-os/index.html','demo/vendor-desk/index.html','demo/membership-admin/index.html','demo/support-desk/index.html','demo/project-room/index.html','demo/quote-flow/index.html'];
const demoRequired=['demo/solodesk/styles.css','demo/solodesk/app.js','demo/solodesk/guide.js','assets/dev/work-solodesk.svg','demo/b2b-inquiry/styles.css','demo/b2b-inquiry/app.js','demo/b2b-inquiry/guide.js','assets/dev/work-b2b-inquiry.svg','demo/company-cms/styles.css','demo/company-cms/app.js','assets/dev/work-company-cms.svg','demo/client-portal/styles.css','demo/client-portal/app.js','assets/dev/work-client-portal.svg','demo/booking-os/styles.css','demo/booking-os/app.js','assets/dev/work-booking-os.svg','demo/vendor-desk/styles.css','demo/vendor-desk/app.js','assets/dev/work-vendor-desk.svg','demo/membership-admin/styles.css','demo/membership-admin/app.js','assets/dev/work-membership-admin.svg','demo/support-desk/styles.css','demo/support-desk/app.js','assets/dev/work-support-desk.svg','demo/project-room/styles.css','demo/project-room/app.js','assets/dev/work-project-room.svg','demo/quote-flow/styles.css','demo/quote-flow/app.js','assets/dev/work-quote-flow.svg'];
const errors=[];
for(const file of [...required,...adminRequired,...demoRequired])if(!fs.existsSync(path.join(root,file)))errors.push(`Missing required file: ${file}`);

const localRef=/\b(?:href|src)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g;
function checkLocalRefs(page,html){localRef.lastIndex=0;let match;while((match=localRef.exec(html))){const ref=match[1].trim();if(!ref||/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(ref))continue;let resolved=path.resolve(root,path.dirname(page),ref);if(!resolved.startsWith(root))continue;if(fs.existsSync(resolved)||fs.existsSync(resolved+'.html')||fs.existsSync(path.join(resolved,'index.html')))continue;errors.push(`${page}: broken local reference -> ${ref}`)}}
function checkSeo(page,html){
  const requiredPatterns=[
    ['title',/<title>[^<]+<\/title>/i],
    ['description',/<meta\s+name=["']description["'][^>]+content=["'][^"']{40,}["']/i],
    ['keywords',/<meta\s+name=["']keywords["'][^>]+content=["'][^"']+["']/i],
    ['robots index',/<meta\s+name=["']robots["'][^>]+content=["'][^"']*index,follow/i],
    ['canonical',/<link\s+rel=["']canonical["'][^>]+href=["']https:\/\/aesost\.com/i],
    ['og:title',/<meta\s+property=["']og:title["'][^>]+content=/i],
    ['og:description',/<meta\s+property=["']og:description["'][^>]+content=/i],
    ['og:url',/<meta\s+property=["']og:url["'][^>]+content=["']https:\/\/aesost\.com/i],
    ['twitter:title',/<meta\s+name=["']twitter:title["'][^>]+content=/i],
    ['twitter:description',/<meta\s+name=["']twitter:description["'][^>]+content=/i],
    ['JSON-LD',/<script[^>]+id=["']aesost-seo-schema["'][^>]+application\/ld\+json/i]
  ];
  for(const [label,pattern] of requiredPatterns)if(!pattern.test(html))errors.push(`${page}: missing or invalid SEO ${label}`);
  const head=html.match(/<head>[\s\S]*?<\/head>/i)?.[0]||'';
  if(/커리어 성장|커리어 자산|매거진|아티클|칼럼|지식 플랫폼|아카데미/i.test(head))errors.push(`${page}: legacy academy/content-platform SEO copy remains`);
  if(!html.includes('inquiry-widget.css'))errors.push(`${page}: floating inquiry widget stylesheet missing`);
  if(!html.includes('inquiry-widget.js'))errors.push(`${page}: floating inquiry widget script missing`);
}
for(const page of pages){const full=path.join(root,page);if(!fs.existsSync(full)){errors.push(`Missing page: ${page}`);continue}const html=fs.readFileSync(full,'utf8');if(!html.includes('data-dev-header'))errors.push(`${page}: missing shared header`);if(!html.includes('data-dev-footer'))errors.push(`${page}: missing shared footer`);if(!html.includes('dev-shell.js'))errors.push(`${page}: missing dev-shell.js`);checkLocalRefs(page,html);checkSeo(page,html)}

const shell=fs.readFileSync(path.join(root,'dev-shell.js'),'utf8');
if(!shell.includes('universal-web-system.css'))errors.push('dev-shell.js: universal web design system is not injected globally');
if(!shell.includes('site-polish.css'))errors.push('dev-shell.js: final site polish is not injected globally');
if(!shell.includes('motion-widgets.css'))errors.push('dev-shell.js: motion widget layer is not injected globally');
if(!shell.includes('alignment-system.css'))errors.push('dev-shell.js: shared alignment system is not injected globally');
if(!shell.includes('light-theme.css'))errors.push('dev-shell.js: light theme is not injected globally');
if(!shell.includes('solution-custom-fit.css'))errors.push('dev-shell.js: tailored workflow section stylesheet is not injected');
if(!shell.includes('solutionFitCopy')||!shell.includes('BUILT AROUND YOUR WORKFLOW'))errors.push('dev-shell.js: tailored workflow messaging is missing');
if(!shell.includes('aesost-logo-dark.svg'))errors.push('dev-shell.js: dark logo variant is not used for light theme');
if(!shell.includes('custom-development.css')||!shell.includes('CUSTOM DEVELOPMENT'))errors.push('dev-shell.js: global custom development message is missing');
const fitPages=['solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html','solution-booking-os.html','solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html','solution-project-room.html','solution-quote-flow.html'];for(const page of fitPages)if(!shell.includes(`'${page}':{title:`))errors.push(`dev-shell.js: missing tailored workflow copy for ${page}`);

const alignment=fs.readFileSync(path.join(root,'alignment-system.css'),'utf8');if(!alignment.includes('.shell.solution-intro-grid'))errors.push('alignment-system.css: solution detail intro grid must preserve shared shell width');if(/\.section-head,\s*\.solution-intro-grid[\s\S]{0,220}width:100%!important/.test(alignment))errors.push('alignment-system.css: solution intro grid must not be expanded to viewport width');
const solutionsIndex=fs.readFileSync(path.join(root,'system-solutions.html'),'utf8');if(!solutionsIndex.includes('solutions-index.css'))errors.push('system-solutions.html: missing solutions index stylesheet');
const projectRoom=fs.readFileSync(path.join(root,'solution-project-room.html'),'utf8');if(!projectRoom.includes('project-room.css'))errors.push('solution-project-room.html: missing Project Room refinement stylesheet');

for(const page of demoPages){const full=path.join(root,page);if(!fs.existsSync(full)){errors.push(`Missing demo page: ${page}`);continue}const html=fs.readFileSync(full,'utf8');if(!html.includes('system-ui.css'))errors.push(`${page}: missing AESOST System UI stylesheet`);checkLocalRefs(page,html)}

const requestHtml=fs.readFileSync(path.join(root,'request.html'),'utf8');if(!requestHtml.includes('request-form.js'))errors.push('request.html: project request form script missing');
const requestForm=fs.readFileSync(path.join(root,'request-form.js'),'utf8');
const inquiryWidget=fs.readFileSync(path.join(root,'inquiry-widget.js'),'utf8');
const inquiryCss=fs.readFileSync(path.join(root,'inquiry-widget.css'),'utf8');
const firestoreRules=fs.readFileSync(path.join(root,'firestore.rules'),'utf8');
const requestFields=['company','name','phone','email','projectTypes','description','budget','schedule','contactMethod','source','status','createdAt'];
for(const source of [{name:'request-form.js',text:requestForm},{name:'inquiry-widget.js',text:inquiryWidget}]){
  if(!source.text.includes("collection(db,'projectRequests')"))errors.push(`${source.name}: projectRequests collection is not used`);
  if(!source.text.includes("source:'aesost.com/request'"))errors.push(`${source.name}: source must match deployed Firestore rule`);
  if(!source.text.includes("status:'new'"))errors.push(`${source.name}: new inquiry status missing`);
  for(const field of requestFields)if(!source.text.includes(`${field}:`)&&!source.text.includes(`${field},`))errors.push(`${source.name}: missing project request field ${field}`);
}
if(!/match \/projectRequests\/\{requestId\}/.test(firestoreRules))errors.push('firestore.rules: projectRequests rule block missing');
if(!firestoreRules.includes('allow list, get: if isAdmin();'))errors.push('firestore.rules: admin projectRequests read permission missing');
if(!firestoreRules.includes('allow update, delete: if isAdmin();'))errors.push('firestore.rules: admin projectRequests update permission missing');
for(const field of requestFields)if(!firestoreRules.includes(`'${field}'`)&&!firestoreRules.includes(`.${field}`))errors.push(`firestore.rules: projectRequests field ${field} missing`);
for(const method of ['이메일','전화','온라인 미팅'])if(!firestoreRules.includes(`'${method}'`))errors.push(`firestore.rules: contact method ${method} missing`);
if(!inquiryCss.includes('position:fixed')||!inquiryCss.includes('@media(max-width:767px)'))errors.push('inquiry-widget.css: responsive fixed widget rules missing');
if(!inquiryCss.includes('prefers-reduced-motion'))errors.push('inquiry-widget.css: reduced motion support missing');

const loginHtml=fs.readFileSync(path.join(root,'login.html'),'utf8');if(!loginHtml.includes('login-current.css'))errors.push('login.html: current login stylesheet is missing');if(!loginHtml.includes('dev-shell.js'))errors.push('login.html: current shared header shell is missing');if(!loginHtml.includes('firebase-auth.js'))errors.push('login.html: Firebase auth module is missing');if(!loginHtml.includes('aesost-logo-dark.svg'))errors.push('login.html: current dark AESOST logo is missing');if(loginHtml.includes('script.js')||loginHtml.includes('auth-aesost.css')||loginHtml.includes('styles.css'))errors.push('login.html: legacy content-platform login assets must not be loaded');if(/매거진|아티클|칼럼|커리어 기록|지식을 얻고/.test(loginHtml))errors.push('login.html: legacy content-platform copy remains');checkLocalRefs('login.html',loginHtml);
const authJs=fs.readFileSync(path.join(root,'firebase-auth.js'),'utf8');if(/wavelab:saved|WAVELAB_AUTH_USER|applyMemberAccess|bookmark-button|member-locked|나의 레퍼런스|커리어 자산/i.test(authJs))errors.push('firebase-auth.js: legacy content platform auth/bookmark code remains');

const adminHtml=fs.readFileSync(path.join(root,'admin/index.html'),'utf8');if(!adminHtml.includes('admin-current.css'))errors.push('admin/index.html: current admin stylesheet is missing');if(adminHtml.includes('admin.css?')||adminHtml.includes('admin-account.css'))errors.push('admin/index.html: legacy admin styles must not be loaded');if(!adminHtml.includes('aesost-logo-dark.svg'))errors.push('admin/index.html: light admin must use dark AESOST logo');if(!adminHtml.includes('admin-entry.js'))errors.push('admin/index.html: admin entry module is missing');for(const view of ['dashboard','requests','solutions','visitors','members'])if(!adminHtml.includes(`data-admin-view="${view}"`))errors.push(`admin/index.html: missing ${view} admin view`);checkLocalRefs('admin/index.html',adminHtml);
const adminEntry=fs.readFileSync(path.join(root,'admin/admin-entry.js'),'utf8');for(const module of ['admin-business-dashboard.js','admin-visitor-analytics.js','admin-owner-dashboard.js'])if(!adminEntry.includes(module))errors.push(`admin-entry.js: ${module} is not loaded`);
const adminBusiness=fs.readFileSync(path.join(root,'admin/admin-business-dashboard.js'),'utf8');if(!adminBusiness.includes("collection(db,'projectRequests')"))errors.push('admin-business-dashboard.js: projectRequests are not connected');if(!adminBusiness.includes("doc(db,'projectRequests',id)"))errors.push('admin-business-dashboard.js: projectRequests status updates are not connected');if(!adminBusiness.includes('showView')||!adminBusiness.includes('data-admin-view'))errors.push('admin-business-dashboard.js: tabbed admin navigation is missing');if(!adminBusiness.includes('LIVE SOLUTION'))errors.push('admin-business-dashboard.js: solution overview is missing');
const adminCss=fs.readFileSync(path.join(root,'admin/admin-current.css'),'utf8');if(/#(?:315540|1d3127|9dd7af|edf8f0|438055)/i.test(adminCss))errors.push('admin-current.css: legacy green status colors remain');

const legacyHtmlPatterns=[/^article/i,/^magazine/i,/^column/i,/^overseas-/i,/^reference/i,/^expert-/i,/^career-/i,/^news/i,/^notice/i,/^class/i,/^study-/i,/^community/i,/^ability/i,/^mypage/i,/^my-references/i,/^columnist-/i];
for(const name of fs.readdirSync(root))if(name.endsWith('.html')&&legacyHtmlPatterns.some(pattern=>pattern.test(name)))errors.push(`Legacy academy/content page still present in deploy artifact: ${name}`);
for(const asset of ['styles.css','aesost-theme.css','auth-aesost.css','script.js','member-gate.css','wavelab-philosophy.css','magazine-extra.js','magazine-titles.js'])if(fs.existsSync(path.join(root,asset)))errors.push(`Legacy academy/content asset still present in deploy artifact: ${asset}`);

const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const page of pages){const url=page==='index.html'?'https://aesost.com/':`https://aesost.com/${page}`;if(!sitemap.includes(`<loc>${url}</loc>`))errors.push(`sitemap.xml: missing ${url}`)}if(/magazine|article|column|reference|career|news|notice/i.test(sitemap))errors.push('sitemap.xml: legacy content URLs remain');
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');for(const directive of ['Disallow: /admin/','Disallow: /login.html','Disallow: /demo/','Sitemap: https://aesost.com/sitemap.xml'])if(!robots.includes(directive))errors.push(`robots.txt: missing ${directive}`);if(/Disallow: \/(?:magazine|article|column|reference|career|news|notice)/i.test(robots))errors.push('robots.txt: legacy routes should be crawlable as 404 for deindexing');
const manifest=fs.readFileSync(path.join(root,'site.webmanifest'),'utf8');if(/커리어|매거진|아카데미/i.test(manifest))errors.push('site.webmanifest: legacy positioning remains');if(!manifest.includes('기업 홈페이지')||!manifest.includes('업무 시스템'))errors.push('site.webmanifest: current AESOST positioning is missing');
const workflow=fs.readFileSync(path.join(root,'.github/workflows/deploy-pages.yml'),'utf8');if(!workflow.includes('node scripts/prune-legacy.mjs'))errors.push('Deploy workflow: legacy prune step missing');if(!workflow.includes('node scripts/apply-seo.mjs'))errors.push('Deploy workflow: SEO build step missing');

const devAssets=['assets/dev/hero-system.svg','assets/dev/work-crm.svg','assets/dev/work-proposal.svg','assets/dev/work-nowthere.svg','assets/dev/work-relim.svg','assets/dev/work-solodesk.svg','assets/dev/work-b2b-inquiry.svg','assets/dev/work-company-cms.svg','assets/dev/work-client-portal.svg','assets/dev/work-booking-os.svg','assets/dev/work-vendor-desk.svg','assets/dev/work-membership-admin.svg','assets/dev/work-support-desk.svg','assets/dev/work-project-room.svg','assets/dev/work-quote-flow.svg'];for(const asset of devAssets)if(!fs.existsSync(path.join(root,asset)))errors.push(`Missing visual asset: ${asset}`);
for(const script of ['scripts/apply-seo.mjs','scripts/prune-legacy.mjs','inquiry-widget.js','request-form.js','dev-shell.js','firebase-auth.js','solution-solodesk.js','solution-b2b-inquiry.js','solution-company-cms.js','solution-client-portal.js','solution-booking-os.js','solution-vendor-desk.js','solution-membership-admin.js','solution-support-desk.js','solution-project-room.js','solution-quote-flow.js','admin/admin-entry.js','admin/admin-owner-dashboard.js','admin/admin-visitor-analytics.js','admin/admin-business-dashboard.js','demo/solodesk/app.js','demo/solodesk/guide.js','demo/b2b-inquiry/app.js','demo/b2b-inquiry/guide.js','demo/company-cms/app.js','demo/client-portal/app.js','demo/booking-os/app.js','demo/vendor-desk/app.js','demo/membership-admin/app.js','demo/support-desk/app.js','demo/project-room/app.js','demo/quote-flow/app.js']){const result=spawnSync(process.execPath,['--check',path.join(root,script)],{encoding:'utf8'});if(result.status!==0)errors.push(`${script}: JavaScript syntax check failed\n${result.stderr.trim()}`)}

if(errors.length){console.error('\nAESOST site validation failed:\n- '+errors.join('\n- '));process.exit(1)}
console.log(`AESOST QA passed: ${pages.length} current pages + inquiry flow + Firestore contract + login + ${demoPages.length} demos + admin + legacy cleanup checked.`);
