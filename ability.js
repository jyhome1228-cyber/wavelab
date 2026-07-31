import { db } from './firebase-config.js';
import { collection, doc, getDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const params=new URLSearchParams(location.search);
const uid=params.get('user');
const page=document.querySelector('[data-ability-public]');
const status=document.querySelector('[data-ability-public-status]');
const esc=value=>String(value||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const setText=(selector,value)=>{const el=document.querySelector(selector);if(el)el.textContent=value||'';};
const renderList=(selector,items=[])=>{const el=document.querySelector(selector);if(!el)return;el.innerHTML=items.length?items.map(item=>`<div class="ability-item">${esc(item)}</div>`).join(''):'<div class="ability-item">등록된 내용이 없습니다.</div>';};

async function loadColumns(authorUid){
  const box=document.querySelector('[data-ability-columns]');
  try{
    const snapshot=await getDocs(query(collection(db,'columns'),where('authorUid','==',authorUid),where('status','==','published')));
    const items=snapshot.docs.map(item=>({id:item.id,...item.data()}));
    box.innerHTML=items.length?items.map(item=>`<a href="column-detail.html?id=${encodeURIComponent(item.id)}"><span>${esc(item.category||'COLUMN')}</span><strong>${esc(item.title)}</strong></a>`).join(''):'<div class="ability-item">공개된 칼럼이 없습니다.</div>';
  }catch{box.innerHTML='<div class="ability-item">칼럼을 불러오지 못했습니다.</div>';}
}

async function load(){
  if(!uid){status.textContent='공개 프로필 주소가 올바르지 않습니다.';return;}
  try{
    const snap=await getDoc(doc(db,'abilities',uid));
    if(!snap.exists()||!snap.data().isPublic){status.textContent='공개되지 않은 마이 어빌리티입니다.';return;}
    const data=snap.data();
    setText('[data-ability-name]',data.publicName||'WAVELAB MEMBER');
    setText('[data-ability-headline]',data.headline);
    setText('[data-ability-summary]',data.summary);
    setText('[data-cover-letter]',data.coverLetter||'자기소개가 아직 등록되지 않았습니다.');
    document.title=`${data.publicName||'My Ability'} — WAVELAB`;
    const skills=document.querySelector('[data-skills]');
    skills.innerHTML=(data.skills||[]).length?(data.skills||[]).map(item=>`<span>${esc(item)}</span>`).join(''):'<span>등록된 스킬이 없습니다.</span>';
    renderList('[data-career]',data.career);
    renderList('[data-education]',data.education);
    renderList('[data-projects]',data.projects);
    renderList('[data-achievements]',data.achievements);
    const email=document.querySelector('[data-contact-email]');
    if(data.contactEmail){email.href=`mailto:${data.contactEmail}`;email.hidden=false;}
    const website=document.querySelector('[data-website]');
    if(data.website){website.href=data.website;website.hidden=false;}
    const links=document.querySelector('[data-extra-links]');
    const extra=[];
    if(data.instagram)extra.push(`<a href="${esc(data.instagram)}" target="_blank" rel="noopener">Instagram</a>`);
    if(data.otherLink)extra.push(`<a href="${esc(data.otherLink)}" target="_blank" rel="noopener">Additional Link</a>`);
    links.innerHTML=extra.join('');
    await loadColumns(uid);
    status.hidden=true;page.hidden=false;
  }catch(error){status.textContent='포트폴리오를 불러오지 못했습니다.';}
}

document.querySelector('[data-share-ability]')?.addEventListener('click',async()=>{
  try{
    if(navigator.share)await navigator.share({title:document.title,url:location.href});
    else{await navigator.clipboard.writeText(location.href);document.querySelector('[data-share-ability]').textContent='링크 복사됨';}
  }catch{}
});

load();
