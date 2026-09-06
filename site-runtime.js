(() => {
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  document.documentElement.classList.add('js');

  document.querySelectorAll('img').forEach((img,index)=>{
    if(!img.hasAttribute('decoding')) img.decoding='async';
    if(index>0 && !img.hasAttribute('loading')) img.loading='lazy';
  });

  document.querySelectorAll('a[href]').forEach(link=>{
    const href=link.getAttribute('href')||'';
    if(/^https?:\/\//i.test(href) && !href.includes(location.hostname)){
      link.target='_blank';
      link.rel='noopener noreferrer';
    }
  });

  const ids=new Set([...document.querySelectorAll('[id]')].map(el=>el.id));
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    const target=link.getAttribute('href').slice(1);
    if(target && !ids.has(target)) link.setAttribute('aria-disabled','true');
  });

  document.body.dataset.page=page.replace('.html','');
})();
