import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const form=document.querySelector('[data-columnist-form]');
const statusBox=document.querySelector('[data-columnist-status]');
const notice=document.querySelector('[data-columnist-notice]');
let user=null;

function showStatus(title,text,link=''){
  statusBox.hidden=false;
  statusBox.innerHTML=`<strong>${title}</strong><p>${text}</p>${link?`<div class="column-actions" style="justify-content:center;margin:22px 0 0"><a class="primary" href="${link}">이동하기</a></div>`:''}`;
}

onAuthStateChanged(auth,async current=>{
  user=current;
  if(!user){location.replace(`login.html?next=${encodeURIComponent('columnist-apply.html')}`);return;}
  try{
    const profile=await getDoc(doc(db,'columnistProfiles',user.uid));
    if(profile.exists()&&['approved','major'].includes(profile.data().status)){
      showStatus(profile.data().status==='major'?'메이저 칼럼니스트로 활동 중입니다.':'이미 칼럼니스트로 등록되어 있습니다.','우측 상단의 칼럼 쓰기 또는 마이페이지에서 새 글을 작성할 수 있습니다.','column-write.html');
      return;
    }
    if(profile.exists()&&['rejected','suspended'].includes(profile.data().status)){
      showStatus('칼럼니스트 활동이 제한되었습니다.','신청 내용이나 작성 활동을 확인한 뒤 운영자에게 문의해 주세요.');
      return;
    }
    statusBox.hidden=true;
    form.hidden=false;
  }catch{
    showStatus('신청 정보를 확인하지 못했습니다.','Firestore 설정을 확인한 뒤 다시 시도해 주세요.');
  }
});

form?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!user)return;
  const button=form.querySelector('button[type=submit]');
  const data=new FormData(form);
  const payload={
    applicantUid:user.uid,email:user.email||'',displayName:user.displayName||'',
    penName:String(data.get('penName')||'').trim(),expertise:String(data.get('expertise')||'').trim(),
    bio:String(data.get('bio')||'').trim(),topics:String(data.get('topics')||'').trim(),
    referenceUrl:String(data.get('referenceUrl')||'').trim(),motivation:String(data.get('motivation')||'').trim()
  };
  button.disabled=true;button.textContent='등록 중...';notice.textContent='';
  try{
    await setDoc(doc(db,'columnistApplications',user.uid),{...payload,status:'approved',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await setDoc(doc(db,'columnistProfiles',user.uid),{
      uid:user.uid,email:user.email||'',penName:payload.penName,expertise:payload.expertise,bio:payload.bio,
      referenceUrl:payload.referenceUrl,status:'approved',level:'columnist',joinedAt:serverTimestamp(),updatedAt:serverTimestamp()
    });
    form.hidden=true;
    showStatus('칼럼니스트 등록이 완료되었습니다.','지금부터 칼럼을 작성할 수 있습니다. 신청 내용이나 작성 활동에 문제가 있을 경우 운영 정책에 따라 반려 또는 권한이 제한될 수 있습니다.','column-write.html');
  }catch(error){
    notice.textContent=error.code==='permission-denied'?'Firestore 규칙을 게시한 뒤 다시 신청해 주세요.':'등록 중 오류가 발생했습니다.';
    button.disabled=false;button.textContent='신청하기';
  }
});