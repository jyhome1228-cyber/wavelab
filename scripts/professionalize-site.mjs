import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pages=[
  'index.html','about.html','services.html','system-solutions.html','works.html','technology.html','request.html','login.html','404.html',
  'solution-solodesk.html','solution-b2b-inquiry.html','solution-company-cms.html','solution-client-portal.html',
  'solution-booking-os.html','solution-vendor-desk.html','solution-membership-admin.html','solution-support-desk.html',
  'solution-project-room.html','solution-quote-flow.html'
];

const css='company-polish.css?v=20260911-1';
const tag=`  <link id="aesost-company-polish-css" rel="stylesheet" href="${css}">`;
const errors=[];

if(!fs.existsSync(path.join(root,'company-polish.css')))errors.push('company-polish.css is missing');
if(!fs.existsSync(path.join(root,'technology-professional.css')))errors.push('technology-professional.css is missing');

for(const file of pages){
  const full=path.join(root,file);
  if(!fs.existsSync(full)){errors.push(`missing page: ${file}`);continue}
  let html=fs.readFileSync(full,'utf8');
  if(/id=["']aesost-company-polish-css["']/.test(html)){
    html=html.replace(/<link[^>]+id=["']aesost-company-polish-css["'][^>]*>/i,tag.trim());
  }else{
    html=html.replace(/<\/head>/i,`${tag}\n</head>`);
  }
  fs.writeFileSync(full,html);
}

// Technology: sharpen the positioning and replace the repeated architecture block
// with a specification-like engineering scope table.
{
  const file=path.join(root,'technology.html');
  let html=fs.readFileSync(file,'utf8');
  html=html.replace('기술을 나열하지 않고,<br>운영 가능한 시스템으로 연결합니다.','웹, 데이터, 자동화를<br>하나의 시스템으로 설계합니다.');
  html=html.replace('AESOST는 화면만 구현하지 않습니다. 데이터 구조, 사용자 권한, API, 자동화, 배포와 운영까지 하나의 시스템으로 설계합니다.','AESOST는 인터페이스부터 권한, 데이터, API 연동과 배포 구조까지 실제 운영 기준으로 연결해 구축합니다.');
  html=html.replace('화면부터 데이터와 운영 환경까지 하나의 흐름으로 구축합니다.','설계부터 운영까지, 시스템 전 계층을 다룹니다.');

  const scopeSection=`  <section class="section soft technology-structure">
    <div class="shell">
      <div class="section-head">
        <p class="eyebrow">ENGINEERING SCOPE</p>
        <div class="section-copy"><h2 class="section-title">각 계층의 책임을 분리하고, 하나의 운영 구조로 연결합니다.</h2><p>화면, 비즈니스 로직, 데이터와 인프라를 역할별로 나누어 설계해 변경 범위를 명확히 하고 확장과 유지보수에 대응합니다.</p></div>
      </div>
      <div class="engineering-scope" role="table" aria-label="AESOST 엔지니어링 범위">
        <div class="engineering-row" role="row"><span class="engineering-index">01</span><div class="engineering-title"><small>EXPERIENCE LAYER</small><h3>Interface & Design System</h3></div><p>고객, 직원, 관리자 등 사용자별 업무를 화면 구조와 컴포넌트 체계로 정리합니다.</p><div class="engineering-tags"><span>WEB</span><span>ADMIN</span><span>PORTAL</span><span>RESPONSIVE</span></div></div>
        <div class="engineering-row" role="row"><span class="engineering-index">02</span><div class="engineering-title"><small>APPLICATION LAYER</small><h3>Business Logic & Permission</h3></div><p>상태, 승인, 역할과 권한처럼 실제 업무 규칙을 애플리케이션 로직으로 구성합니다.</p><div class="engineering-tags"><span>AUTH</span><span>ROLE</span><span>STATE</span><span>WORKFLOW</span></div></div>
        <div class="engineering-row" role="row"><span class="engineering-index">03</span><div class="engineering-title"><small>DATA & INTEGRATION</small><h3>Data Model & API</h3></div><p>운영 데이터의 관계를 정의하고 결제, 커머스, AI와 외부 서비스를 필요한 범위에서 연결합니다.</p><div class="engineering-tags"><span>DATABASE</span><span>STORAGE</span><span>REST API</span><span>AUTOMATION</span></div></div>
        <div class="engineering-row" role="row"><span class="engineering-index">04</span><div class="engineering-title"><small>INFRASTRUCTURE</small><h3>Deploy & Operation</h3></div><p>도메인, 호스팅, CDN, 배포와 운영 환경까지 서비스가 지속적으로 관리될 수 있게 구성합니다.</p><div class="engineering-tags"><span>CLOUD</span><span>CDN</span><span>DEPLOY</span><span>MONITOR</span></div></div>
      </div>
    </div>
  </section>`;

  html=html.replace(/  <section class="section soft technology-structure">[\s\S]*?<\/section>/,scopeSection);

  const techTag='  <link id="aesost-technology-professional-css" rel="stylesheet" href="technology-professional.css?v=20260911-1">';
  if(/id=["']aesost-technology-professional-css["']/.test(html)){
    html=html.replace(/<link[^>]+id=["']aesost-technology-professional-css["'][^>]*>/i,techTag.trim());
  }else{
    html=html.replace(/<\/head>/i,`${techTag}\n</head>`);
  }
  fs.writeFileSync(file,html);
}

// The professional layer should always be present in the deployed HTML.
for(const file of pages){
  const full=path.join(root,file);
  if(!fs.existsSync(full))continue;
  const html=fs.readFileSync(full,'utf8');
  if(!html.includes('aesost-company-polish-css'))errors.push(`${file}: professional polish stylesheet missing`);
}

const technology=fs.readFileSync(path.join(root,'technology.html'),'utf8');
if(!technology.includes('aesost-technology-professional-css'))errors.push('technology.html: professional technology stylesheet missing');
if(!technology.includes('ENGINEERING SCOPE'))errors.push('technology.html: engineering scope refinement missing');

if(errors.length){
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Applied professional company polish to ${pages.length} deployed pages and refined Technology presentation.`);
