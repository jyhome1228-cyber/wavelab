import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

function setVisible(selector,visible){document.querySelectorAll(selector).forEach(el=>{el.hidden=!visible})}
function removeLegacyReview(){document.querySelectorAll('a[href="editorial-review.html"]').forEach(link=>{const wrap=link.closest('.column-actions');if(wrap)wrap.remove();else link.remove()})}
function updateMypage(profile){
  removeLegacyReview();
  const role=document.querySelector('.mypage-side > small');
  const state=document.querySelector('[data-columnist-state]');
  const actions=document.querySelector('[data-column-actions]');
  if(!profile){if(role)role.textContent='WAVELAB MEMBER';return}
  const active=['approved','major'].includes(profile.status);
  if(role)role.textContent=profile.status==='major'?'WAVELAB MAJOR COLUMNIST':active?'WAVELAB COLUMNIST':'WAVELAB MEMBER';
  if(active&&state){
    const major=profile.status==='major';
    state.innerHTML=`<strong>${major?'메이저 칼럼니스트':'칼럼니스트'}로 활동 중입니다.</strong><p>${major?'좋은 글을 꾸준히 작성해 메이저 칼럼니스트로 선정되었습니다.':'신청이 완료되어 칼럼 작성 권한이 활성화되었습니다.'}</p>`;
    if(actions)actions.hidden=false;
  }
  if(['rejected','suspended'].includes(profile.status)&&state){
    state.innerHTML='<strong>칼럼니스트 활동이 제한되었습니다.</strong><p>신청 내용 또는 작성 활동을 확인한 뒤 운영자에게 문의해 주세요.</p>';
    if(actions)actions.hidden=true;
  }
}

onAuthStateChanged(auth,async user=>{
  setVisible('[data-column-write],[data-mobile-column-write]',false);
  removeLegacyReview();
  if(!user){updateMypage(null);return}
  try{
    const snap=await getDoc(doc(db,'columnistProfiles',user.uid));
    const profile=snap.exists()?snap.data():null;
    const active=profile&&['approved','major'].includes(profile.status);
    setVisible('[data-column-write],[data-mobile-column-write]',Boolean(active));
    updateMypage(profile);
    window.WAVELAB_COLUMNIST_PROFILE=profile;
    window.dispatchEvent(new CustomEvent('wavelab:columnist-ready',{detail:profile}));
    if(document.body.classList.contains('mypage-page')){
      const observer=new MutationObserver(()=>updateMypage(profile));
      observer.observe(document.body,{childList:true,subtree:true});
      setTimeout(()=>observer.disconnect(),5000);
    }
  }catch(error){console.warn('Columnist access check failed',error.code)}
});