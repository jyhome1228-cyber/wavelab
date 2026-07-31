import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const form=document.querySelector('[data-column-form]');
const statusBox=document.querySelector('[data-column-write-status]');
const notice=document.querySelector('[data-column-notice]');
const titleEl=document.querySelector('[data-write-title]');
const draftButton=document.querySelector('[data-save-draft]');
const id=new URLSearchParams(location.search).get('id');
let user=null, profile=null, existing=null;

function showStatus(title,text,link='columnist-apply.html'){
  statusBox.hidden=false;
  statusBox.innerHTML=`<strong>${title}</strong><p>${text}</p><div class="column-actions" style="justify-content:center;margin:22px 0 0"><a class="primary" href="${link}">이동하기</a></div>`;
}

function fill(data){
  form.elements.category.value=data.category||'디자인';
  form.elements.thumbnailUrl.value=data.thumbnailUrl||'';
  form.elements.title.value=data.title||'';
  form.elements.summary.value=data.summary||'';
  form.elements.content.value=data.content||'';
}

async function save(status){
  if(!user||!profile)return;
  const button=status==='draft'?draftButton:form.querySelector('button[type=submit]');
  const data=new FormData(form);
  const payload={
    authorUid:user.uid,
    authorName:profile.penName||user.displayName||'칼럼니스트',
    authorBio:profile.bio||'',
    authorExpertise:profile.expertise||'',
    category:String(data.get('category')||'').trim(),
    thumbnailUrl:String(data.get('thumbnailUrl')||'').trim(),
    title:String(data.get('title')||'').trim(),
    summary:String(data.get('summary')||'').trim(),
    content:String(data.get('content')||'').trim(),
    status,
    updatedAt:serverTimestamp()
  };
  if(!payload.title||!payload.summary||!payload.content){notice.textContent='제목, 요약, 본문을 모두 입력해 주세요.';return;}
  button.disabled=true;notice.textContent=status==='draft'?'임시저장 중...':'검토 요청 중...';
  try{
    if(id){
      await updateDoc(doc(db,'columns',id),payload);
      notice.textContent=status==='draft'?'임시저장되었습니다.':'검토 요청을 보냈습니다.';
    }else{
      const saved=await addDoc(collection(db,'columns'),{...payload,createdAt:serverTimestamp(),publishedAt:null});
      location.replace(`column-write.html?id=${saved.id}`);
      return;
    }
  }catch(error){notice.textContent=error.code==='permission-denied'?'작성 또는 수정 권한이 없습니다.':'저장 중 오류가 발생했습니다.';}
  button.disabled=false;
}

draftButton?.addEventListener('click',()=>save('draft'));
form?.addEventListener('submit',event=>{event.preventDefault();save('review');});

onAuthStateChanged(auth,async current=>{
  user=current;
  if(!user){location.replace(`login.html?next=${encodeURIComponent(location.pathname.split('/').pop()+location.search)}`);return;}
  try{
    const profileSnap=await getDoc(doc(db,'columnistProfiles',user.uid));
    if(!profileSnap.exists()||profileSnap.data().status!=='approved'){
      showStatus('칼럼니스트 승인이 필요합니다.','승인된 칼럼니스트만 글을 작성할 수 있습니다.');
      return;
    }
    profile=profileSnap.data();
    if(id){
      const postSnap=await getDoc(doc(db,'columns',id));
      if(!postSnap.exists()){showStatus('글을 찾을 수 없습니다.','삭제되었거나 존재하지 않는 글입니다.','mypage.html#columns');return;}
      existing=postSnap.data();
      if(existing.authorUid!==user.uid){showStatus('수정 권한이 없습니다.','본인이 작성한 글만 수정할 수 있습니다.','column.html');return;}
      fill(existing);titleEl.textContent='칼럼 수정';
    }
    statusBox.hidden=true;form.hidden=false;
  }catch{showStatus('작성 권한을 확인하지 못했습니다.','잠시 후 다시 시도해 주세요.');}
});