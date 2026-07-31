import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import './ability-flow-fix.js';

const form=document.querySelector('[data-ability-form]');
const loading=document.querySelector('[data-ability-loading]');
const notice=document.querySelector('[data-ability-notice]');
const preview=document.querySelector('[data-ability-preview]');
const photoInput=document.querySelector('[data-ability-photo-input]');
const photoImage=document.querySelector('[data-ability-photo-image]');
const photoPlaceholder=document.querySelector('[data-ability-photo-placeholder]');
const photoRemove=document.querySelector('[data-ability-photo-remove]');
const publicUrlInput=document.querySelector('[data-ability-public-url]');
const copyUrlButton=document.querySelector('[data-copy-ability-url]');
let user=null;
let photoData='';
const splitLines=value=>String(value||'').split('\n').map(v=>v.trim()).filter(Boolean);
const splitSkills=value=>String(value||'').split(',').map(v=>v.trim()).filter(Boolean);
const joinLines=value=>Array.isArray(value)?value.join('\n'):'';
function publicUrl(uid){return `https://jyhome1228-cyber.github.io/wavelab/ability.html?user=${encodeURIComponent(uid)}`;}
function showPhoto(value=''){photoData=value;if(value){photoImage.src=value;photoImage.hidden=false;photoPlaceholder.hidden=true}else{photoImage.removeAttribute('src');photoImage.hidden=true;photoPlaceholder.hidden=false}}
function fill(data={}){const names=['publicName','headline','summary','coverLetter','contactEmail','website','instagram','otherLink'];names.forEach(name=>{if(form.elements[name])form.elements[name].value=data[name]||''});form.elements.skills.value=(data.skills||[]).join(', ');form.elements.education.value=joinLines(data.education);form.elements.career.value=joinLines(data.career);form.elements.projects.value=joinLines(data.projects);form.elements.achievements.value=joinLines(data.achievements);form.elements.isPublic.checked=Boolean(data.isPublic);showPhoto(data.photoData||'')}
function compressImage(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const image=new Image();image.onerror=reject;image.onload=()=>{const size=640,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d'),scale=Math.max(size/image.width,size/image.height),width=image.width*scale,height=image.height*scale;ctx.drawImage(image,(size-width)/2,(size-height)/2,width,height);resolve(canvas.toDataURL('image/jpeg',.78))};image.src=String(reader.result||'')};reader.readAsDataURL(file)})}
photoInput?.addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){notice.textContent='JPG, PNG, WEBP 파일만 등록할 수 있습니다.';return}if(file.size>8*1024*1024){notice.textContent='이미지는 8MB 이하로 등록해 주세요.';return}notice.textContent='사진을 처리하고 있습니다.';try{showPhoto(await compressImage(file));notice.textContent='사진이 준비되었습니다. 저장하기를 눌러 반영해 주세요.'}catch{notice.textContent='사진을 처리하지 못했습니다.'}});
photoRemove?.addEventListener('click',()=>{showPhoto('');if(photoInput)photoInput.value='';notice.textContent='사진을 삭제했습니다. 저장하기를 눌러 반영해 주세요.'});
copyUrlButton?.addEventListener('click',async()=>{if(!publicUrlInput?.value)return;try{await navigator.clipboard.writeText(publicUrlInput.value);copyUrlButton.textContent='복사됨';setTimeout(()=>copyUrlButton.textContent='링크 복사',1500)}catch{}});
onAuthStateChanged(auth,async current=>{user=current;if(!user){location.replace(`login.html?next=${encodeURIComponent('ability-edit.html')}`);return}try{const snap=await getDoc(doc(db,'abilities',user.uid));fill(snap.exists()?snap.data():{publicName:'',contactEmail:''});const url=publicUrl(user.uid);preview.href=url;preview.hidden=false;publicUrlInput.value=url;loading.hidden=true;form.hidden=false}catch{loading.textContent='마이 어빌리티 정보를 불러오지 못했습니다.'}});
form?.addEventListener('submit',async event=>{event.preventDefault();if(!user)return;const button=form.querySelector('button[type=submit]');button.disabled=true;button.textContent='저장 중...';notice.textContent='';const data=new FormData(form);try{await setDoc(doc(db,'abilities',user.uid),{uid:user.uid,publicName:String(data.get('publicName')||'').trim(),headline:String(data.get('headline')||'').trim(),summary:String(data.get('summary')||'').trim(),coverLetter:String(data.get('coverLetter')||'').trim(),skills:splitSkills(data.get('skills')),education:splitLines(data.get('education')),career:splitLines(data.get('career')),projects:splitLines(data.get('projects')),achievements:splitLines(data.get('achievements')),contactEmail:String(data.get('contactEmail')||'').trim(),website:String(data.get('website')||'').trim(),instagram:String(data.get('instagram')||'').trim(),otherLink:String(data.get('otherLink')||'').trim(),photoData,isPublic:data.get('isPublic')==='on',publicUrl:publicUrl(user.uid),updatedAt:serverTimestamp()},{merge:true});notice.textContent='마이 어빌리티가 저장되었습니다.'}catch(error){notice.textContent=error.code==='permission-denied'?'저장 권한을 확인해 주세요.':'저장 중 오류가 발생했습니다.'}button.disabled=false;button.textContent='저장하기'});