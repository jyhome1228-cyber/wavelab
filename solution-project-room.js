document.body.classList.add('project-room-light');

if(!document.getElementById('project-room-light-css')){
  const light=document.createElement('link');
  light.id='project-room-light-css';
  light.rel='stylesheet';
  light.href='solution-project-room-light.css?v=20260911-1';
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
  heroVisual.src='assets/dev/work-project-room-light.svg?v=20260911-1';
}

const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');

const copy={
  dashboard:{title:'Dashboard',description:'프로젝트 진행률, 마감 임박 업무, 승인 대기 산출물과 팀 업무량을 한 화면에서 확인합니다.',meta:'PROGRESS · TASK · APPROVAL'},
  tasks:{title:'Tasks',description:'업무별 담당자, 마감일, 우선순위와 진행 상태를 관리하고 직접 변경합니다.',meta:'TASK · OWNER · DEADLINE'},
  timeline:{title:'Timeline',description:'Kickoff부터 검토와 최종 납품까지 주요 마일스톤과 일정 흐름을 확인합니다.',meta:'MILESTONE · SCHEDULE · DUE'},
  deliverables:{title:'Deliverables',description:'산출물의 버전, 검토 상태와 승인 여부를 관리해 최신 파일 상태를 명확히 구분합니다.',meta:'FILE · VERSION · APPROVAL'},
  feedback:{title:'Feedback',description:'업무와 산출물에 연결된 피드백과 수정 요청을 기록해 협업 이력을 남깁니다.',meta:'COMMENT · REVISION · HISTORY'}
};

function activate(view){
  if(!copy[view]||!frame)return;
  tabs.forEach(tab=>tab.classList.toggle('is-active',tab.dataset.solutionTab===view));
  frame.src=`demo/project-room/?view=${encodeURIComponent(view)}&guide=1`;
  if(title)title.textContent=copy[view].title;
  if(description)description.textContent=copy[view].description;
  if(meta)meta.textContent=copy[view].meta;
}

tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));
activate('dashboard');
