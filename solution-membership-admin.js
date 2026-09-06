const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');
const copy={dashboard:{title:'Dashboard',description:'활성 회원, 만료 임박, 미결제와 월간 매출을 한 화면에서 확인합니다.',meta:'MEMBERS · RENEWAL · BILLING'},members:{title:'Members',description:'회원 연락처, 플랜, 가입·만료일, 상태와 이용 현황을 회원 단위로 관리합니다.',meta:'MEMBER DB · STATUS · SEARCH'},plans:{title:'Plans',description:'가격, 기간과 혜택이 다른 멤버십 플랜을 구성하고 플랜별 회원 분포를 확인합니다.',meta:'PLAN · BENEFIT · PRICE'},billing:{title:'Billing',description:'회원별 결제 상태와 결제 예정일을 확인하고 미결제를 직접 처리할 수 있습니다.',meta:'PAYMENT · PENDING · REVENUE'},activity:{title:'Activity',description:'회원 등록, 플랜 변경, 갱신, 결제 상태 변경 등 운영 이력을 시간순으로 확인합니다.',meta:'HISTORY · CHANGE · RETENTION'}};
function activate(view){if(!copy[view]||!frame)return;tabs.forEach(t=>t.classList.toggle('is-active',t.dataset.solutionTab===view));frame.src=`demo/membership-admin/?view=${encodeURIComponent(view)}&guide=1`;if(title)title.textContent=copy[view].title;if(description)description.textContent=copy[view].description;if(meta)meta.textContent=copy[view].meta}
tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));activate('dashboard');
