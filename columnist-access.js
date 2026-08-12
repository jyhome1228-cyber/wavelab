import './visitor-analytics.js?v=20260812-1';
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

function setVisible(selector,visible){document.querySelectorAll(selector).forEach(el=>{el.hidden=!visible})}
function removeLegacyReview(){document.querySelectorAll('a[href="editorial-review.html"]').forEach(link=>{const wrap=link.closest('.column-actions');if(wrap)wrap.remove();else link.remove()})}
function updateRoleLabel(profile){
  const role=document.querySelector('.mypage-side > small');
  if(!role)return;
  if(profile?.status==='major')role.textContent='AESOST MAJOR COLUMNIST';
  else if(profile?.status==='approved')role.textContent='AESOST COLUMNIST';
  else role.textContent='AESOST MEMBER';
}

onAuthStateChanged(auth,async user=>{
  setVisible('[data-column-write],[data-mobile-column-write]',false);
  removeLegacyReview();
  if(!user){updateRoleLabel(null);return}
  try{
    const snap=await getDoc(doc(db,'columnistProfiles',user.uid));
    const profile=snap.exists()?snap.data():null;
    const active=profile&&['approved','major'].includes(profile.status);
    setVisible('[data-column-write],[data-mobile-column-write]',Boolean(active));
    updateRoleLabel(profile);
    window.WAVELAB_COLUMNIST_PROFILE=profile;
    window.dispatchEvent(new CustomEvent('wavelab:columnist-ready',{detail:profile}));
  }catch(error){console.warn('Columnist access check failed',error.code)}
});