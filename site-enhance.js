(()=>{
  const listPages=[
    {url:'magazine.html',type:'매거진'},
    {url:'article.html',type:'아티클'},
    {url:'column.html',type:'칼럼'},
    {url:'class.html',type:'클래스'},
    {url:'news.html',type:'뉴스'}
  ];

  const conceptImages=[
    {pattern:/미래 콘셉트카|미래 자동차|콘셉트 디자인 모음|미래 이동 방식/i,src:'assets/concept-cars-hero.svg'},
    {pattern:/제네시스 엑스 그란 이퀘이터/i,src:'assets/concept-genesis.svg'},
    {pattern:/아슐릭|AZULIK|모빌리티 EK/i,src:'assets/concept-azulik.svg'},
    {pattern:/비전 원-일레븐|Vision One-Eleven|메르세데스/i,src:'assets/concept-mercedes.svg'},
    {pattern:/뷰익 엘렉트라 오빗|Buick Electra Orbit/i,src:'assets/concept-buick.svg'},
    {pattern:/벤틀리 EXP 15|Bentley EXP 15/i,src:'assets/concept-bentley.svg'}
  ];

  let indexPromise=null;

  function getConceptAsset(image){
    const context=`${image.alt||''} ${image.getAttribute('src')||''} ${image.closest('a')?.getAttribute('href')||''}`;
    if(image.closest('a[href*="magazine-concept-car-future-design"]'))return 'assets/concept-cars-hero.svg';
    if(!location.pathname.includes('magazine-concept-car-future-design')&&!/concept-car-future-design/.test(context))return '';
    return conceptImages.find(item=>item.pattern.test(context))?.src||'assets/concept-cars-hero.svg';
  }

  function applyLocalConceptImage(image){
    const asset=getConceptAsset(image);
    if(!asset||image.dataset.localConceptApplied)return false;
    image.dataset.localConceptApplied='true';
    image.dataset.fallbackApplied='';
    image.style.display='block';
    image.src=asset;
    image.closest('.article-source-image,.real-thumb')?.querySelector('.image-fallback')?.remove();
    return true;
  }

  function removeSourceLabels(root=document){
    root.querySelectorAll('figcaption').forEach(caption=>caption.remove());
    root.querySelectorAll('.article-origin-note').forEach(note=>note.remove());
    root.querySelectorAll('.article-body p,.article-body small,.news-body p,.column-body p').forEach(element=>{
      if(/이미지\s*출처|사진\s*출처|자료\s*출처|참고\s*(기사|자료)|원문\s*(보기|출처)/i.test(element.textContent||''))element.remove();
    });
    root.querySelectorAll('.article-body a,.news-body a,.column-body a').forEach(link=>{
      const text=link.textContent||'';
      if(/원문|참고\s*(기사|글|자료)|출처|Design\+|브런치/i.test(text))link.remove();
    });
  }

  removeSourceLabels();
  document.querySelectorAll('img').forEach(applyLocalConceptImage);

  const createPanel=()=>{
    let panel=document.querySelector('[data-search-panel]');
    if(!panel){
      panel=document.createElement('div');
      panel.className='search-panel';
      panel.dataset.searchPanel='';
      document.body.appendChild(panel);
    }
    panel.innerHTML=`<div class="search-inner"><div class="search-top"><strong>WAVELAB SEARCH</strong><button type="button" data-search-close aria-label="검색 닫기">닫기</button></div><input class="search-input" type="search" placeholder="제목, 분야, 키워드를 검색하세요" autocomplete="off"><p class="wavelab-search-help">매거진, 아티클, 칼럼, 클래스와 뉴스에서 검색합니다.</p><div class="wavelab-search-results" data-search-results><div class="wavelab-search-empty">검색어를 입력하면 관련 콘텐츠가 표시됩니다.</div></div></div>`;
    return panel;
  };

  const panel=createPanel();
  const input=panel.querySelector('.search-input');
  const results=panel.querySelector('[data-search-results]');
  const escape=value=>String(value||'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  const buildIndex=()=>indexPromise||(indexPromise=Promise.all(listPages.map(async page=>{
    try{
      const response=await fetch(`${page.url}?searchIndex=1`,{cache:'no-store'});
      if(!response.ok)return[];
      const html=await response.text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      removeSourceLabels(doc);
      return [...doc.querySelectorAll('.card,.study-card')].map(card=>{
        const href=card.getAttribute('href')||page.url;
        let image=card.querySelector('img')?.getAttribute('src')||'';
        if(href.includes('magazine-concept-car-future-design'))image='assets/concept-cars-hero.svg';
        return {
          title:card.querySelector('h2,h3,strong')?.textContent?.trim()||'',
          meta:card.querySelector('.meta,.study-info')?.textContent?.replace(/\s+/g,' ').trim()||'',
          href,
          image,
          type:page.type
        };
      }).filter(item=>item.title);
    }catch{return[]}
  })).then(groups=>groups.flat()));

  const render=async query=>{
    const keyword=query.trim().toLowerCase();
    if(!keyword){results.innerHTML='<div class="wavelab-search-empty">검색어를 입력하면 관련 콘텐츠가 표시됩니다.</div>';return;}
    results.innerHTML='<div class="wavelab-search-empty">콘텐츠를 찾고 있습니다.</div>';
    const items=await buildIndex();
    const matched=items.filter(item=>`${item.title} ${item.meta} ${item.type}`.toLowerCase().includes(keyword)).slice(0,20);
    results.innerHTML=matched.length?matched.map(item=>`<a class="wavelab-search-result" href="${escape(item.href)}">${item.image?`<img src="${escape(item.image)}" alt="" loading="lazy">`:'<span></span>'}<div><strong>${escape(item.title)}</strong><span>${escape(item.type)}${item.meta?` · ${escape(item.meta)}`:''}</span></div><em>↗</em></a>`).join(''):'<div class="wavelab-search-empty">일치하는 콘텐츠가 없습니다. 다른 키워드로 검색해 보세요.</div>';
  };

  let timer;
  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>render(input.value),180)});
  document.querySelectorAll('[data-search-open]').forEach(trigger=>trigger.addEventListener('click',event=>{
    event.preventDefault();
    panel.classList.add('is-open');
    document.body.style.overflow='hidden';
    setTimeout(()=>input.focus(),50);
  }));
  panel.querySelector('[data-search-close]').addEventListener('click',()=>{panel.classList.remove('is-open');document.body.style.overflow=''});
  panel.addEventListener('click',event=>{if(event.target===panel){panel.classList.remove('is-open');document.body.style.overflow=''}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){panel.classList.remove('is-open');document.body.style.overflow=''}});

  document.addEventListener('error',event=>{
    const image=event.target;
    if(!(image instanceof HTMLImageElement))return;
    if(applyLocalConceptImage(image))return;
    if(image.dataset.fallbackApplied)return;
    image.dataset.fallbackApplied='true';
    const parent=image.closest('.article-source-image,.real-thumb');
    image.removeAttribute('src');
    image.alt='이미지를 불러오지 못했습니다.';
    image.style.display='none';
    if(parent&&!parent.querySelector('.image-fallback')){
      const fallback=document.createElement('div');
      fallback.className='image-fallback';
      fallback.innerHTML='<span>✦</span><strong>WAVELAB IMAGE</strong>';
      parent.prepend(fallback);
    }
  },true);
})();