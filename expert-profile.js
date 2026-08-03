(()=>{
  const form=document.querySelector('[data-expert-consult-form]');
  if(!form)return;

  function getPopup(){
    let popup=document.querySelector('[data-expert-ui-popup]');
    if(popup)return popup;
    popup=document.createElement('div');
    popup.className='expert-ui-popup';
    popup.dataset.expertUiPopup='';
    popup.innerHTML='<div class="expert-ui-card"><span>✦</span><h3>고민 남기기 화면이 준비되었습니다.</h3><p>현재는 프로필과 상담 UI를 구성한 단계입니다. Firebase 연결 후 선택한 대표님에게 내용이 전달되고 답변 상태를 확인할 수 있게 연결됩니다.</p><button type="button">확인</button></div>';
    document.body.appendChild(popup);
    const close=()=>{popup.classList.remove('is-open');document.body.style.overflow=''};
    popup.querySelector('button').addEventListener('click',close);
    popup.addEventListener('click',event=>{if(event.target===popup)close()});
    return popup;
  }

  form.addEventListener('submit',event=>{
    event.preventDefault();
    const title=form.elements.title?.value.trim();
    const situation=form.elements.situation?.value.trim();
    const question=form.elements.question?.value.trim();
    const agree=form.elements.agree?.checked;
    if(!title||!situation||!question){
      form.elements[!title?'title':!situation?'situation':'question']?.focus();
      return;
    }
    if(!agree){form.elements.agree?.focus();return;}
    const popup=getPopup();
    popup.classList.add('is-open');
    document.body.style.overflow='hidden';
  });
})();