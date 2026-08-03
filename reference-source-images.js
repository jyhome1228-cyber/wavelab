(()=>{
  const sourceUrl='https://worldbranddesign.com/that-joe-pizza-shop-branding-by-tanaya-designs';
  const gallery=document.querySelector('[data-reference-source-gallery]');
  const thumbnails=[...document.querySelectorAll('[data-reference-source-thumbnail]')];
  if(!gallery&&!thumbnails.length)return;

  const screenshotFallback=`https://api.microlink.io/?url=${encodeURIComponent(sourceUrl)}&screenshot=true&embed=screenshot.url&screenshot.fullPage=true&screenshot.type=jpeg`;

  function absoluteUrl(value){
    if(!value)return null;
    const raw=String(value).trim().split(/\s+/)[0];
    if(!raw||raw.startsWith('data:')||raw.startsWith('blob:'))return null;
    try{return new URL(raw,sourceUrl).href}catch{return null}
  }

  function normalize(items){
    const urls=[];
    const seen=new Set();
    for(const item of items.flat(Infinity)){
      const value=typeof item==='string'?item:item?.url||item?.src||item?.value;
      const url=absoluteUrl(value);
      if(!url||seen.has(url))continue;
      const lower=url.toLowerCase();
      if(/logo|avatar|icon|emoji|favicon|loader|spinner|badge/.test(lower))continue;
      if(/\.svg(?:\?|$)/.test(lower))continue;
      if(!/\.(?:jpe?g|png|webp|avif)(?:\?|$)/.test(lower)&&!lower.includes('wp-content/uploads'))continue;
      seen.add(url);
      urls.push(url);
    }
    return urls.sort((a,b)=>Number(b.includes('wp-content/uploads'))-Number(a.includes('wp-content/uploads'))).slice(0,12);
  }

  function parseHtml(html){
    const doc=new DOMParser().parseFromString(html,'text/html');
    const nodes=[...doc.querySelectorAll('article img,.entry-content img,.post-content img,main img,img')];
    const values=[];
    nodes.forEach(img=>{
      const width=Number(img.getAttribute('width')||0);
      const height=Number(img.getAttribute('height')||0);
      if(width&&height&&(width<400||height<300))return;
      values.push(img.getAttribute('data-src'),img.getAttribute('data-lazy-src'),img.currentSrc,img.getAttribute('src'));
      const srcset=img.getAttribute('data-srcset')||img.getAttribute('srcset');
      if(srcset){
        const largest=srcset.split(',').map(part=>part.trim().split(/\s+/)[0]).filter(Boolean).pop();
        values.push(largest);
      }
    });
    return normalize(values);
  }

  async function viaAllOrigins(){
    const endpoint=`https://api.allorigins.win/raw?url=${encodeURIComponent(sourceUrl)}`;
    const response=await fetch(endpoint,{cache:'force-cache'});
    if(!response.ok)throw new Error('source proxy failed');
    return parseHtml(await response.text());
  }

  async function viaMicrolink(){
    const endpoint=new URL('https://api.microlink.io/');
    endpoint.searchParams.set('url',sourceUrl);
    endpoint.searchParams.set('data.images.selectorAll','img');
    endpoint.searchParams.set('data.images.attr','src');
    endpoint.searchParams.set('prerender','true');
    const response=await fetch(endpoint,{cache:'force-cache'});
    if(!response.ok)throw new Error('metadata service failed');
    const payload=await response.json();
    const images=payload?.data?.images;
    if(Array.isArray(images))return normalize(images);
    if(images&&typeof images==='object')return normalize(Object.values(images));
    return [];
  }

  function updateThumbnails(url){
    thumbnails.forEach(img=>{
      img.src=url;
      img.removeAttribute('referrerpolicy');
      img.onerror=()=>{img.src=screenshotFallback};
    });
  }

  function renderGallery(urls){
    if(!gallery)return;
    gallery.innerHTML='';
    gallery.classList.remove('is-loading');
    const list=urls.length?urls:[screenshotFallback];
    list.forEach((url,index)=>{
      const figure=document.createElement('figure');
      figure.className='reference-source-item';
      const img=document.createElement('img');
      img.src=url;
      img.alt=`That Joe Pizza Shop 브랜딩 프로젝트 이미지 ${index+1}`;
      img.loading=index<2?'eager':'lazy';
      img.decoding='async';
      img.onerror=()=>figure.remove();
      const caption=document.createElement('figcaption');
      caption.textContent='That Joe Pizza Shop · Tanaya Designs · World Brand Design Society';
      figure.append(img,caption);
      gallery.appendChild(figure);
    });
  }

  async function load(){
    let urls=[];
    try{urls=await viaAllOrigins()}catch{}
    if(urls.length<2){try{urls=await viaMicrolink()}catch{}}
    if(urls.length)updateThumbnails(urls[0]);
    else updateThumbnails(screenshotFallback);
    renderGallery(urls);
  }

  load();
})();
