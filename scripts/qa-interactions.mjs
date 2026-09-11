import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const demoNames=['solodesk','b2b-inquiry','company-cms','client-portal','booking-os','vendor-desk','membership-admin','support-desk','project-room','quote-flow'];
const solutionPages=[
  'solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html','solution-booking-os.html',
  'solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html','solution-project-room.html','solution-quote-flow.html'
];
const publicPages=['index.html','about.html','services.html','system-solutions.html','works.html','technology.html','request.html','login.html','404.html',...solutionPages];
const errors=[];

const camel=value=>value.replace(/^data-/,'').replace(/-([a-z])/g,(_,c)=>c.toUpperCase());
const buttonTags=html=>[...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)].map(match=>({attrs:match[1],body:match[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()}));
const dataAttrs=attrs=>[...attrs.matchAll(/\b(data-[\w-]+)(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi)].map(match=>match[1].toLowerCase());

// 1) Harden demo persistence. A blocked/disabled localStorage must never make UI buttons stop working.
for(const name of demoNames){
  const dir=path.join(root,'demo',name);
  const htmlPath=path.join(dir,'index.html');
  const appPath=path.join(dir,'app.js');
  if(!fs.existsSync(htmlPath)||!fs.existsSync(appPath)){
    errors.push(`${name}: demo files missing`);
    continue;
  }

  const html=fs.readFileSync(htmlPath,'utf8');
  let app=fs.readFileSync(appPath,'utf8');

  const replacements=[
    ['function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}','function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}'],
    ['function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}','function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}'],
    ['function save(){localStorage.setItem(K,JSON.stringify(state))}','function save(){try{localStorage.setItem(K,JSON.stringify(state))}catch{}}'],
    ['function save(){localStorage.setItem(KEY,JSON.stringify(state))}','function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}']
  ];
  for(const [from,to] of replacements)app=app.replaceAll(from,to);
  fs.writeFileSync(appPath,app);

  if(/function (?:saveState|save)\(\)\{localStorage\.setItem\(/.test(app)){
    errors.push(`${name}: unsafe localStorage write remains`);
  }

  const syntax=spawnSync(process.execPath,['--check',appPath],{encoding:'utf8'});
  if(syntax.status!==0)errors.push(`${name}: app.js syntax invalid after interaction hardening\n${(syntax.stderr||syntax.stdout||'').trim()}`);

  // Every static non-submit button in a demo must expose a data hook referenced by app.js.
  for(const button of buttonTags(html)){
    if(/\btype\s*=\s*["']submit["']/i.test(button.attrs))continue;
    const hooks=dataAttrs(button.attrs);
    if(hooks.length===0){
      errors.push(`${name}: button without interaction hook: ${button.body||'(icon button)'}`);
      continue;
    }
    const mapped=hooks.some(hook=>app.includes(hook)||app.includes(camel(hook)));
    if(!mapped)errors.push(`${name}: unmapped button hook ${hooks.join(', ')} (${button.body||'icon'})`);
  }

  // Dynamic buttons emitted by templates must have a second reference that binds/handles them.
  const dynamicHooks=[...app.matchAll(/<button[^>]*\b(data-[\w-]+)/gi)].map(match=>match[1]);
  for(const hook of new Set(dynamicHooks)){
    const count=app.split(hook).length-1;
    if(count<2)errors.push(`${name}: dynamic button ${hook} is rendered but has no handler reference`);
  }
}

// 2) Guided previews are interactive demos. Do not rely on a later override to re-enable pointer events.
const detailCssPath=path.join(root,'solution-detail.css');
if(fs.existsSync(detailCssPath)){
  let css=fs.readFileSync(detailCssPath,'utf8');
  css=css.replace(/(\.solution-feature-frame-wrap iframe\{[^}]*?)pointer-events\s*:\s*none/gi,'$1pointer-events:auto');
  fs.writeFileSync(detailCssPath,css);
  const iframeRule=(css.match(/\.solution-feature-frame-wrap iframe\{[^}]*\}/i)||[''])[0];
  if(!/pointer-events\s*:\s*auto/i.test(iframeRule))errors.push('solution-detail.css: guided preview iframe is not interactive');
}else errors.push('solution-detail.css missing');

// Cache-bust the shared detail CSS everywhere it is used.
for(const file of solutionPages){
  const full=path.join(root,file);
  if(!fs.existsSync(full)){errors.push(`${file}: missing`);continue}
  let html=fs.readFileSync(full,'utf8');
  html=html.replace(/solution-detail\.css\?v=[^'"\s<]+/g,'solution-detail.css?v=20260911-4');
  fs.writeFileSync(full,html);

  const scriptMatch=html.match(/<script\s+src=["'](solution-[^"']+\.js)(?:\?[^"']*)?["'][^>]*><\/script>/i);
  if(!scriptMatch){errors.push(`${file}: solution controller script missing`);continue}
  const controllerPath=path.join(root,scriptMatch[1]);
  if(!fs.existsSync(controllerPath)){errors.push(`${file}: controller ${scriptMatch[1]} missing`);continue}
  const controller=fs.readFileSync(controllerPath,'utf8');
  const tabs=[...html.matchAll(/data-solution-tab=["']([^"']+)["']/g)].map(match=>match[1]);
  if(tabs.length===0)errors.push(`${file}: no guided preview tabs`);
  for(const tab of tabs){
    if(!controller.includes(tab))errors.push(`${file}: tab '${tab}' is not mapped in controller`);
  }
}

// 3) Public-page button sanity: non-submit controls need explicit hooks.
for(const file of publicPages){
  const full=path.join(root,file);
  if(!fs.existsSync(full))continue;
  const html=fs.readFileSync(full,'utf8');
  let scripts='';
  for(const src of [...html.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(match=>match[1].split('?')[0])){
    if(/^https?:\/\//i.test(src))continue;
    const scriptPath=path.resolve(path.dirname(full),src);
    if(fs.existsSync(scriptPath)&&fs.statSync(scriptPath).isFile())scripts+=`\n${fs.readFileSync(scriptPath,'utf8')}`;
  }
  scripts+=`\n${[...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/gi)].map(match=>match[1]).join('\n')}`;

  for(const button of buttonTags(html)){
    if(/\btype\s*=\s*["']submit["']/i.test(button.attrs))continue;
    const hooks=dataAttrs(button.attrs);
    if(hooks.length===0)continue;
    const mapped=hooks.some(hook=>scripts.includes(hook)||scripts.includes(camel(hook))||hook==='data-dev-menu');
    if(!mapped)errors.push(`${file}: public button hook not mapped: ${hooks.join(', ')}`);
  }

  // Hash links must resolve to an element, except password reset which is JS-driven.
  const ids=new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match=>match[1]));
  for(const match of html.matchAll(/<a\b([^>]*?)href=["']#([^"']*)["']([^>]*)>/gi)){
    const attrs=`${match[1]} ${match[3]}`;
    const target=match[2];
    if(/data-reset-password/i.test(attrs))continue;
    if(!target||!ids.has(target))errors.push(`${file}: unresolved hash link #${target}`);
  }
}

// 4) Shared interaction CSS must be present and must explicitly keep guided iframes clickable.
const interactionPath=path.join(root,'enterprise-interaction.css');
if(!fs.existsSync(interactionPath))errors.push('enterprise-interaction.css missing');
else{
  const interaction=fs.readFileSync(interactionPath,'utf8');
  if(!/solution-feature-frame-wrap iframe[\s\S]*?pointer-events\s*:\s*auto/i.test(interaction))errors.push('enterprise-interaction.css: iframe click override missing');
  if(!/font-family\s*:\s*['"]Pretendard/i.test(interaction))errors.push('enterprise-interaction.css: Pretendard control typography rule missing');
}

if(errors.length){
  console.error('Interaction QA failed:\n'+errors.join('\n'));
  process.exit(1);
}
console.log(`Interaction QA passed: ${demoNames.length} demos, ${solutionPages.length} guided previews, ${publicPages.length} public pages.`);
