(()=>{
  const listPages=[
    {url:'magazine.html',type:'매거진'},
    {url:'article.html',type:'아티클'},
    {url:'column.html',type:'칼럼'},
    {url:'class.html',type:'클래스'},
    {url:'news.html',type:'뉴스'}
  ];
  const conceptAsset='assets/concept-car-future.svg';
  let indexPromise=null;
  const isConceptImage=image=>{
    const alt=String(image.alt||'');
    const src=String(image.getAttribute('src')||'');
    const card=image.closest('a[href*="magazine-concept-car-future-design"]');
    return Boolean(card)||location.pathname.includes('magazine-concept-car-future-design')||/콘셉트카|콘셉트 디자인|엑스 그란 이퀘이터|아슐릭|원-일레븐|엘렉트라 오빗|EXP 15/.test(alt)||/genesis-x-gran-equator|20260322_183346|15-2-1|10-2-768x960|07-3\.jpg|16-3-1|10-13\.jpg/.test(src);
  };
  const repairConceptImage=image=>{
    if(!isConceptImage(image)||image.dataset.localConceptApplied)return false;
    image.dataset.localConceptApplied='true';
    image.dataset.fallbackApplied='';
    image.style.display='block';
    image.alt=image.alt||'미래 모빌리티 콘셉트카';
    image.src=conceptAsset;
    image.closest('.article-source-image,.real-thumb')?.querySelector('.image-fallback')?.remove();
    return true;
  };
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
      return [...doc.querySelectorAll('.card,.study-card')].map(card=>{
        const href=card.getAttribute('href')||page.url;
        let image=card.querySelector('img')?.getAttribute('src')||'';
        if(href.includes('magazine-concept-car-future-design'))image=conceptAsset;
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
  document.querySelectorAll('img').forEach(image=>repairConceptImage(image));
  document.addEventListener('error',event=>{
    const image=event.target;
    if(!(image instanceof HTMLImageElement))return;
    if(repairConceptImage(image))return;
    if(image.dataset.fallbackApplied)return;
    image.dataset.fallbackApplied='true';
    const parent=image.closest('.article-source-image,.real-thumb');
    image.removeAttribute('src');
    image.alt='이미지를 불러오지 못했습니다.';
    image.style.display='none';
    if(parent&&!parent.querySelector('.image-fallback')){
      const fallback=document.createElement('div');
      fallback.className='image-fallback';
      fallback.innerHTML='<span>✦</span><strong>WAVELAB IMAGE</strong><small>이미지를 불러오지 못했습니다.</small>';
      parent.prepend(fallback);
    }
  },true);
})();