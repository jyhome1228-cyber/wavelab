import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const form=document.querySelector('[data-ability-form]');
const loading=document.querySelector('[data-ability-loading]');
const notice=document.querySelector('[data-ability-notice]');
const preview=document.querySelector('[data-ability-preview]');
let user=null;

const splitLines=value=>String(value||'').split('\n').map(v=>v.trim()).filter(Boolean);
const splitSkills=value=>String(value||'').split(',').map(v=>v.trim()).filter(Boolean);
const joinLines=value=>Array.isArray(value)?value.join('\n'):'';

function fill(data={}){
  const names=['publicName','headline','summary','coverLetter','contactEmail','website','instagram','otherLink'];
  names.forEach(name=>{if(form.elements[name])form.elements[name].value=data[name]||'';});
  form.elements.skills.value=(data.skills||[]).join(', ');
  form.elements.education.value=joinLines(data.education);
  form.elements.career.value=joinLines(data.career);
  form.elements.projects.value=joinLines(data.projects);
  form.elements.achievements.value=joinLines(data.achievements);
  form.elements.isPublic.checked=Boolean(data.isPublic);
}

onAuthStateChanged(auth,async current=>{
  user=current;
  if(!user){location.replace(`login.html?next=${encodeURIComponent('ability-edit.html')}`);return;}
  try{
    const snap=await getDoc(doc(db,'abilities',user.uid));
    fill(snap.exists()?snap.data():{publicName:user.displayName||user.email?.split('@')[0]||'회원',contactEmail:user.email||''});
    preview.href=`ability.html?user=${encodeURIComponent(user.uid)}`;
    preview.hidden=false;
    loading.hidden=true;form.hidden=false;
  }catch(error){loading.textContent='마이 어빌리티 정보를 불러오지 못했습니다.';}
});

form?.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!user)return;
  const button=form.querySelector('button[type=submit]');
  button.disabled=true;button.textContent='저장 중...';notice.textContent='';
  const data=new FormData(form);
  try{
    await setDoc(doc(db,'abilities',user.uid),{
      uid:user.uid,
      publicName:String(data.get('publicName')||'').trim(),
      headline:String(data.get('headline')||'').trim(),
      summary:String(data.get('summary')||'').trim(),
      coverLetter:String(data.get('coverLetter')||'').trim(),
      skills:splitSkills(data.get('skills')),
      education:splitLines(data.get('education')),
      career:splitLines(data.get('career')),
      projects:splitLines(data.get('projects')),
      achievements:splitLines(data.get('achievements')),
      contactEmail:String(data.get('contactEmail')||'').trim(),
      website:String(data.get('website')||'').trim(),
      instagram:String(data.get('instagram')||'').trim(),
      otherLink:String(data.get('otherLink')||'').trim(),
      isPublic:data.get('isPublic')==='on',
      updatedAt:serverTimestamp()
    },{merge:true});
    notice.textContent='마이 어빌리티가 저장되었습니다.';
  }catch(error){notice.textContent=error.code==='permission-denied'?'저장 권한을 확인해 주세요.':'저장 중 오류가 발생했습니다.';}
  button.disabled=false;button.textContent='저장하기';
});
