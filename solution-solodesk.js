const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');

const copy={
  dashboard:{
    title:'Dashboard',
    description:'이번 달 매출, 미수금, 진행 중 프로젝트와 다가오는 일정을 한 화면에서 확인합니다. 혼자 일할수록 자주 확인해야 하는 정보를 첫 화면에 모았습니다.',
    meta:'OVERVIEW · REVENUE · UPCOMING'
  },
  clients:{
    title:'Clients',
    description:'고객 연락처, 진행 프로젝트 수와 누적 프로젝트 금액을 한 곳에서 관리합니다. 새 고객을 추가하고 검색으로 빠르게 찾을 수 있습니다.',
    meta:'CLIENT DB · SEARCH · VALUE'
  },
  projects:{
    title:'Projects',
    description:'프로젝트를 상태별로 필터링하고 진행 단계를 바꿀 수 있습니다. 새 프로젝트를 추가하면 정산 데이터와 연결되는 흐름도 함께 확인할 수 있습니다.',
    meta:'PIPELINE · STATUS · FILTER'
  },
  finance:{
    title:'Finance',
    description:'청구서와 입금 상태를 정리해 현재 들어온 금액과 아직 받을 금액을 구분합니다. 프로젝트 금액과 정산 현황을 동시에 볼 수 있습니다.',
    meta:'INVOICE · PAYMENT · OUTSTANDING'
  }
};

function activate(view){
  if(!copy[view]||!frame)return;
  tabs.forEach(tab=>tab.classList.toggle('is-active',tab.dataset.solutionTab===view));
  frame.src=`demo/solodesk/?view=${encodeURIComponent(view)}&guide=1`;
  if(title)title.textContent=copy[view].title;
  if(description)description.textContent=copy[view].description;
  if(meta)meta.textContent=copy[view].meta;
}

tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));
activate('dashboard');
