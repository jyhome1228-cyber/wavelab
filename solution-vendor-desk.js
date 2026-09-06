const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');
const copy={
  dashboard:{title:'Dashboard',description:'진행 중 발주, 이번 주 납기, 지연 건과 미정산 금액을 한 화면에서 확인합니다.',meta:'PO · DELIVERY · OUTSTANDING'},
  vendors:{title:'Vendors',description:'협력사 담당자, 주요 품목, 누적 발주 금액과 최근 거래일을 업체 단위로 확인합니다.',meta:'VENDOR DB · CONTACT · VALUE'},
  orders:{title:'Purchase Orders',description:'발주번호, 품목, 수량, 단가, 총액, 납기일과 진행 상태를 한 화면에서 관리합니다.',meta:'PO · ITEM · UNIT PRICE'},
  deliveries:{title:'Deliveries',description:'생산중, 배송중, 지연, 입고완료 상태를 구분하고 가까운 납기일과 지연 건을 우선 확인합니다.',meta:'DUE DATE · STATUS · RECEIVING'},
  settlements:{title:'Settlements',description:'발주 금액과 입고 여부를 기준으로 지급 예정과 정산 완료 상태를 확인합니다.',meta:'PAYABLE · PAYMENT · STATUS'}
};
function activate(view){if(!copy[view]||!frame)return;tabs.forEach(tab=>tab.classList.toggle('is-active',tab.dataset.solutionTab===view));frame.src=`demo/vendor-desk/?view=${encodeURIComponent(view)}&guide=1`;if(title)title.textContent=copy[view].title;if(description)description.textContent=copy[view].description;if(meta)meta.textContent=copy[view].meta}
tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));
activate('dashboard');