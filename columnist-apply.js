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
    if(profile.exists()&&profile.data().status==='approved'){
      showStatus('이미 승인된 칼럼니스트입니다.','마이페이지 또는 칼럼 글쓰기에서 새 글을 작성할 수 있습니다.','column-write.html');
      return;
    }
    const application=await getDoc(doc(db,'columnistApplications',user.uid));
    if(application.exists()&&application.data().status==='pending'){
      showStatus('신청서를 검토하고 있습니다.','승인 결과는 마이페이지에서 확인할 수 있습니다.');
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
  button.disabled=true;button.textContent='신청 중...';notice.textContent='';
  try{
    await setDoc(doc(db,'columnistApplications',user.uid),{
      applicantUid:user.uid,
      email:user.email||'',
      displayName:user.displayName||'',
      penName:String(data.get('penName')||'').trim(),
      expertise:String(data.get('expertise')||'').trim(),
      bio:String(data.get('bio')||'').trim(),
      topics:String(data.get('topics')||'').trim(),
      referenceUrl:String(data.get('referenceUrl')||'').trim(),
      motivation:String(data.get('motivation')||'').trim(),
      status:'pending',
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    });
    form.hidden=true;
    showStatus('신청이 접수되었습니다.','관리자 검토 후 승인되면 칼럼 글쓰기 기능이 열립니다.');
  }catch(error){
    notice.textContent=error.code==='permission-denied'?'신청 권한을 확인해 주세요.':'신청 중 오류가 발생했습니다.';
    button.disabled=false;button.textContent='신청하기';
  }
});