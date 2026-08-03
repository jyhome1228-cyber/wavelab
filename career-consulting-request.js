(()=>{
  const consultants={
    brand:{
      name:'브랜드·비즈니스 컨설턴트 · 프로필 준비 중',
      field:'브랜드·사업',
      description:'브랜드 시작, 고객 검증, 사업 방향과 운영 구조 개선',
      returnUrl:'expert-brand-founder.html'
    },
    independent:{
      name:'프리랜서·독립 커리어 컨설턴트 · 프로필 준비 중',
      field:'프리랜서·독립',
      description:'퇴사 준비, 프리랜서 전환, 견적과 수익 구조 개선',
      returnUrl:'expert-independent-worker.html'
    },
    career:{
      name:'취업·이직 커리어 컨설턴트 · 프로필 준비 중',
      field:'취업·이직',
      description:'포트폴리오, 지원 전략, 면접과 이직 방향 개선',
      returnUrl:'expert-career-mentor.html'
    },
    product:{
      name:'제품·서비스 컨설턴트 · 프로필 준비 중',
      field:'제품·서비스',
      description:'아이디어 검증, MVP, 팀 구성과 실행 우선순위 개선',
      returnUrl:'expert-product-founder.html'
    }
  };

  const params=new URLSearchParams(location.search);
  const selected=consultants[params.get('consultant')]||{
    name:'커리어 컨설턴트',
    field:'커리어 방향',
    description:'현재 커리어 진단과 다음 선택, 실행 방향 구체화',
    returnUrl:'expert-feedback.html'
  };

  const nameText=document.querySelector('[data-consultant-name]');
  const fieldText=document.querySelector('[data-consultant-field]');
  const returnLink=document.querySelector('[data-consultant-return]');
  const consultantInput=document.querySelector('[data-consultant-input]');
  const fieldSelect=document.querySelector('[data-consulting-field]');

  if(nameText)nameText.textContent=selected.name;
  if(fieldText)fieldText.textContent=selected.description;
  if(returnLink)returnLink.href=selected.returnUrl;
  if(consultantInput)consultantInput.value=selected.name;
  if(fieldSelect)fieldSelect.value=selected.field;

  const form=document.querySelector('[data-consulting-request-form]');
  if(!form)return;

  function getPopup(){
    let popup=document.querySelector('[data-consulting-request-popup]');
    if(popup)return popup;
    popup=document.createElement('div');
    popup.className='consulting-request-popup';
    popup.dataset.consultingRequestPopup='';
    popup.innerHTML='<div class="consulting-request-popup-card"><span>✓</span><h3>컨설팅 요청서가 작성되었습니다.</h3><p>현재는 요청 화면을 구성한 단계입니다. 저장 기능 연결 후 요청 내용 검토와 진행 상태 확인이 가능하도록 확장됩니다.</p><button type="button">확인</button></div>';
    document.body.appendChild(popup);
    const close=()=>{popup.classList.remove('is-open');document.body.style.overflow=''};
    popup.querySelector('button')?.addEventListener('click',close);
    popup.addEventListener('click',event=>{if(event.target===popup)close()});
    return popup;
  }

  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    const popup=getPopup();
    popup.classList.add('is-open');
    document.body.style.overflow='hidden';
  });

  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      document.querySelector('[data-consulting-request-popup]')?.classList.remove('is-open');
      document.body.style.overflow='';
    }
  });
})();