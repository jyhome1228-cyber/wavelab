import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const page=document.querySelector('[data-editorial-page]');
const statusBox=document.querySelector('[data-editorial-status]');
const appList=document.querySelector('[data-application-list]');
const reviewList=document.querySelector('[data-review-list]');
const esc=value=>String(value||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

async function loadApplications(){
  const snapshot=await getDocs(query(collection(db,'columnistApplications'),where('status','==','pending')));
  const items=snapshot.docs.map(item=>({id:item.id,...item.data()}));
  appList.innerHTML=items.length?items.map(item=>`<article class="column-admin-item" data-application="${item.id}"><div><h3>${esc(item.penName||item.displayName)}</h3><p>${esc(item.bio)}<br>${esc(item.expertise)}<br>${esc(item.topics)}</p><small>${esc(item.email)}</small></div><div><button type="button" data-reject>반려</button><button class="primary" type="button" data-approve>승인</button></div></article>`).join(''):'<div class="empty-state"><strong>검토할 신청이 없습니다.</strong></div>';
}

async function loadReviews(){
  const snapshot=await getDocs(query(collection(db,'columns'),where('status','==','review')));
  const items=snapshot.docs.map(item=>({id:item.id,...item.data()}));
  reviewList.innerHTML=items.length?items.map(item=>`<article class="column-admin-item" data-column="${item.id}"><div><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p><small>${esc(item.authorName)} · ${esc(item.category)}</small></div><div><a href="column-detail.html?id=${encodeURIComponent(item.id)}" target="_blank">미리보기</a><button type="button" data-return>수정 요청</button><button class="primary" type="button" data-publish>공개</button></div></article>`).join(''):'<div class="empty-state"><strong>검토할 글이 없습니다.</strong></div>';
}

appList?.addEventListener('click',async event=>{
  const row=event.target.closest('[data-application]');
  if(!row)return;
  const id=row.dataset.application;
  const snap=await getDoc(doc(db,'columnistApplications',id));
  if(!snap.exists())return;
  const data=snap.data();
  if(event.target.closest('[data-approve]')){
    await setDoc(doc(db,'columnistProfiles',id),{uid:id,penName:data.penName||data.displayName||'칼럼니스트',bio:data.bio||'',expertise:data.expertise||'',referenceUrl:data.referenceUrl||'',status:'approved',approvedAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await updateDoc(doc(db,'columnistApplications',id),{status:'approved',updatedAt:serverTimestamp()});
    await loadApplications();
  }
  if(event.target.closest('[data-reject]')){
    await updateDoc(doc(db,'columnistApplications',id),{status:'rejected',updatedAt:serverTimestamp()});
    await loadApplications();
  }
});

reviewList?.addEventListener('click',async event=>{
  const row=event.target.closest('[data-column]');
  if(!row)return;
  const id=row.dataset.column;
  if(event.target.closest('[data-publish]')){
    await updateDoc(doc(db,'columns',id),{status:'published',publishedAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await loadReviews();
  }
  if(event.target.closest('[data-return]')){
    await updateDoc(doc(db,'columns',id),{status:'draft',updatedAt:serverTimestamp()});
    await loadReviews();
  }
});

onAuthStateChanged(auth,async user=>{
  if(!user){location.replace(`login.html?next=${encodeURIComponent('editorial-review.html')}`);return;}
  try{
    const admin=await getDoc(doc(db,'admins',user.uid));
    if(!admin.exists()){statusBox.innerHTML='<strong>접근 권한이 없습니다.</strong><p>에디토리얼 관리자만 사용할 수 있습니다.</p>';return;}
    statusBox.hidden=true;page.hidden=false;
    await Promise.all([loadApplications(),loadReviews()]);
  }catch{statusBox.innerHTML='<strong>권한 확인 중 오류가 발생했습니다.</strong>';}
});