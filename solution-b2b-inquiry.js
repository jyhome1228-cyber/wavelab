document.body.classList.add('b2b-inquiry-light');

if(!document.getElementById('b2b-inquiry-light-css')){
  const light=document.createElement('link');
  light.id='b2b-inquiry-light-css';
  light.rel='stylesheet';
  light.href='solution-b2b-inquiry-light.css?v=20260910-1';
  document.head.appendChild(light);
}

const themeMeta=document.querySelector('meta[name="theme-color"]');
if(themeMeta)themeMeta.setAttribute('content','#ffffff');
else{
  const metaTheme=document.createElement('meta');
  metaTheme.name='theme-color';
  metaTheme.content='#ffffff';
  document.head.appendChild(metaTheme);
}

const heroVisual=document.querySelector('.solution-detail-visual img');
if(heroVisual){
  heroVisual.src='assets/dev/work-b2b-inquiry-light.svg?v=20260910-1';
}

const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');

const copy={
  dashboard:{title:'Dashboard',description:'신규 문의, 진행 중 상담, 견적 금액과 예상 계약 금액을 한 화면에서 확인하고 다음 연락 일정까지 빠르게 파악합니다.',meta:'LEADS · PIPELINE · FOLLOW-UP'},
  inquiries:{title:'Inquiries',description:'회사명, 담당자, 요청 서비스, 예산, 유입경로와 현재 영업 상태를 문의 단위로 정리하고 검색합니다.',meta:'COMPANY · SERVICE · BUDGET'},
  pipeline:{title:'Pipeline',description:'문의 카드를 New → Contacted → Proposal → Negotiation → Won 단계로 이동하며 현재 영업 흐름을 직관적으로 관리합니다.',meta:'NEW · PROPOSAL · WON'},
  companies:{title:'Companies',description:'같은 기업에서 들어온 문의 수와 누적 예상 금액, 담당자 정보를 기업 단위로 모아 확인합니다.',meta:'COMPANY DB · CONTACT · VALUE'},
  quotes:{title:'Quotes',description:'발송한 견적과 제안 금액, 발송일, 협의·승인 상태를 한 곳에서 확인합니다.',meta:'QUOTE · AMOUNT · STATUS'}
};

function activate(view){
  if(!copy[view]||!frame)return;
  tabs.forEach(tab=>tab.classList.toggle('is-active',tab.dataset.solutionTab===view));
  frame.src=`demo/b2b-inquiry/?view=${encodeURIComponent(view)}&guide=1`;
  if(title)title.textContent=copy[view].title;
  if(description)description.textContent=copy[view].description;
  if(meta)meta.textContent=copy[view].meta;
}

tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));
activate('dashboard');
