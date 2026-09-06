const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');
const copy={dashboard:{title:'Dashboard',description:'열려 있는 문의, 긴급 티켓, SLA 임박과 최근 해결 현황을 한 화면에서 확인합니다.',meta:'TICKET · SLA · PRIORITY'},tickets:{title:'Tickets',description:'고객 문의를 티켓 단위로 보고 담당자, 우선순위, 처리기한과 상태를 직접 변경합니다.',meta:'QUEUE · ASSIGNEE · STATUS'},customers:{title:'Customers',description:'고객과 회사별 문의 건수, 최근 지원 이력과 해결 현황을 한 곳에서 확인합니다.',meta:'CUSTOMER · COMPANY · HISTORY'},team:{title:'Team',description:'담당자별 오픈 티켓, 긴급 건과 해결 건수를 비교해 업무량을 확인합니다.',meta:'OWNER · WORKLOAD · SLA'},insights:{title:'Insights',description:'문의 카테고리, 상태별 티켓 수와 해결률을 요약해 반복되는 지원 이슈를 확인합니다.',meta:'CATEGORY · RESOLUTION · TREND'}};
function activate(view){if(!copy[view]||!frame)return;tabs.forEach(t=>t.classList.toggle('is-active',t.dataset.solutionTab===view));frame.src=`demo/support-desk/?view=${encodeURIComponent(view)}&guide=1`;if(title)title.textContent=copy[view].title;if(description)description.textContent=copy[view].description;if(meta)meta.textContent=copy[view].meta}
tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));activate('dashboard');
