import { db } from './firebase-config.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const form=document.querySelector('[data-project-request]');
const submitButton=document.querySelector('[data-submit]');
const notice=document.querySelector('[data-form-notice]');

function showNotice(message,type='success'){
  if(!notice)return;
  notice.textContent=message;
  notice.className=`form-notice is-visible ${type}`;
}

function setLoading(loading){
  if(!submitButton)return;
  if(!submitButton.dataset.label)submitButton.dataset.label=submitButton.textContent;
  submitButton.disabled=loading;
  submitButton.textContent=loading?'전송 중...':submitButton.dataset.label;
}

function selectedValues(name){
  return [...form.querySelectorAll(`[name="${name}"]:checked`)].map(item=>item.value);
}

form?.addEventListener('submit',async(event)=>{
  event.preventDefault();
  notice?.classList.remove('is-visible','success','error');

  if(!form.checkValidity()){
    form.reportValidity();
    showNotice('필수 항목을 확인해 주세요.','error');
    return;
  }

  const honeypot=form.elements.website?.value?.trim();
  if(honeypot)return;

  const projectTypes=selectedValues('projectType');
  if(projectTypes.length===0){
    showNotice('프로젝트 유형을 한 개 이상 선택해 주세요.','error');
    form.querySelector('[data-project-types]')?.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }

  const data={
    company:form.elements.company.value.trim(),
    name:form.elements.name.value.trim(),
    phone:form.elements.phone.value.trim(),
    email:form.elements.email.value.trim(),
    projectTypes,
    description:form.elements.description.value.trim(),
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
    form.reset();
    const emailRadio=form.querySelector('[name="contactMethod"][value="이메일"]');
    if(emailRadio)emailRadio.checked=true;
    showNotice('문의가 정상적으로 접수되었습니다. 보내주신 내용을 검토한 후 연락드리겠습니다.','success');
    notice?.scrollIntoView({behavior:'smooth',block:'center'});
  }catch(error){
    console.error('Project request submission failed',error);
    showNotice('문의 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.','error');
  }finally{
    setLoading(false);
  }
});
