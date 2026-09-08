import { db } from './firebase-config.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const STORAGE_KEY='aesost-quick-inquiry-v1';
const LAST_SUBMIT_KEY='aesost-quick-inquiry-last-submit';
const serviceOptions=[
  ['기업 홈페이지','기업 홈페이지'],
  ['기업관리시스템','기업관리시스템'],
  ['맞춤형 업무시스템','맞춤형 업무시스템'],
  ['발주·대응관리','발주 및 대응관리시스템']
];

function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function normalisePhone(value=''){return String(value).replace(/[^0-9+\-() ]/g,'').slice(0,30)}
function safeRead(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')}catch{return null}}
function safeWrite(data){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}catch{}}
function safeRemove(){try{localStorage.removeItem(STORAGE_KEY)}catch{}}

function markup(){
  return `<button class="aesost-inquiry-launcher" type="button" aria-expanded="false" aria-controls="aesost-inquiry-panel" data-inquiry-open><i aria-hidden="true"></i><span>AESOST 문의하기</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"/></svg></button>
  <div class="aesost-inquiry-backdrop" data-inquiry-backdrop></div>
  <aside class="aesost-inquiry-panel" id="aesost-inquiry-panel" aria-hidden="true" aria-label="AESOST 프로젝트 문의" data-inquiry-panel>
    <div class="aesost-inquiry-head">
      <div><p class="aesost-inquiry-kicker">QUICK PROJECT INQUIRY</p><h2>무엇이 필요한지<br>완전히 정리되지 않아도 됩니다.</h2><p>현재 불편한 업무나 필요한 홈페이지부터 적어주세요. AESOST가 범위부터 함께 정리합니다.</p></div>
      <button class="aesost-inquiry-close" type="button" aria-label="문의창 닫기" data-inquiry-close><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>
    <form class="aesost-inquiry-form" data-inquiry-form novalidate>
      <div class="aesost-inquiry-services">${serviceOptions.map(([label,value],index)=>`<label class="aesost-inquiry-service"><input type="radio" name="service" value="${escapeHtml(value)}"${index===0?' checked':''}><span>${escapeHtml(label)}</span></label>`).join('')}</div>
      <div class="aesost-inquiry-grid">
        <div class="aesost-inquiry-field"><label for="aesost-inquiry-name">담당자명 *</label><input id="aesost-inquiry-name" name="name" type="text" maxlength="80" autocomplete="name" placeholder="성함" required></div>
        <div class="aesost-inquiry-field"><label for="aesost-inquiry-company">회사 / 브랜드</label><input id="aesost-inquiry-company" name="company" type="text" maxlength="120" autocomplete="organization" placeholder="선택 입력"></div>
        <div class="aesost-inquiry-field"><label for="aesost-inquiry-phone">연락처 *</label><input id="aesost-inquiry-phone" name="phone" type="tel" maxlength="30" autocomplete="tel" placeholder="010-0000-0000" required></div>
        <div class="aesost-inquiry-field"><label for="aesost-inquiry-email">이메일 *</label><input id="aesost-inquiry-email" name="email" type="email" maxlength="160" autocomplete="email" placeholder="name@company.com" required></div>
        <div class="aesost-inquiry-field is-wide"><label for="aesost-inquiry-method">희망 연락 방식</label><select id="aesost-inquiry-method" name="contactMethod"><option value="이메일">이메일</option><option value="전화">전화</option><option value="온라인 미팅">온라인 미팅</option></select></div>
        <div class="aesost-inquiry-field is-wide"><label for="aesost-inquiry-description">문의 내용 *</label><textarea id="aesost-inquiry-description" name="description" maxlength="5000" placeholder="예: 현재 엑셀로 고객과 프로젝트를 관리하고 있는데 계약·정산까지 한 화면에서 보고 싶습니다." required></textarea></div>
      </div>
      <label class="aesost-inquiry-hp" aria-hidden="true">Website<input type="text" name="website" tabindex="-1" autocomplete="off"></label>
      <p class="aesost-inquiry-note">입력하신 정보는 프로젝트 상담과 회신 목적으로만 사용합니다. 더 자세한 범위가 필요하면 전체 문의서를 이용할 수 있습니다.</p>
      <div class="aesost-inquiry-actions"><button class="aesost-inquiry-submit" type="submit" data-inquiry-submit>빠른 문의 접수</button><a class="aesost-inquiry-full" href="request.html">전체 문의서 ↗</a></div>
      <div class="aesost-inquiry-status" role="status" aria-live="polite" data-inquiry-status></div>
    </form>
  </aside>`;
}

