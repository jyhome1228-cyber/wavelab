import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=[
  'index.html','about.html','services.html','system-solutions.html','works.html','technology.html','request.html','login.html','404.html',
  'solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html',
  'solution-booking-os.html','solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html',
  'solution-project-room.html','solution-quote-flow.html'
];

const css='company-polish.css?v=20260911-1';
const tag=`  <link id="aesost-company-polish-css" rel="stylesheet" href="${css}">`;
const errors=[];

if(!fs.existsSync(path.join(root,'company-polish.css')))errors.push('company-polish.css is missing');

for(const file of pages){
  const full=path.join(root,file);
  if(!fs.existsSync(full)){errors.push(`missing page: ${file}`);continue}
  let html=fs.readFileSync(full,'utf8');
  if(/id=["']aesost-company-polish-css["']/.test(html)){
    html=html.replace(/<link[^>]+id=["']aesost-company-polish-css["'][^>]*>/i,tag.trim());
  }else{
    html=html.replace(/<\/head>/i,`${tag}\n</head>`);
  }
  fs.writeFileSync(full,html);
}

// The professional layer should always be the final visual stylesheet in the document head.
for(const file of pages){
  const full=path.join(root,file);
  if(!fs.existsSync(full))continue;
  const html=fs.readFileSync(full,'utf8');
  if(!html.includes('aesost-company-polish-css'))errors.push(`${file}: professional polish stylesheet missing`);
}

if(errors.length){
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Applied professional company polish to ${pages.length} deployed pages.`);
