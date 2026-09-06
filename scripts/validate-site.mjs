import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const pages=['index.html','about.html','services.html','system-solutions.html','solution-solodesk.html','works.html','request.html'];
const required=['dev-site.css','dev-operational.css','dev-shell.js','system-ui.css','solution-detail.css','solution-solodesk.js','aesost-logo.svg','favicon.svg'];
const demoPages=['demo/solodesk/index.html'];
const demoRequired=['demo/solodesk/styles.css','demo/solodesk/app.js','demo/solodesk/guide.js','assets/dev/work-solodesk.svg'];
const errors=[];

for(const file of [...required,...demoRequired]){
  if(!fs.existsSync(path.join(root,file)))errors.push(`Missing required file: ${file}`);
}

const localRef=/\b(?:href|src)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g;
function checkLocalRefs(page,html){
  localRef.lastIndex=0;
  let match;
  while((match=localRef.exec(html))){
    const ref=match[1].trim();
    if(!ref||/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(ref))continue;
    let resolved=path.resolve(root,path.dirname(page),ref);
    if(!resolved.startsWith(root))continue;
    if(fs.existsSync(resolved))continue;
    if(fs.existsSync(resolved+'.html'))continue;
    if(fs.existsSync(path.join(resolved,'index.html')))continue;
    errors.push(`${page}: broken local reference -> ${ref}`);
  }
}

for(const page of pages){
  const full=path.join(root,page);
  if(!fs.existsSync(full)){errors.push(`Missing page: ${page}`);continue;}
  const html=fs.readFileSync(full,'utf8');
  if(!html.includes('data-dev-header'))errors.push(`${page}: missing shared header`);
  if(!html.includes('data-dev-footer'))errors.push(`${page}: missing shared footer`);
  if(!html.includes('dev-shell.js'))errors.push(`${page}: missing dev-shell.js`);
  checkLocalRefs(page,html);
}

for(const page of demoPages){
  const full=path.join(root,page);
  if(!fs.existsSync(full)){errors.push(`Missing demo page: ${page}`);continue;}
  const html=fs.readFileSync(full,'utf8');
  if(!html.includes('system-ui.css'))errors.push(`${page}: missing AESOST System UI stylesheet`);
  checkLocalRefs(page,html);
}

const devAssets=['assets/dev/hero-system.svg','assets/dev/work-crm.svg','assets/dev/work-proposal.svg','assets/dev/work-nowthere.svg','assets/dev/work-relim.svg','assets/dev/work-solodesk.svg'];
for(const asset of devAssets){if(!fs.existsSync(path.join(root,asset)))errors.push(`Missing visual asset: ${asset}`)}

for(const script of ['dev-shell.js','solution-solodesk.js','demo/solodesk/app.js','demo/solodesk/guide.js']){
  const result=spawnSync(process.execPath,['--check',path.join(root,script)],{encoding:'utf8'});
  if(result.status!==0)errors.push(`${script}: JavaScript syntax check failed\n${result.stderr.trim()}`);
}

if(errors.length){
  console.error('\nAESOST site validation failed:\n- '+errors.join('\n- '));
  process.exit(1);
}
console.log(`AESOST site validation passed (${pages.length} core pages + ${demoPages.length} demo checked, guided solution flow enabled).`);
