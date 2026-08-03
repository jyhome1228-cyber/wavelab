import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT=process.cwd();
const SCRIPT_VERSION='20260804-5';
const THEME_VERSION='20260804-3';
const HOME_LATEST_VERSION='20260804-2';
const REFERENCE_VERSION='20260804-3';

async function walk(dir){
  const entries=await fs.readdir(dir,{withFileTypes:true});
  const files=[];
  for(const entry of entries){
    if(entry.name==='.git'||entry.name==='node_modules')continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())files.push(...await walk(full));
    else if(entry.isFile()&&entry.name.endsWith('.html'))files.push(full);
  }
  return files;
}

const sharedScriptPath=path.join(ROOT,'script.js');
let sharedScript=await fs.readFile(sharedScriptPath,'utf8');
sharedScript=sharedScript
  .replace(/reference-save\.css\?v=[^"']+/g,'reference-save.css?v=20260804-4')
  .replace(/reference-save\.js\?v=[^"']+/g,'reference-save.js?v=20260804-3');
await fs.writeFile(sharedScriptPath,sharedScript);

const files=await walk(ROOT);
let changed=0;
for(const file of files){
  let html=await fs.readFile(file,'utf8');
  const before=html;

  html=html.replace(/script\.js(?:\?v=[^"']*)?/g,`script.js?v=${SCRIPT_VERSION}`);
  html=html.replace(/aesost-theme\.css(?:\?v=[^"']*)?/g,`aesost-theme.css?v=${THEME_VERSION}`);
  html=html.replace(/reference\.css(?:\?v=[^"']*)?/g,`reference.css?v=${REFERENCE_VERSION}`);
  if(path.basename(file)==='index.html')html=html.replace(/home-latest\.js(?:\?v=[^"']*)?/g,`home-latest.js?v=${HOME_LATEST_VERSION}`);

  if(html.includes('data-header')&&!/src=["']script\.js\?v=/.test(html)){
    html=html.replace(/<\/body>/i,`<script src="script.js?v=${SCRIPT_VERSION}"></script>\n</body>`);
  }

  if(html!==before){
    await fs.writeFile(file,html);
    changed+=1;
  }
}

console.log(`Synced global UI references in ${changed} HTML files.`);