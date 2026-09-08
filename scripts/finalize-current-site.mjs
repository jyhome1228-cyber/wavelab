import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=[
  'index.html','about.html','services.html','system-solutions.html','works.html','request.html','login.html',
  'solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html',
  'solution-booking-os.html','solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html',
  'solution-project-room.html','solution-quote-flow.html'
];

const shellPath=path.join(root,'dev-shell.js');
let shell=fs.readFileSync(shellPath,'utf8');
shell=shell.replace(/site-runtime\.js\?v=[^'"\s)]+/g,'site-runtime.js?v=20260909-1');
fs.writeFileSync(shellPath,shell);

for(const file of pages){
  const full=path.join(root,file);
  if(!fs.existsSync(full))continue;
  let html=fs.readFileSync(full,'utf8');
  html=html.replace(/dev-shell\.js\?v=[^'"\s<]+/g,'dev-shell.js?v=20260909-1');
  fs.writeFileSync(full,html);
}

const runtime=fs.readFileSync(path.join(root,'site-runtime.js'),'utf8');
const footerCss=fs.readFileSync(path.join(root,'footer-current.css'),'utf8');
const required=[
  '에이소스트 (AESOST)','박재영','820-13-02834','인천광역시 서구 원당대로 1039, 9층 915호','정보통신업','응용 소프트웨어 개발 및 공급업'
];
for(const value of required){
  if(!runtime.includes(value))throw new Error(`Business footer missing: ${value}`);
}
if(/부동산업|비주거용 건물 임대업|공유오피스 임대/.test(runtime)){
  throw new Error('Previous rental business classification still remains in footer.');
}
if(/aesost-footer-title/.test(runtime)||/font-size:clamp\(42px/.test(footerCss)){
  throw new Error('Legacy oversized footer treatment still remains.');
}
if(!/background:#f7f7f8/.test(footerCss)||!/color:#17181c/.test(footerCss)){
  throw new Error('Current light business footer palette is not applied.');
}
console.log('Finalized AESOST software-development business footer and refreshed shell/runtime cache.');
