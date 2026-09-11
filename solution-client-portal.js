document.body.classList.add('client-portal-light');

if(!document.getElementById('client-portal-light-css')){
  const light=document.createElement('link');
  light.id='client-portal-light-css';
  light.rel='stylesheet';
  light.href='solution-client-portal-light.css?v=20260911-1';
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
  heroVisual.src='assets/dev/work-client-portal-light.svg?v=20260911-1';
}

const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');

const copy={
  overview:{
    title:'Overview',
    description:'프로젝트 진행률, 다음 마일스톤, 최신 산출물과 승인 대기 항목을 한 화면에서 확인합니다.',
    meta:'PROGRESS · MILESTONE · APPROVAL'
  },
  schedule:{
    title:'Schedule',
    description:'Kickoff부터 Launch까지 단계별 일정과 현재 진행 위치를 확인해 고객과 제작팀이 같은 일정을 공유합니다.',
    meta:'TIMELINE · MILESTONE · LAUNCH'
  },
  deliverables:{
    title:'Deliverables',
    description:'공유된 산출물을 확인하고 승인 또는 수정 요청 상태를 직접 변경할 수 있습니다.',
    meta:'FILES · APPROVAL · REVISION'
  },
  feedback:{
    title:'Feedback',
    description:'메일이나 메신저에 흩어지기 쉬운 피드백을 프로젝트 안에 기록해 요청사항과 응답 흐름을 남깁니다.',
    meta:'COMMENT · HISTORY · RESPONSE'
  },
  documents:{
    title:'Documents',
    description:'계약서, 제안서, 일정표 등 프로젝트 관련 문서를 고객 전용 공간에서 한 번에 확인합니다.',
    meta:'CONTRACT · PROPOSAL · FILES'
  }
};

function activate(view){
  if(!copy[view]||!frame)return;
  tabs.forEach(tab=>tab.classList.toggle('is-active',tab.dataset.solutionTab===view));
  frame.src=`demo/client-portal/?view=${encodeURIComponent(view)}&guide=1`;
  if(title)title.textContent=copy[view].title;
  if(description)description.textContent=copy[view].description;
  if(meta)meta.textContent=copy[view].meta;
}

tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));
activate('overview');
