import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const form=document.querySelector('[data-columnist-form]');
const statusBox=document.querySelector('[data-columnist-status]');
const notice=document.querySelector('[data-columnist-notice]');
let user=null;
let redirectTimer=null;

function showStatus(title,text,link=''){
  statusBox.hidden=false;
  statusBox.innerHTML=`<strong>${title}</strong><p>${text}</p>${link?`<div class="column-actions" style="justify-content:center;margin:22px 0 0"><a class="primary" href="${link}">이동하기</a></div>`:''}`;
}

function ensureCompletePopup(){
  let popup=document.querySelector('[data-columnist-complete-popup]');
  if(popup)return popup;
  popup=document.createElement('div');
  popup.className='columnist-complete-popup';
  popup.dataset.columnistCompletePopup='';
  popup.innerHTML=`<div class="columnist-complete-card" role="dialog" aria-modal="true" aria-labelledby="columnist-complete-title"><div class="columnist-complete-icon">✦</div><h2 id="columnist-complete-title">칼럼니스트 등록이 완료되었습니다.</h2><p>지금부터 칼럼을 작성할 수 있습니다.<br>잠시 후 마이페이지로 자동 이동합니다.</p><a href="mypage.html#columns" data-columnist-complete-link>마이페이지 이동하기</a></div>`;
  document.body.appendChild(popup);
  return popup;
}

function showCompletePopup(){
  const popup=ensureCompletePopup();
  popup.classList.add('is-open');
  document.body.style.overflow='hidden';
  popup.querySelector('[data-columnist-complete-link]')?.focus();
  clearTimeout(redirectTimer);
  redirectTimer=setTimeout(()=>location.replace('mypage.html#columns'),2600);
}

onAuthStateChanged(auth,async current=>{
  user=current;
  if(!user){location.replace(`login.html?next=${encodeURIComponent('columnist-apply.html')}`);return;}
  try{
    const profile=await getDoc(doc(db,'columnistProfiles',user.uid));
    if(profile.exists()&&['approved','major'].includes(profile.data().status)){
      showStatus(profile.data().status==='major'?'메이저 칼럼니스트로 활동 중입니다.':'이미 칼럼니스트로 등록되어 있습니다.','우측 상단의 칼럼 쓰기 또는 마이페이지에서 새 글을 작성할 수 있습니다.','mypage.html#columns');
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
  button.disabled=true;button.textContent='등록 중...';notice.textContent='칼럼니스트 정보를 등록하고 있습니다.';
  try{
    await setDoc(doc(db,'columnistApplications',user.uid),{...payload,status:'approved',createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    await setDoc(doc(db,'columnistProfiles',user.uid),{
      uid:user.uid,email:user.email||'',penName:payload.penName,expertise:payload.expertise,bio:payload.bio,
      referenceUrl:payload.referenceUrl,status:'approved',level:'columnist',joinedAt:serverTimestamp(),updatedAt:serverTimestamp()
    });
    form.hidden=true;
    statusBox.hidden=true;
    showCompletePopup();
  }catch(error){
    notice.textContent=error.code==='permission-denied'?'Firestore 규칙을 게시한 뒤 다시 신청해 주세요.':'등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    button.disabled=false;button.textContent='신청하고 바로 시작하기';
  }
});