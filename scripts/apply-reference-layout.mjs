import fs from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd();
const entries=await fs.readdir(root,{withFileTypes:true});
let changed=0;

for(const entry of entries){
  if(!entry.isFile())continue;
  if(!/^reference-.+\.html$/.test(entry.name))continue;
  const file=path.join(root,entry.name);
  let html=await fs.readFile(file,'utf8');
  if(!html.includes('reference-detail-page'))continue;
  const before=html;
  if(/reference-layout-fix\.css\?v=[^"']+/.test(html)){
    html=html.replace(/reference-layout-fix\.css\?v=[^"']+/g,'reference-layout-fix.css?v=20260804-1');
  }else{
    html=html.replace(/<\/head>/i,'  <link rel="stylesheet" href="reference-layout-fix.css?v=20260804-1">\n</head>');
  }
  if(html!==before){
    await fs.writeFile(file,html);
    changed+=1;
  }
}

console.log(`Applied reference layout stylesheet to ${changed} pages.`);