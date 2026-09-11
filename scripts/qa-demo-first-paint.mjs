import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const demos=[
  'solodesk','b2b-inquiry','company-cms','client-portal','booking-os',
  'vendor-desk','membership-admin','support-desk','project-room','quote-flow'
];
const directFix={
  'solodesk':{bodyClass:'solodesk-demo-light',cssId:'solodesk-demo-light-css'},
  'b2b-inquiry':{bodyClass:'b2b-demo-light',cssId:'b2b-demo-light-css'}
};

const ensureHeadTag=(html,needle,tag)=>html.includes(needle)?html:html.replace(/<\/head>/i,`  ${tag}\n</head>`);
const replaceOrInsert=(html,regex,tag)=>regex.test(html)?html.replace(regex,tag):html.replace(/<\/head>/i,`  ${tag}\n</head>`);
const critical='<style id="aesost-demo-critical-light">html,body{margin:0;background:#f6f7f9!important;color-scheme:light}</style>';

for(const slug of demos){
  const file=path.join(root,'demo',slug,'index.html');
  if(!fs.existsSync(file))throw new Error(`Missing demo: ${slug}`);
  let html=fs.readFileSync(file,'utf8');

  html=replaceOrInsert(html,/<meta\s+name=["']theme-color["'][^>]*>/i,'<meta name="theme-color" content="#ffffff">');
  html=replaceOrInsert(html,/<meta\s+name=["']color-scheme["'][^>]*>/i,'<meta name="color-scheme" content="light">');
  html=ensureHeadTag(html,'aesost-demo-critical-light',critical);

  const fix=directFix[slug];
  if(fix){
    html=ensureHeadTag(html,`id="${fix.cssId}"`,`<link id="${fix.cssId}" rel="stylesheet" href="light.css?v=20260911-2">`);
    if(!new RegExp(`<body[^>]*class=["'][^"']*\\b${fix.bodyClass}\\b`,'i').test(html)){
      if(/<body\b[^>]*class=["']/i.test(html)){
        html=html.replace(/<body([^>]*class=["'])([^"']*)(["'][^>]*)>/i,`<body$1$2 ${fix.bodyClass}$3>`);
      }else{
        html=html.replace(/<body([^>]*)>/i,`<body class="${fix.bodyClass}"$1>`);
      }
    }
  }
  fs.writeFileSync(file,html);
}

const errors=[];
for(const slug of demos){
  const rel=path.join('demo',slug,'index.html');
  const file=path.join(root,rel);
  const html=fs.readFileSync(file,'utf8');
  if(!/<meta\s+name=["']theme-color["'][^>]+content=["']#(?:fff|ffffff)["']/i.test(html))errors.push(`${slug}: theme-color is not white`);
  if(!/<meta\s+name=["']color-scheme["'][^>]+content=["']light["']/i.test(html))errors.push(`${slug}: color-scheme is not light`);
  if(!/aesost-demo-critical-light/.test(html))errors.push(`${slug}: missing critical light paint`);
  if(!/light\.css/i.test(html))errors.push(`${slug}: missing direct light stylesheet`);
  if(!/<meta\s+name=["']robots["'][^>]+noindex/i.test(html))errors.push(`${slug}: demo must remain noindex`);

  const refRe=/\b(?:href|src)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g;
  let match;
  while((match=refRe.exec(html))){
    const ref=match[1];
    if(/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(ref))continue;
    const target=path.resolve(path.dirname(file),ref);
    if(fs.existsSync(target)||fs.existsSync(target+'.html')||fs.existsSync(path.join(target,'index.html')))continue;
    errors.push(`${slug}: broken local reference -> ${ref}`);
  }
}

if(errors.length){
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Demo QA hardened ${demos.length} interactive demos; SoloDesk and B2B Inquiry now load light mode before first paint.`);
