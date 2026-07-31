import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const form=document.querySelector('[data-ability-form]');
const publicInput=document.querySelector('[data-ability-public-url]');
const copyButton=document.querySelector('[data-copy-ability-url]');
let user=null;

const lines=v=>String(v||'').split('\n').map(x=>x.trim()).filter(Boolean);
const skills=v=>String(v||'').split(',').map(x=>x.trim()).filter(Boolean);
const makeUrl=uid=>`https://jyhome1228-cyber.github.io/wavelab/ability.html?user=${encodeURIComponent(uid)}`;

async function copyText(value){
  try{await navigator.clipboard.writeText(value);return true;}catch{}
  const area=document.createElement('textarea');
  area.value=value;
  area.setAttribute('readonly','');
  area.style.position='fixed';
  area.style.left='-9999px';
  document.body.appendChild(area);
  area.select();
  let copied=false;
  try{copied=document.execCommand('copy');}catch{}
  area.remove();
  return copied;
}

function showDone(link,isPublic){
  document.querySelector('.ability-complete-modal')?.remove();
  const modal=document.createElement('div');
  modal.className='ability-complete-modal';
  const action=isPublic
    ? `<a class="primary" href="${link}">내 포트폴리오 보기</a>`
    : `<button class="ability-private-button" type="button" disabled>공개 설정 후 이용 가능</button>`;
  modal.innerHTML=`<div class="ability-complete-dialog"><span>✦</span><h2>마이 어빌리티가 저장되었습니다.</h2><p>${isPublic?'개인 포트폴리오가 공개되었습니다. 아래 링크로 바로 확인하고 공유할 수 있습니다.':'현재 비공개 상태입니다. 외부에서 보이게 하려면 공개 설정을 켠 뒤 다시 저장해 주세요.'}</p><div class="ability-complete-url"><input value="${link}" readonly><button type="button" data-modal-copy>링크 복사</button></div><div class="ability-complete-buttons"><a href="mypage.html#ability">마이페이지로 돌아가기</a>${action}</div></div>`;
  document.body.appendChild(modal);
  modal.querySelector('[data-modal-copy]')?.addEventListener('click',async event=>{
    event.currentTarget.textContent=await copyText(link)?'복사됨':'직접 복사해 주세요';
  });
}

onAuthStateChanged(auth,current=>{
  user=current;
  if(user&&publicInput)publicInput.value=makeUrl(user.uid);
});

copyButton?.addEventListener('click',async event=>{
  event.stopImmediatePropagation();
  if(!publicInput?.value)return;
  copyButton.textContent=await copyText(publicInput.value)?'복사됨':'직접 복사';
  setTimeout(()=>copyButton.textContent='링크 복사',1500);
},true);

form?.addEventListener('submit',async event=>{
  event.preventDefault();
  event.stopImmediatePropagation();
  if(!user)return;
  const button=form.querySelector('button[type=submit]');
  const notice=document.querySelector('[data-ability-notice]');
  const data=new FormData(form);
  const link=makeUrl(user.uid);
  const isPublic=data.get('isPublic')==='on';
  const image=document.querySelector('[data-ability-photo-image]');
  const photoData=image&&!image.hidden?image.src:'';
  button.disabled=true;
  button.textContent='저장 중...';
  try{
    await setDoc(doc(db,'abilities',user.uid),{
      uid:user.uid,
      publicName:String(data.get('publicName')||'').trim(),
      headline:String(data.get('headline')||'').trim(),
      summary:String(data.get('summary')||'').trim(),
      coverLetter:String(data.get('coverLetter')||'').trim(),
      skills:skills(data.get('skills')),
      education:lines(data.get('education')),
      career:lines(data.get('career')),
      projects:lines(data.get('projects')),
      achievements:lines(data.get('achievements')),
      contactEmail:String(data.get('contactEmail')||'').trim(),
      website:String(data.get('website')||'').trim(),
      instagram:String(data.get('instagram')||'').trim(),
      otherLink:String(data.get('otherLink')||'').trim(),
      photoData,
      isPublic,
      publicUrl:link,
      updatedAt:serverTimestamp()
    },{merge:true});
    notice.textContent='저장되었습니다.';
    showDone(link,isPublic);
  }catch(error){
    notice.textContent=error.code==='permission-denied'?'저장 권한을 확인해 주세요.':'저장 중 오류가 발생했습니다.';
  }
  button.disabled=false;
  button.textContent='저장하기';
},true);