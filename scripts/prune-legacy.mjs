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
const legacyAssets=[
  'styles.css','aesost-theme.css','auth-aesost.css','script.js','refine.css','member-gate.css','mobile-spacing.css','grid-four.css',
  'wavelab-philosophy.css','search-refine.css','image-fallback.css','real-content.css','magazine-extra.js','magazine-titles.js',
  'article-brunch.css','article-detail.css','article-detail.js','columnist-access.js','site-enhance.js','reference-save.css','reference-save.js'
];

const removed=[];
for(const name of fs.readdirSync(root)){
  if(!name.endsWith('.html')||keepHtml.has(name))continue;
  if(!legacyHtmlPatterns.some(pattern=>pattern.test(name)))continue;
  fs.rmSync(path.join(root,name),{force:true});
  removed.push(name);
}
for(const name of legacyAssets){
  const full=path.join(root,name);
  if(fs.existsSync(full)){
    fs.rmSync(full,{force:true});
    removed.push(name);
  }
}
console.log(`Pruned ${removed.length} legacy academy/content-platform files from deploy artifact.`);
if(removed.length)console.log(removed.sort().join('\n'));
