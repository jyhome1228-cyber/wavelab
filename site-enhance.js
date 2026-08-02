(()=>{
  const listPages=[
    {url:'magazine.html',type:'매거진'},
    {url:'overseas-magazine.html',type:'해외 매거진'},
    {url:'article.html',type:'아티클'},
    {url:'column.html',type:'칼럼'},
    {url:'class.html',type:'클래스'},
    {url:'news.html',type:'뉴스'}
  ];
  const liquidGlassThumbnail='https://www.designdb.com/usr/upload/editor/email/20260630140528543eec8d-d255-454a-b93f-8a06669c306d.png';
  let indexPromise=null;

  function brandText(value=''){
    return String(value)
      .replaceAll('WAVELAB','AESOST')
      .replaceAll('웨이블랩','에이소스트')
      .replaceAll('MY WAVELAB','MY AESOST')
      .replaceAll('WAVELAB MEMBER','AESOST MEMBER')
      .replaceAll('WAVELAB COLUMNIST','AESOST COLUMNIST')
      .replaceAll('WAVELAB MAJOR COLUMNIST','AESOST MAJOR COLUMNIST');
  }
  function applyAesostBrand(root=document){
    const walker=document.createTreeWalker(root.body||root,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const parent=node.parentElement;
      if(!parent||['SCRIPT','STYLE','TEXTAREA','INPUT','OPTION'].includes(parent.tagName))return NodeFilter.FILTER_REJECT;
      return /WAVELAB|웨이블랩/.test(node.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>node.nodeValue=brandText(node.nodeValue));
    root.querySelectorAll?.('[title],[aria-label],[placeholder],meta[content]').forEach(el=>{
      ['title','aria-label','placeholder','content'].forEach(attr=>{if(el.hasAttribute(attr))el.setAttribute(attr,brandText(el.getAttribute(attr)))});
    });
    if(root===document)document.title=brandText(document.title);
  }

  function replaceKnownThumbnails(root=document){
    root.querySelectorAll?.('a[href*="magazine-apple-liquid-glass-usability.html"] img').forEach(image=>{
      image.src=liquidGlassThumbnail;
      image.alt='리퀴드 글래스 투명도 조절 화면';
      image.dataset.fallbackApplied='';
      image.style.display='block';
    });
  }

  function overseasIcon(){
    return '<span class="mobile-menu-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg></span>';
  }

  function setupOverseasMagazineNavigation(){
    const isOverseas=location.pathname.endsWith('/overseas-magazine.html')||location.pathname.endsWith('overseas-magazine.html');
    const desktop=document.querySelector('.desktop-nav');
    if(desktop&&!desktop.querySelector('a[href="overseas-magazine.html"]')){
      const magazine=desktop.querySelector('a[href="magazine.html"]');
      const link=document.createElement('a');link.href='overseas-magazine.html';link.textContent='해외 매거진';if(isOverseas)link.classList.add('is-active');magazine?.insertAdjacentElement('afterend',link);
    }
    const mobileLinks=document.querySelector('.mobile-menu-links');
    if(mobileLinks&&!mobileLinks.querySelector('a[href="overseas-magazine.html"]')){
      const magazine=mobileLinks.querySelector('a[href="magazine.html"]');
      const link=document.createElement('a');link.href='overseas-magazine.html';link.className=`mobile-menu-link${isOverseas?' is-active':''}`;link.innerHTML=`${overseasIcon()}<span class="mobile-menu-label">해외 매거진</span><span class="mobile-menu-arrow" aria-hidden="true">›</span>`;magazine?.insertAdjacentElement('afterend',link);
    }
    const footerContent=[...document.querySelectorAll('.footer h3')].find(el=>el.textContent.trim()==='CONTENT')?.parentElement?.querySelector('nav');
    if(footerContent&&!footerContent.querySelector('a[href="overseas-magazine.html"]')){
      const magazine=footerContent.querySelector('a[href="magazine.html"]');const link=document.createElement('a');link.href='overseas-magazine.html';link.textContent='해외 매거진';magazine?.insertAdjacentElement('afterend',link);
    }
    if(location.pathname.endsWith('/magazine.html')||location.pathname.endsWith('magazine.html')){
      document.querySelector('.overseas-magazine-intro')?.remove();
      document.querySelector('[data-filter="해외 매거진"]')?.remove();
      document.querySelectorAll('.card[data-category="해외 매거진"]').forEach(card=>card.remove());
      const desc=document.querySelector('.page-head p');if(desc)desc.textContent='디자인, 기술, 비즈니스와 문화에서 발생하는 새로운 흐름을 발견하고 이해하기 쉽게 재해석합니다.';
    }
  }

  function cardDate(card){
    const text=[...card.querySelectorAll('.meta span')].map(el=>el.textContent.trim()).find(value=>/^\d{4}\.\d{2}\.\d{2}$/.test(value));
    return text?new Date(`${text.replaceAll('.','-')}T00:00:00`).getTime():0;
  }
  function refreshFreeContent(){
    const pageName=location.pathname.split('/').pop()||'index.html';
    if(!['magazine.html','overseas-magazine.html','article.html','column.html','class.html','news.html'].includes(pageName))return;
    const grid=document.querySelector('.grid,.study-grid');if(!grid)return;
    grid.querySelector('.member-gate-banner')?.remove();
    const cards=[...grid.querySelectorAll(':scope > .card,:scope > .study-card')];
    cards.forEach(card=>{
      card.classList.remove('member-locked');
      card.querySelector('.member-lock-overlay')?.remove();
      if(card.dataset.originalHref)card.setAttribute('href',card.dataset.originalHref);
    });
    cards.sort((a,b)=>cardDate(b)-cardDate(a)).forEach(card=>grid.appendChild(card));
    window.applyMemberAccess?.(window.WAVELAB_AUTH_USER||null);
  }

  function removeSourceLabels(root=document){
    root.querySelectorAll('figcaption').forEach(caption=>caption.remove());
    root.querySelectorAll('.article-origin-note').forEach(note=>note.remove());
    root.querySelectorAll('.article-body p,.article-body small,.news-body p,.column-body p').forEach(element=>{
      if(/이미지\s*출처|사진\s*출처|자료\s*출처|참고\s*(기사|자료)|원문\s*(보기|출처)/i.test(element.textContent||''))element.remove();
    });
    root.querySelectorAll('.article-body a,.news-body a,.column-body a').forEach(link=>{
      const text=link.textContent||'';if(/원문|참고\s*(기사|글|자료)|출처|Design\+|브런치/i.test(text))link.remove();
    });
  }

  removeSourceLabels();applyAesostBrand();replaceKnownThumbnails();setupOverseasMagazineNavigation();refreshFreeContent();
  setTimeout(()=>{applyAesostBrand();replaceKnownThumbnails();setupOverseasMagazineNavigation();refreshFreeContent()},500);
  setTimeout(()=>{applyAesostBrand();replaceKnownThumbnails();setupOverseasMagazineNavigation();refreshFreeContent()},1600);
  window.addEventListener('pageshow',refreshFreeContent);

  const createPanel=()=>{
    let panel=document.querySelector('[data-search-panel]');if(!panel){panel=document.createElement('div');panel.className='search-panel';panel.dataset.searchPanel='';document.body.appendChild(panel)}
    panel.innerHTML=`<div class="search-inner"><div class="search-top"><strong>AESOST SEARCH</strong><button type="button" data-search-close aria-label="검색 닫기">닫기</button></div><input class="search-input" type="search" placeholder="제목, 분야, 키워드를 검색하세요" autocomplete="off"><p class="wavelab-search-help">매거진, 해외 매거진, 아티클, 칼럼, 클래스와 뉴스에서 검색합니다.</p><div class="wavelab-search-results" data-search-results><div class="wavelab-search-empty">검색어를 입력하면 관련 콘텐츠가 표시됩니다.</div></div></div>`;return panel;
  };
  const panel=createPanel(),input=panel.querySelector('.search-input'),results=panel.querySelector('[data-search-results]');
  const escape=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const buildIndex=()=>indexPromise||(indexPromise=Promise.all(listPages.map(async page=>{try{const response=await fetch(`${page.url}?searchIndex=1`,{cache:'no-store'});if(!response.ok)return[];const html=await response.text();const doc=new DOMParser().parseFromString(html,'text/html');removeSourceLabels(doc);applyAesostBrand(doc);replaceKnownThumbnails(doc);return [...doc.querySelectorAll('.card,.study-card')].map(card=>({title:card.querySelector('h2,h3,strong')?.textContent?.trim()||'',meta:card.querySelector('.meta,.study-info')?.textContent?.replace(/\s+/g,' ').trim()||'',href:card.getAttribute('href')||page.url,image:card.querySelector('img')?.getAttribute('src')||'',type:page.type})).filter(item=>item.title)}catch{return[]}})).then(groups=>groups.flat()));
  const render=async query=>{const keyword=query.trim().toLowerCase();if(!keyword){results.innerHTML='<div class="wavelab-search-empty">검색어를 입력하면 관련 콘텐츠가 표시됩니다.</div>';return}results.innerHTML='<div class="wavelab-search-empty">콘텐츠를 찾고 있습니다.</div>';const items=await buildIndex();const matched=items.filter(item=>`${item.title} ${item.meta} ${item.type}`.toLowerCase().includes(keyword)).slice(0,20);results.innerHTML=matched.length?matched.map(item=>`<a class="wavelab-search-result" href="${escape(item.href)}">${item.image?`<img src="${escape(item.image)}" alt="" loading="lazy">`:'<span></span>'}<div><strong>${escape(item.title)}</strong><span>${escape(item.type)}${item.meta?` · ${escape(item.meta)}`:''}</span></div><em>↗</em></a>`).join(''):'<div class="wavelab-search-empty">일치하는 콘텐츠가 없습니다. 다른 키워드로 검색해 보세요.</div>'};
  let timer;input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>render(input.value),180)});
  document.querySelectorAll('[data-search-open]').forEach(trigger=>trigger.addEventListener('click',event=>{event.preventDefault();panel.classList.add('is-open');document.body.style.overflow='hidden';setTimeout(()=>input.focus(),50)}));
  panel.querySelector('[data-search-close]').addEventListener('click',()=>{panel.classList.remove('is-open');document.body.style.overflow=''});
  panel.addEventListener('click',event=>{if(event.target===panel){panel.classList.remove('is-open');document.body.style.overflow=''}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){panel.classList.remove('is-open');document.body.style.overflow=''}});
  document.addEventListener('error',event=>{const image=event.target;if(!(image instanceof HTMLImageElement)||image.dataset.fallbackApplied)return;image.dataset.fallbackApplied='true';const parent=image.closest('.article-source-image,.real-thumb');image.removeAttribute('src');image.alt='이미지를 불러오지 못했습니다.';image.style.display='none';if(parent&&!parent.querySelector('.image-fallback')){const fallback=document.createElement('div');fallback.className='image-fallback';fallback.innerHTML='<span>●</span><strong>AESOST IMAGE</strong>';parent.prepend(fallback)}},true);
})();