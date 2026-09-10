(()=>{
  document.body.classList.add('solodesk-demo-light');

  if(!document.getElementById('solodesk-demo-light-css')){
    const solodeskDemoLightStylesheet=document.createElement('link');
    solodeskDemoLightStylesheet.id='solodesk-demo-light-css';
    solodeskDemoLightStylesheet.rel='stylesheet';
    solodeskDemoLightStylesheet.href='light.css?v=20260910-1';
    document.head.appendChild(solodeskDemoLightStylesheet);
  }

  const solodeskDemoThemeMeta=document.querySelector('meta[name="theme-color"]');
  if(solodeskDemoThemeMeta)solodeskDemoThemeMeta.setAttribute('content','#ffffff');

  const params=new URLSearchParams(location.search);
  const requested=params.get('view');
  const allowed=['dashboard','clients','projects','finance'];
  if(allowed.includes(requested)){
    requestAnimationFrame(()=>document.querySelector(`[data-view="${requested}"]`)?.click());
  }
  if(params.get('guide')==='1')document.body.classList.add('is-guide-preview');
})();
