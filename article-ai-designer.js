import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const sharedStyle=document.createElement('link');
sharedStyle.rel='stylesheet';
sharedStyle.href='real-content.css?v=20260731-3';
document.head.appendChild(sharedStyle);

const metaRows=document.querySelectorAll('.article-meta-card dl > div');
metaRows.forEach(row=>{
  const label=row.querySelector('dt')?.textContent?.trim();
  if(label==='에디터')row.remove();
});
const originLink=document.querySelector('.article-origin-note a');
originLink?.remove();
const originText=document.querySelector('.article-origin-note p');
if(originText)originText.textContent='본 아티클에 사용된 이미지는 AI를 활용해 제작되었습니다.';

const article={
  id:'ai-designer-proof',
  title:'AI 시대, 디자이너는 무엇으로 증명되는가',
  href:'article-ai-designer.html',
  category:'WAVELAB ARTICLE · AI · DESIGN'
};

const saveButton=document.querySelector('[data-article-save]');
const shareButton=document.querySelector('[data-article-share]');
let currentUser=null;
function savedKey(uid){return `wavelab:saved:${uid}`;}
function readSaved(uid){try{return JSON.parse(localStorage.getItem(savedKey(uid))||'[]');}catch{return [];}}
function renderSaveState(){if(!saveButton)return;if(!currentUser){saveButton.textContent='저장하기';return;}const saved=readSaved(currentUser.uid).some(item=>item.id===article.id);saveButton.textContent=saved?'저장됨 ✓':'저장하기';}
saveButton?.addEventListener('click',()=>{if(!currentUser){location.href=`login.html?next=${encodeURIComponent(article.href)}`;return;}const items=readSaved(currentUser.uid);const exists=items.some(item=>item.id===article.id);const next=exists?items.filter(item=>item.id!==article.id):[{...article,savedAt:Date.now()},...items];localStorage.setItem(savedKey(currentUser.uid),JSON.stringify(next));renderSaveState();window.dispatchEvent(new CustomEvent('wavelab:saved-updated'));});
shareButton?.addEventListener('click',async()=>{const data={title:document.title,text:article.title,url:location.href};try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(location.href);shareButton.textContent='링크 복사됨';setTimeout(()=>{shareButton.textContent='공유하기';},1800);}}catch{}});
onAuthStateChanged(auth,user=>{currentUser=user;renderSaveState();});