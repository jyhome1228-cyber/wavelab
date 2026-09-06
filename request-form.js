import { db } from './firebase-config.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const form=document.querySelector('[data-project-request]');
const submitButton=document.querySelector('[data-submit]');
const notice=document.querySelector('[data-form-notice]');
const DRAFT_KEY='aesost-project-request-draft-v1';
let submitting=false;

function showNotice(message,type='success'){
  if(!notice)return;
  notice.textContent=message;
  notice.className=`form-notice is-visible ${type}`;
}
function clearNotice(){notice?.classList.remove('is-visible','success','error')}
function setLoading(loading){
  submitting=loading;
  if(!submitButton)return;
  if(!submitButton.dataset.label)submitButton.dataset.label=submitButton.textContent;
  submitButton.disabled=loading;
  submitButton.textContent=loading?'전송 중...':submitButton.dataset.label;
}
function selectedValues(name){return [...form.querySelectorAll(`[name="${name}"]:checked`)].map(item=>item.value)}
function normalisePhone(value){return value.replace(/[^0-9+\-() ]/g,'').slice(0,30)}
function draftData(){
  if(!form)return{};
  return {
    company:form.elements.company?.value||'',name:form.elements.name?.value||'',phone:form.elements.phone?.value||'',email:form.elements.email?.value||'',
    projectTypes:selectedValues('projectType'),description:form.elements.description?.value||'',budget:form.elements.budget?.value||'',schedule:form.elements.schedule?.value||'',contactMethod:form.elements.contactMethod?.value||'이메일'
  };
}
function saveDraft(){
  try{localStorage.setItem(DRAFT_KEY,JSON.stringify(draftData()))}catch{}
}
function restoreDraft(){
  if(!form)return;
  try{
    const saved=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');
    if(!saved)return;
    ['company','name','phone','email','description','budget','schedule'].forEach(key=>{if(form.elements[key]&&saved[key]!=null)form.elements[key].value=saved[key]});
    (saved.projectTypes||[]).forEach(value=>{const el=[...form.querySelectorAll('[name="projectType"]')].find(item=>item.value===value);if(el)el.checked=true});
    const method=[...form.querySelectorAll('[name="contactMethod"]')].find(item=>item.value===saved.contactMethod);if(method)method.checked=true;
  }catch{}
}

restoreDraft();
form?.addEventListener('input',event=>{
  if(event.target?.name==='phone')event.target.value=normalisePhone(event.target.value);
  clearNotice();
  saveDraft();
});
form?.addEventListener('change',()=>{clearNotice();saveDraft()});

form?.addEventListener('submit',async(event)=>{
  event.preventDefault();
  if(submitting)return;
  clearNotice();

  if(!form.checkValidity()){
    form.reportValidity();
    showNotice('필수 항목을 확인해 주세요.','error');
    return;
  }
  if(form.elements.website?.value?.trim())return;

  const projectTypes=selectedValues('projectType');
  if(projectTypes.length===0){
    showNotice('프로젝트 유형을 한 개 이상 선택해 주세요.','error');
    form.querySelector('[data-project-types]')?.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  if(!navigator.onLine){
    saveDraft();
    showNotice('현재 인터넷 연결이 없습니다. 작성 내용은 이 기기에 임시 저장했습니다. 연결 후 다시 전송해 주세요.','error');
    return;
  }

  const data={
    company:form.elements.company.value.trim().slice(0,120),
    name:form.elements.name.value.trim().slice(0,80),
    phone:normalisePhone(form.elements.phone.value.trim()),
    email:form.elements.email.value.trim().slice(0,160),
    projectTypes,
    description:form.elements.description.value.trim().slice(0,5000),
    budget:form.elements.budget.value,
    schedule:form.elements.schedule.value,
    contactMethod:form.elements.contactMethod.value,
    source:'aesost.com/request',
    status:'new',
    createdAt:serverTimestamp()
  };

  setLoading(true);
  try{
    await addDoc(collection(db,'projectRequests'),data);
    localStorage.removeItem(DRAFT_KEY);
    form.reset();
    const emailRadio=form.querySelector('[name="contactMethod"][value="이메일"]');
    if(emailRadio)emailRadio.checked=true;
    showNotice('문의가 정상적으로 접수되었습니다. 보내주신 내용을 검토한 후 연락드리겠습니다.','success');
    notice?.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(error){
    console.error('Project request submission failed',error);
    saveDraft();
    const permission=error?.code==='permission-denied';
    showNotice(permission?'문의 저장 권한 설정을 확인 중입니다. 작성 내용은 임시 저장되었습니다. 잠시 후 다시 시도해 주세요.':'문의 전송 중 오류가 발생했습니다. 작성 내용은 임시 저장되었습니다. 잠시 후 다시 시도해 주세요.','error');
  }finally{
    setLoading(false);
  }
});

window.addEventListener('online',()=>{if(notice?.classList.contains('error'))showNotice('인터넷 연결이 복구되었습니다. 내용을 확인한 뒤 다시 전송해 주세요.','success')});
