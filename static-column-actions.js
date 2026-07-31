import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const saveButton=document.querySelector('[data-static-save]');
const shareButton=document.querySelector('[data-static-share]');
const meta=document.body.dataset;
let user=null;
const item={id:meta.columnId||location.pathname,title:meta.columnTitle||document.title,href:location.pathname.split('/').pop(),category:'COLUMN'};
const key=uid=>`wavelab:saved:${uid}`;
const read=uid=>{try{return JSON.parse(localStorage.getItem(key(uid))||'[]')}catch{return[]}};
function render(){if(!saveButton)return;saveButton.textContent=user&&read(user.uid).some(x=>x.id===item.id)?'저장됨 ✓':'저장하기'}
saveButton?.addEventListener('click',()=>{if(!user){location.href=`login.html?next=${encodeURIComponent(item.href)}`;return}const items=read(user.uid);const exists=items.some(x=>x.id===item.id);localStorage.setItem(key(user.uid),JSON.stringify(exists?items.filter(x=>x.id!==item.id):[{...item,savedAt:Date.now()},...items]));render()});
shareButton?.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:item.title,url:location.href});else{await navigator.clipboard.writeText(location.href);shareButton.textContent='링크 복사됨';setTimeout(()=>shareButton.textContent='공유하기',1500)}}catch{}});
onAuthStateChanged(auth,current=>{user=current;render()});