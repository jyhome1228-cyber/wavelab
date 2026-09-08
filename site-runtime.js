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
    ensureStylesheet('footer-current.css?v=20260908-2','aesost-footer-current-css');
    const markup=`<div class="shell">
      <div class="aesost-footer-main">
        <div class="aesost-footer-brand">
          <a class="aesost-footer-logo" href="index.html" aria-label="AESOST 홈"><img src="aesost-logo-dark.svg?v=20260907-1" alt="AESOST"></a>
          <p class="aesost-footer-kicker">WEB & SYSTEM DEVELOPMENT</p>
          <p class="aesost-footer-copy">기업 홈페이지부터 맞춤형 업무 시스템까지. 에이소스트는 각 기업과 브랜드의 실제 업무 방식을 듣고 필요한 기능, 화면과 운영 구조를 함께 설계하고 개발합니다.</p>
          <dl class="aesost-business-info" aria-label="에이소스트 사업자 정보">
            <div class="aesost-business-row"><dt>상호</dt><dd>에이소스트 (AESOST)</dd></div>
            <div class="aesost-business-row"><dt>대표</dt><dd>박재영</dd></div>
            <div class="aesost-business-row"><dt>사업자등록번호</dt><dd>820-13-02834</dd></div>
            <div class="aesost-business-row"><dt>업태</dt><dd>부동산업</dd></div>
            <div class="aesost-business-row is-wide"><dt>사업장 소재지</dt><dd>인천광역시 서구 원당대로 1039, 9층 915호 (원당동, 태경타워)</dd></div>
            <div class="aesost-business-row is-wide"><dt>종목</dt><dd>비주거용 건물 임대업 (공유오피스 임대)</dd></div>
          </dl>
        </div>
        <div class="aesost-footer-side">
          <div class="aesost-footer-block">
            <span class="aesost-footer-label">PROJECT INQUIRY</span>
            <strong>홈페이지·업무 시스템 개발 문의</strong>
            <p>완성된 기획서가 없어도 괜찮습니다. 필요한 범위부터 함께 정리합니다.</p>
            <a class="aesost-footer-link" href="request.html">프로젝트 문의하기 ↗</a>
          </div>
          <div class="aesost-footer-block">
            <span class="aesost-footer-label">SERVICES</span>
            <p>기업 홈페이지 · 기업관리시스템 · 맞춤형 업무시스템 · 발주 및 대응관리시스템</p>
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
      <div class="aesost-footer-bottom"><span>WEB · SYSTEM · AUTOMATION · OPERATION</span><span>© 2026 AESOST. ALL RIGHTS RESERVED.</span></div>
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