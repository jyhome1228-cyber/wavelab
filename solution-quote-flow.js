const tabs=[...document.querySelectorAll('[data-solution-tab]')];
const frame=document.querySelector('[data-solution-frame]');
const title=document.querySelector('[data-solution-title]');
const description=document.querySelector('[data-solution-description]');
const meta=document.querySelector('[data-solution-meta]');
const copy={
  dashboard:{title:'Dashboard',description:'작성 중 견적, 발송 견적, 승인 대기와 확정 금액을 한 화면에서 확인합니다.',meta:'QUOTE · VALUE · APPROVAL'},
  quotes:{title:'Quotes',description:'고객별 견적 제목, 버전, 총액, 유효기간과 현재 상태를 검색하고 관리합니다.',meta:'CLIENT · QUOTE · STATUS'},
  builder:{title:'Builder',description:'서비스 항목, 수량과 단가를 추가하면 공급가액, VAT와 총액을 자동으로 계산합니다.',meta:'ITEM · QTY · VAT'},
  versions:{title:'Versions',description:'협의 과정에서 변경된 견적을 새 버전으로 복제하고 이전 금액과 수정 이력을 함께 보관합니다.',meta:'VERSION · HISTORY · REVISION'},
  approval:{title:'Approval',description:'Draft, Sent, Viewed, Approved, Declined 상태를 구분해 발송 이후 고객 반응까지 관리합니다.',meta:'SEND · VIEW · APPROVE'}
};
function activate(view){if(!copy[view]||!frame)return;tabs.forEach(t=>t.classList.toggle('is-active',t.dataset.solutionTab===view));frame.src=`demo/quote-flow/?view=${encodeURIComponent(view)}&guide=1`;if(title)title.textContent=copy[view].title;if(description)description.textContent=copy[view].description;if(meta)meta.textContent=copy[view].meta}
tabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab.dataset.solutionTab)));activate('dashboard');
