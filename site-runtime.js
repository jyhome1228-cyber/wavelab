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
    ensureStylesheet('footer-current.css?v=20260911-1','aesost-footer-current-css');
    ensureStylesheet('company-polish.css?v=20260911-1','aesost-company-polish-css');
    const markup=`<div class="shell">
      <div class="aesost-footer-main">
        <div class="aesost-footer-brand">
          <a class="aesost-footer-logo" href="index.html" aria-label="AESOST 홈"><img src="aesost-logo-dark.svg?v=20260907-1" alt="AESOST"></a>
          <p class="aesost-footer-kicker">WEB · SYSTEM · TECHNOLOGY</p>
          <p class="aesost-footer-copy">기업 홈페이지부터 맞춤형 업무 시스템까지. 에이소스트는 실제 업무 방식을 기준으로 정보 구조, UI, 데이터와 운영 환경을 함께 설계하고 개발합니다.</p>
          <dl class="aesost-business-info" aria-label="에이소스트 사업자 정보">
            <div class="aesost-business-row"><dt>상호</dt><dd>에이소스트 (AESOST)</dd></div>
            <div class="aesost-business-row"><dt>대표</dt><dd>박재영</dd></div>
            <div class="aesost-business-row"><dt>사업자등록번호</dt><dd>820-13-02834</dd></div>
            <div class="aesost-business-row"><dt>업태</dt><dd>정보통신업</dd></div>
            <div class="aesost-business-row is-wide"><dt>사업장 소재지</dt><dd>인천광역시 서구 원당대로 1039, 9층 915호 (원당동, 태경타워)</dd></div>
            <div class="aesost-business-row is-wide"><dt>종목</dt><dd>응용 소프트웨어 개발 및 공급업</dd></div>
          </dl>
        </div>
        <div class="aesost-footer-side">
          <div class="aesost-footer-block">
            <span class="aesost-footer-label">PROJECT INQUIRY</span>
            <strong>웹과 시스템을 한 흐름으로 구축합니다.</strong>
            <p>완성된 기획서보다 현재 해결해야 하는 문제와 운영 방식을 먼저 확인합니다.</p>
            <a class="aesost-footer-link" href="request.html">프로젝트 문의하기 ↗</a>
          </div>
          <div class="aesost-footer-block">
            <span class="aesost-footer-label">CAPABILITY</span>
            <p>Corporate Website · Business System · Data · API · Automation · Cloud</p>
            <a class="aesost-footer-link" href="technology.html">기술 역량 보기 ↗</a>
          </div>
          <div class="aesost-footer-block">
            <span class="aesost-footer-label">MENU</span>
            <nav class="aesost-footer-menu" aria-label="푸터 메뉴">
              <a href="about.html">About <span>↗</span></a>
              <a href="services.html">Services <span>↗</span></a>
              <a href="system-solutions.html">System Solutions <span>↗</span></a>
              <a href="works.html">Works <span>↗</span></a>
              <a href="technology.html">Technology <span>↗</span></a>
            </nav>
          </div>
        </div>
      </div>
      <div class="aesost-footer-bottom"><span>STRATEGY · UI · DEVELOPMENT · OPERATION</span><span>© 2026 AESOST. ALL RIGHTS RESERVED.</span></div>
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
