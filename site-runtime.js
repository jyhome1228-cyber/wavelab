(() => {
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  document.documentElement.classList.add('js');

  function ensureStylesheet(href,id){
    if(document.getElementById(id))return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.id=id;
    document.head.appendChild(link);
  }

  function installFooter(){
    ensureStylesheet('footer-current.css?v=20260908-1','aesost-footer-current-css');
    const markup=`<div class="shell">
      <div class="aesost-footer-main">
        <div class="aesost-footer-brand">
          <p class="aesost-footer-kicker">AESOST · WEB & SYSTEM DEVELOPMENT</p>
          <h2 class="aesost-footer-title">필요한 디지털 환경을<br>함께 정리하고 만듭니다.</h2>
          <p class="aesost-footer-copy">기업 홈페이지부터 맞춤형 업무 시스템까지. 에이소스트는 각 기업과 브랜드가 실제로 일하는 방식을 듣고, 필요한 기능과 화면 구조를 그 흐름에 맞춰 설계하고 개발합니다.</p>
          <div class="aesost-footer-name">에이소스트 · AESOST</div>
        </div>
        <div class="aesost-footer-side">
          <div class="aesost-footer-block">
            <span class="aesost-footer-label">PROJECT INQUIRY</span>
            <strong>새로운 홈페이지나<br>업무 시스템이 필요하신가요?</strong>
            <p>기획이 완성되지 않아도 괜찮습니다. 현재 불편한 업무와 필요한 기능부터 함께 정리합니다.</p>
            <a class="aesost-footer-link" href="request.html">프로젝트 문의하기 ↗</a>
          </div>
          <div class="aesost-footer-block">
            <span class="aesost-footer-label">WHAT WE BUILD</span>
            <strong>기업 홈페이지 · 기업관리시스템<br>맞춤형 업무시스템 · 발주 및 대응관리</strong>
            <a class="aesost-footer-link" href="services.html">서비스 보기 ↗</a>
          </div>
          <div class="aesost-footer-block">
            <span class="aesost-footer-label">MENU</span>
            <nav class="aesost-footer-menu" aria-label="푸터 메뉴">
              <a href="about.html">About <span>↗</span></a>
              <a href="services.html">Services <span>↗</span></a>
              <a href="system-solutions.html">System Solutions <span>↗</span></a>
              <a href="works.html">Works <span>↗</span></a>
            </nav>
          </div>
        </div>
      </div>
      <div class="aesost-footer-bottom"><span>WEB · SYSTEM · AUTOMATION · OPERATION</span><span>© 2026 AESOST. SEOUL, KOREA.</span></div>
    </div>`;
    document.querySelectorAll('[data-dev-footer]').forEach(footer=>{footer.innerHTML=markup});
  }

  const boot=()=>{
    installFooter();

    document.querySelectorAll('img').forEach((img,index)=>{
      if(!img.hasAttribute('decoding')) img.decoding='async';
      if(index>0 && !img.hasAttribute('loading')) img.loading='lazy';

      const src=img.getAttribute('src')||'';
      if(src==='assets/dev/work-project-room.svg'){
        img.setAttribute('src','assets/dev/work-project-room.svg?v=20260907-3');
      }
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
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();