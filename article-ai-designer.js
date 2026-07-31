import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const params = new URLSearchParams(location.search);
const isColumn = params.get('type') === 'column';

const sharedStyle = document.createElement('link');
sharedStyle.rel = 'stylesheet';
sharedStyle.href = 'real-content.css?v=20260731-2';
document.head.appendChild(sharedStyle);

if (isColumn) {
  const eyebrow = document.querySelector('.article-eyebrow');
  if (eyebrow) eyebrow.textContent = 'COLUMN · AI · DESIGN';
  document.title = 'AI 시대, 디자이너는 무엇으로 증명되는가 — 박재영 칼럼';
  const body = document.querySelector('.article-body');
  body?.insertAdjacentHTML('beforeend', `
    <section class="author-profile" id="author">
      <span>AUTHOR</span>
      <h3>박재영</h3>
      <p>디자인을 결과물이 아닌 산업과 구조의 관점에서 바라봅니다. 디자인, 기획, 개발과 비즈니스의 경계를 연결하며 일과 삶이 움직이는 방향을 기록합니다.</p>
      <a href="http://brunch.co.kr/magazine/lifemovement" target="_blank" rel="noopener noreferrer">Life Movement 매거진 보기 ↗</a>
    </section>`);
}

const article = {
  id: isColumn ? 'column-ai-designer-proof' : 'ai-designer-proof',
  title: 'AI 시대, 디자이너는 무엇으로 증명되는가',
  href: isColumn ? 'article-ai-designer.html?type=column' : 'article-ai-designer.html',
  category: isColumn ? 'COLUMN · AI · DESIGN' : 'ARTICLE · AI · DESIGN'
};

const saveButton = document.querySelector('[data-article-save]');
const shareButton = document.querySelector('[data-article-share]');
let currentUser = null;

function savedKey(uid){return `wavelab:saved:${uid}`;}
function readSaved(uid){try{return JSON.parse(localStorage.getItem(savedKey(uid))||'[]');}catch{return [];}}
function renderSaveState(){
  if(!saveButton)return;
  if(!currentUser){saveButton.textContent='저장하기';return;}
  const saved=readSaved(currentUser.uid).some(item=>item.id===article.id);
  saveButton.textContent=saved?'저장됨 ✓':'저장하기';
}

saveButton?.addEventListener('click',()=>{
  if(!currentUser){location.href=`login.html?next=${encodeURIComponent(article.href)}`;return;}
  const items=readSaved(currentUser.uid);
  const exists=items.some(item=>item.id===article.id);
  const next=exists?items.filter(item=>item.id!==article.id):[{...article,savedAt:Date.now()},...items];
  localStorage.setItem(savedKey(currentUser.uid),JSON.stringify(next));
  renderSaveState();
  window.dispatchEvent(new CustomEvent('wavelab:saved-updated'));
});

shareButton?.addEventListener('click',async()=>{
  const data={title:document.title,text:article.title,url:location.href};
  try{
    if(navigator.share)await navigator.share(data);
    else{
      await navigator.clipboard.writeText(location.href);
      shareButton.textContent='링크 복사됨';
      setTimeout(()=>{shareButton.textContent='공유하기';},1800);
    }
  }catch{}
});

onAuthStateChanged(auth,user=>{currentUser=user;renderSaveState();});