function install(){
  if(document.querySelector('[data-inquiry-panel]'))return;
  const root=document.createElement('div');
  root.dataset.inquiryWidget='';
  root.innerHTML=markup();
  document.body.appendChild(root);

  const openButton=root.querySelector('[data-inquiry-open]');
  const closeButton=root.querySelector('[data-inquiry-close]');
  const backdrop=root.querySelector('[data-inquiry-backdrop]');
  const panel=root.querySelector('[data-inquiry-panel]');
  const form=root.querySelector('[data-inquiry-form]');
  const submit=root.querySelector('[data-inquiry-submit]');
  const status=root.querySelector('[data-inquiry-status]');

  const showStatus=(message,type='success')=>{
    status.textContent=message;
    status.className=`aesost-inquiry-status is-visible is-${type}`;
  };
  const clearStatus=()=>{status.textContent='';status.className='aesost-inquiry-status'};
  const setOpen=open=>{
    panel.classList.toggle('is-open',open);
    backdrop.classList.toggle('is-open',open);
    panel.setAttribute('aria-hidden',String(!open));
    openButton.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('aesost-inquiry-open',open);
    if(open)setTimeout(()=>form.elements.name?.focus(),80);
  };
  const draft=()=>({
    service:form.elements.service?.value||serviceOptions[0][1],
    name:form.elements.name?.value||'',company:form.elements.company?.value||'',phone:form.elements.phone?.value||'',email:form.elements.email?.value||'',contactMethod:form.elements.contactMethod?.value||'이메일',description:form.elements.description?.value||''
  });
  const saveDraft=()=>safeWrite(draft());
  const saved=safeRead();
  if(saved){
    ['name','company','phone','email','description'].forEach(key=>{if(form.elements[key]&&saved[key]!=null)form.elements[key].value=saved[key]});
    if(saved.contactMethod&&form.elements.contactMethod)form.elements.contactMethod.value=saved.contactMethod;
    const radio=[...form.querySelectorAll('[name="service"]')].find(item=>item.value===saved.service);if(radio)radio.checked=true;
  }

  openButton.addEventListener('click',()=>setOpen(!panel.classList.contains('is-open')));
  closeButton.addEventListener('click',()=>setOpen(false));
  backdrop.addEventListener('click',()=>setOpen(false));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('is-open'))setOpen(false)});
  form.addEventListener('input',event=>{if(event.target?.name==='phone')event.target.value=normalisePhone(event.target.value);clearStatus();saveDraft()});
  form.addEventListener('change',()=>{clearStatus();saveDraft()});

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    clearStatus();
    if(form.elements.website?.value?.trim())return;
    if(!form.checkValidity()){form.reportValidity();showStatus('필수 항목을 확인해 주세요.','error');return}
    if(!navigator.onLine){saveDraft();showStatus('인터넷 연결이 없습니다. 작성 내용은 이 기기에 임시 저장했습니다.','error');return}
    const now=Date.now();
    const last=Number(localStorage.getItem(LAST_SUBMIT_KEY)||0);
    if(now-last<10000){showStatus('방금 문의가 접수되었습니다. 잠시 후 다시 시도해 주세요.','error');return}

    const data={
      company:String(form.elements.company.value||'').trim().slice(0,120),
      name:String(form.elements.name.value||'').trim().slice(0,80),
      phone:normalisePhone(form.elements.phone.value.trim()),
      email:String(form.elements.email.value||'').trim().slice(0,160),
      projectTypes:[form.elements.service.value],
      description:String(form.elements.description.value||'').trim().slice(0,5000),
      budget:'',
      schedule:'',
      contactMethod:form.elements.contactMethod.value,
      source:'aesost.com/request',
      status:'new',
      createdAt:serverTimestamp()
    };

    submit.disabled=true;
    const label=submit.textContent;
    submit.textContent='접수 중...';
    try{
      await addDoc(collection(db,'projectRequests'),data);
      try{localStorage.setItem(LAST_SUBMIT_KEY,String(now))}catch{}
      safeRemove();
      form.reset();
      const first=form.querySelector('[name="service"]');if(first)first.checked=true;
      showStatus('문의가 접수되었습니다. 내용을 확인한 뒤 담당자가 연락드리겠습니다.','success');
    }catch(error){
      console.error('Quick inquiry submission failed',error);
      saveDraft();
      const permission=error?.code==='permission-denied';
      showStatus(permission?'현재 문의 저장 권한을 확인 중입니다. 작성 내용은 임시 저장되었습니다.':'문의 접수 중 오류가 발생했습니다. 작성 내용은 임시 저장되었습니다.','error');
    }finally{
      submit.disabled=false;
      submit.textContent=label;
    }
  });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
