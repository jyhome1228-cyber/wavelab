import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const root=document.querySelector('[data-column-detail]');
const id=new URLSearchParams(location.search).get('id');
let user=null, post=null;
const esc=value=>String(value||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const paragraphs=value=>esc(value).split(/\n\s*\n/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
const date=value=>{const d=value?.toDate?.()||new Date();return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(d)};
function savedKey(uid){return `wavelab:saved:${uid}`}
function readSaved(uid){try{return JSON.parse(localStorage.getItem(savedKey(uid))||'[]')}catch{return[]}}
function render(){
  if(!post)return;
  const own=user?.uid===post.authorUid;
  document.title=`${post.title} — WAVELAB`;
  root.innerHTML=`<section class="article-hero"><div class="shell article-hero-inner"><div><p class="article-eyebrow">COLUMN · ${esc(post.category)}</p><h1>${esc(post.title)}</h1><p class="article-summary">${esc(post.summary)}</p></div><aside class="article-meta-card"><dl><div><dt>발행일</dt><dd>${date(post.publishedAt||post.updatedAt)}</dd></div><div><dt>저자</dt><dd>${esc(post.authorName)}</dd></div><div><dt>분야</dt><dd>${esc(post.category)}</dd></div><div><dt>형식</dt><dd>COLUMN</dd></div></dl><div class="column-detail-actions"><button type="button" data-save>저장하기</button><button type="button" data-share>공유하기</button>${own?`<a href="column-write.html?id=${encodeURIComponent(id)}">수정하기</a>`:''}</div></aside></div></section><section class="shell article-layout"><aside class="article-toc"><strong>AUTHOR</strong><span style="display:block;color:#aaa;font-size:14px;line-height:1.7">${esc(post.authorName)}<br>${esc(post.authorExpertise||'칼럼니스트')}</span></aside><article class="article-body">${paragraphs(post.content)}<section class="column-author-box"><span>ABOUT THE AUTHOR</span><h3>${esc(post.authorName)}</h3><p>${esc(post.authorBio||'자신의 경험과 관점을 웨이블랩 독자들과 나누는 칼럼니스트입니다.')}</p></section></article></section>`;
  const save=root.querySelector('[data-save]');
  const updateSave=()=>{if(!user){save.textContent='저장하기';return}save.textContent=readSaved(user.uid).some(x=>x.id===`column:${id}`)?'저장됨 ✓':'저장하기'};
  save.addEventListener('click',()=>{if(!user){location.href=`login.html?next=${encodeURIComponent(location.pathname.split('/').pop()+location.search)}`;return}const items=readSaved(user.uid),item={id:`column:${id}`,title:post.title,href:`column-detail.html?id=${id}`,category:'COLUMN',savedAt:Date.now()};const next=items.some(x=>x.id===item.id)?items.filter(x=>x.id!==item.id):[item,...items];localStorage.setItem(savedKey(user.uid),JSON.stringify(next));updateSave()});
  root.querySelector('[data-share]').addEventListener('click',async e=>{try{if(navigator.share)await navigator.share({title:post.title,text:post.summary,url:location.href});else{await navigator.clipboard.writeText(location.href);e.currentTarget.textContent='링크 복사됨';setTimeout(()=>e.currentTarget.textContent='공유하기',1600)}}catch{}});
  updateSave();
}
async function load(){
  if(!id){root.innerHTML='<section class="column-status shell" style="margin-top:70px"><strong>잘못된 칼럼 주소입니다.</strong></section>';return}
  try{const snap=await getDoc(doc(db,'columns',id));if(!snap.exists()){throw new Error('missing')}post={id:snap.id,...snap.data()};if(post.status!=='published'&&user?.uid!==post.authorUid){throw new Error('hidden')}render()}catch{root.innerHTML='<section class="column-status shell" style="margin-top:70px"><strong>칼럼을 불러오지 못했습니다.</strong><p>삭제되었거나 아직 공개되지 않은 글입니다.</p></section>'}}
onAuthStateChanged(auth,current=>{user=current;load()});