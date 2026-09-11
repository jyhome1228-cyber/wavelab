document.body.classList.add('booking-os-light');

if(!document.getElementById('booking-os-light-css')){
  const light=document.createElement('link');
  light.id='booking-os-light-css';
  light.rel='stylesheet';
  light.href='solution-booking-os-light.css?v=20260911-1';
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
  heroVisual.src='assets/dev/work-booking-os-light.svg?v=20260911-1';
}

const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');

const copy={
  dashboard:{
    title:'Dashboard',
    description:'오늘 예약 수, 방문 완료, 노쇼, 활성 고객과 담당자별 일정을 한 화면에서 확인합니다.',
    meta:'BOOKING · TODAY · STAFF'
  },
  bookings:{
    title:'Bookings',
    description:'예약 날짜와 시간, 고객, 프로그램, 담당자, 이용권과 방문 상태를 한 번에 관리합니다.',
    meta:'SCHEDULE · STATUS · PROGRAM'
  },
  clients:{
    title:'Clients',
    description:'고객의 연락처, 최근 방문일, 누적 방문 횟수와 이용권 잔여횟수를 확인합니다.',
    meta:'CLIENT · VISIT · HISTORY'
  },
  passes:{
    title:'Passes',
    description:'고객별 이용권 종류와 총 횟수, 잔여횟수, 만료일을 한 화면에서 관리합니다.',
    meta:'PASS · BALANCE · EXPIRE'
  },
  staff:{
    title:'Staff',
    description:'담당자별 오늘 예약 수와 완료 건수, 시간대별 일정을 빠르게 확인합니다.',
    meta:'STAFF · LOAD · SCHEDULE'
  }
};

function activate(view){
  if(!copy[view]||!frame)return;
  tabs.forEach(tab=>tab.classList.toggle('is-active',tab.dataset.solutionTab===view));
  frame.src=`demo/booking-os/?view=${encodeURIComponent(view)}&guide=1`;
  if(title)title.textContent=copy[view].title;
  if(description)description.textContent=copy[view].description;
  if(meta)meta.textContent=copy[view].meta;
}

tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));
activate('dashboard');
