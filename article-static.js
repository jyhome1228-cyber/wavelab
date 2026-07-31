import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const body=document.body;
const id=body.dataset.articleId||location.pathname;
const title=body.dataset.articleTitle||document.title;
const category=body.dataset.articleCategory||'WAVELAB ARTICLE';
const href=location.pathname.split('/').pop();
const saveButton=document.querySelector('[data-article-save]');
const shareButton=document.querySelector('[data-article-share]');
let user=null;
const key=uid=>`wavelab:saved:${uid}`;
const read=uid=>{try{return JSON.parse(localStorage.getItem(key(uid))||'[]')}catch{return[]}};
const render=()=>{if(!saveButton)return;saveButton.textContent=user&&read(user.uid).some(x=>x.id===id)?'저장됨 ✓':'저장하기'};
saveButton?.addEventListener('click',()=>{
  if(!user){location.href=`login.html?next=${encodeURIComponent(href)}`;return;}
  const items=read(user.uid);const exists=items.some(x=>x.id===id);
  const next=exists?items.filter(x=>x.id!==id):[{id,title,href,category,savedAt:Date.now()},...items];
  localStorage.setItem(key(user.uid),JSON.stringify(next));render();
});
shareButton?.addEventListener('click',async event=>{
  try{if(navigator.share)await navigator.share({title,text:title,url:location.href});else{await navigator.clipboard.writeText(location.href);event.currentTarget.textContent='링크 복사됨';setTimeout(()=>event.currentTarget.textContent='공유하기',1600)}}catch{}
});
onAuthStateChanged(auth,current=>{user=current;render()});
