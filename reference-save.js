(()=>{
  const STORAGE_KEY='aesost:my-references';
  const read=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}};
  const write=items=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(items));window.dispatchEvent(new CustomEvent('aesost:references-updated'))};
  const page=location.pathname.split('/').pop()||'';

  function currentReference(){
    const title=document.body.dataset.articleTitle||document.querySelector('.reference-detail-hero h1')?.textContent.trim();
    if(!title)return null;
    const designer=document.querySelector('.reference-eyebrow')?.textContent.trim()||'OVERSEAS REFERENCE';
    const image=document.querySelector('meta[property="og:image"]')?.content||document.querySelector('.reference-source-gallery img')?.src||'';
    const summary=document.querySelector('.reference-detail-summary')?.textContent.trim()||'';
    return {id:document.body.dataset.articleId||page,title,designer,image,summary,href:page,savedAt:Date.now()};
  }

  function addActions(){
    const metaCard=document.querySelector('.reference-meta-card');
    if(!metaCard||metaCard.querySelector('[data-reference-save]'))return;
    const item=currentReference();
    if(!item)return;

    metaCard.querySelector('dl')?.remove();
    metaCard.querySelector('.reference-source-button')?.remove();

    const actions=document.createElement('div');
    actions.className='reference-save-actions';
    actions.innerHTML='<button class="reference-save-button" type="button" data-reference-save>나의 레퍼런스에 담기</button><button class="reference-share-button" type="button" data-reference-share>공유하기</button>';
    metaCard.appendChild(actions);

    const saveButton=actions.querySelector('[data-reference-save]');
    const shareButton=actions.querySelector('[data-reference-share]');

    const renderSaveState=()=>{
      const saved=read().some(entry=>entry.id===item.id);
      saveButton.classList.toggle('is-saved',saved);
      saveButton.textContent=saved?'담김 ✓':'나의 레퍼런스에 담기';
    };

    saveButton.addEventListener('click',()=>{
      const items=read();
      const exists=items.some(entry=>entry.id===item.id);
      write(exists?items.filter(entry=>entry.id!==item.id):[{...item,savedAt:Date.now()},...items]);
      renderSaveState();
    });

    shareButton.addEventListener('click',async()=>{
      const shareData={title:item.title,text:item.summary,url:location.href};
      try{
        if(navigator.share)await navigator.share(shareData);
        else{
          await navigator.clipboard.writeText(location.href);
          shareButton.textContent='링크 복사됨';
          setTimeout(()=>{shareButton.textContent='공유하기'},1600);
        }
      }catch{}
    });

    renderSaveState();
  }

  function renderCollection(){
    const grid=document.querySelector('[data-my-reference-list]');
    if(!grid)return;
    const items=read();
    if(!items.length){
      grid.innerHTML='<div class="my-reference-empty"><strong>아직 담아둔 레퍼런스가 없습니다.</strong><p>해외 레퍼런스에서 프로젝트를 열고 ‘나의 레퍼런스에 담기’를 눌러보세요.</p><a href="reference.html">해외 레퍼런스 보기</a></div>';
      return;
    }
    grid.innerHTML=items.map(item=>`<article class="my-reference-card" data-reference-id="${item.id}"><a href="${item.href}"><div class="my-reference-thumb"><img src="${item.image}" alt="${item.title}" loading="lazy"></div><h3>${item.title}</h3><p>${item.designer}</p></a><button class="my-reference-remove" type="button" data-remove-reference>목록에서 제거</button></article>`).join('');
    grid.querySelectorAll('[data-remove-reference]').forEach(button=>button.addEventListener('click',()=>{
      const card=button.closest('[data-reference-id]');
      write(read().filter(item=>item.id!==card.dataset.referenceId));
      renderCollection();
    }));
  }

  if(document.body.classList.contains('reference-detail-page'))addActions();
  if(page==='my-references.html')renderCollection();
  window.addEventListener('aesost:references-updated',renderCollection);
})();