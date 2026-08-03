(()=>{
  document.querySelectorAll('.desktop-nav a[href="expert-feedback.html"],.mobile-nav a[href="expert-feedback.html"]').forEach(link=>link.classList.add('is-active'));

  if(!document.querySelector('[data-search-panel]')){
    const panel=document.createElement('div');
    panel.className='search-panel';
    panel.dataset.searchPanel='';
    panel.innerHTML='<div class="shell search-inner"><div class="search-top"><strong>AESOST SEARCH</strong><button data-search-close>닫기 ×</button></div><input class="search-input" placeholder="검색어를 입력하세요"></div>';
    document.body.appendChild(panel);
    document.querySelectorAll('[data-search-open]').forEach(button=>button.addEventListener('click',()=>{panel.classList.add('is-open');panel.querySelector('input')?.focus()}));
    panel.querySelector('[data-search-close]')?.addEventListener('click',()=>panel.classList.remove('is-open'));
    document.addEventListener('keydown',event=>{if(event.key==='Escape')panel.classList.remove('is-open')});
  }
})();