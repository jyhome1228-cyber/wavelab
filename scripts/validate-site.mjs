import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=['index.html','about.html','services.html','works.html','request.html'];
const required=['dev-site.css','dev-shell.js','aesost-logo.svg','favicon.svg'];
const errors=[];

for(const file of required){
  if(!fs.existsSync(path.join(root,file)))errors.push(`Missing required file: ${file}`);
}

const localRef=/\b(?:href|src)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g;
for(const page of pages){
  const full=path.join(root,page);
  if(!fs.existsSync(full)){errors.push(`Missing page: ${page}`);continue;}
  const html=fs.readFileSync(full,'utf8');
  if(!html.includes('data-dev-header'))errors.push(`${page}: missing shared header`);
  if(!html.includes('data-dev-footer'))errors.push(`${page}: missing shared footer`);
  if(!html.includes('dev-shell.js'))errors.push(`${page}: missing dev-shell.js`);
  let match;
  while((match=localRef.exec(html))){
    const ref=match[1].trim();
    if(!ref||/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(ref))continue;
    const resolved=path.resolve(root,path.dirname(page),ref);
    if(!resolved.startsWith(root))continue;
    if(!fs.existsSync(resolved))errors.push(`${page}: broken local reference -> ${ref}`);
  }
}

const devAssets=['assets/dev/hero-system.svg','assets/dev/work-crm.svg','assets/dev/work-proposal.svg','assets/dev/work-nowthere.svg','assets/dev/work-relim.svg'];
for(const asset of devAssets){if(!fs.existsSync(path.join(root,asset)))errors.push(`Missing visual asset: ${asset}`)}

if(errors.length){
  console.error('\nAESOST site validation failed:\n- '+errors.join('\n- '));
  process.exit(1);
}
console.log(`AESOST site validation passed (${pages.length} core pages checked).`);
