import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const keepHtml=new Set([
  'index.html','about.html','services.html','system-solutions.html','works.html','request.html','login.html','404.html',
  'solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html','solution-booking-os.html','solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html','solution-project-room.html','solution-quote-flow.html'
]);
const legacyHtmlPatterns=[
  /^article/i,/^magazine/i,/^column/i,/^overseas-/i,/^reference/i,/^expert-/i,/^career-/i,
  /^news/i,/^notice/i,/^class/i,/^study-/i,/^community/i,/^ability/i,/^mypage/i,/^my-references/i,/^columnist-/i
];
const legacyAssetPatterns=[
  /^ability/i,/^article/i,/^column/i,/^community/i,/^career-/i,/^expert-/i,/^magazine/i,/^mypage/i,/^news/i,/^notice/i,
  /^overseas-/i,/^reference/i,/^columnist-/i,/^content-detail/i,/^static-column/i,/^editorial-review/i,
  /^home-(?:latest|guide|star)/i,/^login\.css$/i,/^visitor-analytics\.js$/i,/^admin-config\.js$/i
];
const legacyAssets=new Set([
  'styles.css','aesost-theme.css','auth-aesost.css','script.js','refine.css','member-gate.css','mobile-spacing.css','grid-four.css',
  'wavelab-philosophy.css','search-refine.css','image-fallback.css','real-content.css','site-enhance.js'
]);

const removed=[];
for(const name of fs.readdirSync(root)){
  const full=path.join(root,name);
  const stat=fs.statSync(full);
  if(stat.isDirectory())continue;
  if(name.endsWith('.html')){
    if(keepHtml.has(name))continue;
    if(legacyHtmlPatterns.some(pattern=>pattern.test(name))){fs.rmSync(full,{force:true});removed.push(name)}
    continue;
  }
  if(legacyAssets.has(name)||(['.js','.css','.json'].includes(path.extname(name).toLowerCase())&&legacyAssetPatterns.some(pattern=>pattern.test(name)))){
    fs.rmSync(full,{force:true});
    removed.push(name);
  }
}

const assetsDir=path.join(root,'assets');
if(fs.existsSync(assetsDir)){
  for(const name of fs.readdirSync(assetsDir)){
    if(name==='dev')continue;
    fs.rmSync(path.join(assetsDir,name),{recursive:true,force:true});
    removed.push(`assets/${name}`);
  }
}

const adminDir=path.join(root,'admin');
for(const name of ['admin.css','admin-account.css','admin-account.js']){
  const full=path.join(adminDir,name);
  if(fs.existsSync(full)){fs.rmSync(full,{force:true});removed.push(`admin/${name}`)}
}

console.log(`Pruned ${removed.length} legacy academy/content-platform files from deploy artifact.`);
if(removed.length)console.log(removed.sort().join('\n'));
