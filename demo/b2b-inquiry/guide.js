(()=>{
  document.body.classList.add('b2b-demo-light');

  if(!document.getElementById('b2b-demo-light-css')){
    const light=document.createElement('link');
    light.id='b2b-demo-light-css';
    light.rel='stylesheet';
    light.href='light.css?v=20260910-1';
    document.head.appendChild(light);
  }

  const themeMeta=document.querySelector('meta[name="theme-color"]');
  if(themeMeta)themeMeta.setAttribute('content','#ffffff');

  const params=new URLSearchParams(location.search);
  const view=params.get('view');
  if(view){
    const btn=document.querySelector(`[data-view="${view}"]`);
    btn?.click();
  }

  if(params.get('guide')==='1'){
    document.body.classList.add('guide-mode');
    document.querySelectorAll('button,input,select').forEach(el=>{
      if(!el.classList.contains('nav-item'))el.setAttribute('tabindex','-1');
    });
  }
})();
