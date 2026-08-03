(()=>{
  const grid=document.querySelector('.grid');
  if(!grid||grid.querySelector('[href="magazine-montana-hannam-color-modular.html"]'))return;
  const card=document.createElement('a');
  card.className='card';
  card.dataset.category='디자인';
  card.href='magazine-montana-hannam-color-modular.html';
  card.innerHTML='<div class="real-thumb"><img src="https://design-plus.storage.googleapis.com/wp-content/uploads/2026/05/15115622/20260515025620-0.jpg" alt="컬러와 모듈 가구로 구성된 몬타나 한남 모노 스토어"><span class="label">MAGAZINE · DESIGN · SPACE</span></div><h2>몬타나는 어떻게 컬러와 모듈을 취향의 시스템으로 만들었을까</h2><div class="meta"><span>디자인</span><span>AESOST MAGAZINE</span><span>2026.08.04</span></div>';
  grid.prepend(card);
  window.applyMemberAccess?.(null);
})();