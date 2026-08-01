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
const canonicalUrl=()=>{
  const url=new URL(location.href);
  url.protocol='https:';
  url.hash='';
  ['v','_','cache'].forEach(name=>url.searchParams.delete(name));
  return url.toString();
};

function ensureShareModal(){
  let modal=document.querySelector('[data-share-modal]');
  if(modal)return modal;
  modal=document.createElement('div');
  modal.className='share-modal';
  modal.dataset.shareModal='';
  modal.setAttribute('aria-hidden','true');
  modal.innerHTML=`<div class="share-modal-backdrop" data-share-close></div><section class="share-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="share-modal-title"><div class="share-modal-head"><div><span>SHARE</span><h2 id="share-modal-title">콘텐츠 공유하기</h2></div><button type="button" class="share-modal-close" data-share-close aria-label="공유 팝업 닫기">×</button></div><p class="share-modal-title-text"></p><div class="share-modal-actions"><button type="button" class="share-action kakao" data-share-kakao><b>카카오톡</b><span>친구에게 공유하기</span></button><button type="button" class="share-action" data-share-copy><b>링크 복사</b><span>현재 주소 복사하기</span></button><button type="button" class="share-action" data-share-email><b>이메일</b><span>메일로 공유하기</span></button></div><p class="share-modal-status" data-share-status aria-live="polite"></p></section>`;
  document.body.appendChild(modal);
  modal.querySelector('.share-modal-title-text').textContent=title;
  modal.querySelectorAll('[data-share-close]').forEach(button=>button.addEventListener('click',()=>closeShareModal(modal)));
  modal.querySelector('[data-share-kakao]')?.addEventListener('click',()=>{
    const shareUrl=canonicalUrl();
    const kakaoUrl=`https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(shareUrl)}`;
    window.open(kakaoUrl,'wavelab-kakao-share','width=480,height=720,noopener,noreferrer');
  });
  modal.querySelector('[data-share-copy]')?.addEventListener('click',async()=>{
    const status=modal.querySelector('[data-share-status]');
    try{
      await navigator.clipboard.writeText(canonicalUrl());
      status.textContent='링크를 복사했습니다.';
    }catch{
      const input=document.createElement('textarea');
      input.value=canonicalUrl();document.body.appendChild(input);input.select();document.execCommand('copy');input.remove();
      status.textContent='링크를 복사했습니다.';
    }
  });
  modal.querySelector('[data-share-email]')?.addEventListener('click',()=>{
    const subject=encodeURIComponent(`[WAVELAB] ${title}`);
    const message=encodeURIComponent(`${title}\n\n${canonicalUrl()}`);
    location.href=`mailto:?subject=${subject}&body=${message}`;
  });
  modal.addEventListener('keydown',event=>{if(event.key==='Escape')closeShareModal(modal)});
  return modal;
}
function openShareModal(){const modal=ensureShareModal();modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('share-modal-open');modal.querySelector('.share-modal-close')?.focus()}
function closeShareModal(modal=ensureShareModal()){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('share-modal-open');shareButton?.focus()}

saveButton?.addEventListener('click',()=>{
  if(!user){location.href=`login.html?next=${encodeURIComponent(href)}`;return;}
  const items=read(user.uid);const exists=items.some(x=>x.id===id);
  const next=exists?items.filter(x=>x.id!==id):[{id,title,href,category,savedAt:Date.now()},...items];
  localStorage.setItem(key(user.uid),JSON.stringify(next));render();
});
shareButton?.addEventListener('click',openShareModal);
onAuthStateChanged(auth,current=>{user=current;render()});
