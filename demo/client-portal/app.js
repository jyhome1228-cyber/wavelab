const STORAGE_KEY='aesost-client-portal-demo-v1';
const seed={
  phases:[
    {id:'s1',name:'Kickoff & Strategy',date:'2026-08-18',status:'done',detail:'요구사항 정리와 프로젝트 방향 확정'},
    {id:'s2',name:'UX / Information Architecture',date:'2026-08-29',status:'done',detail:'사이트 구조와 핵심 사용자 흐름 설계'},
    {id:'s3',name:'Visual Design',date:'2026-09-12',status:'current',detail:'메인 페이지와 주요 화면 디자인 리뷰'},
    {id:'s4',name:'Development',date:'2026-09-22',status:'upcoming',detail:'반응형 개발과 CMS 연동'},
    {id:'s5',name:'QA & Launch',date:'2026-09-28',status:'upcoming',detail:'검수, 데이터 이관과 최종 배포'}
  ],
  deliverables:[
    {id:'d1',name:'Homepage Design v3',type:'FIGMA · Sep 06',status:'Pending'},
    {id:'d2',name:'Brand Asset Package',type:'ZIP · Sep 03',status:'Approved'},
    {id:'d3',name:'Information Architecture',type:'PDF · Aug 29',status:'Approved'},
    {id:'d4',name:'Mobile UI Draft',type:'FIGMA · Sep 05',status:'Revision'},
    {id:'d5',name:'Content Structure',type:'DOC · Sep 02',status:'Pending'}
  ],
  feedback:[
    {id:'f1',author:'오브젝트랩',date:'2026-09-05',message:'메인 Hero 문구는 현재 방향이 좋습니다. 포트폴리오 영역의 카드 크기만 조금 더 작게 보고 싶습니다.'},
    {id:'f2',author:'AESOST Project Team',date:'2026-09-04',message:'모바일 UI Draft를 업데이트했습니다. Deliverables에서 확인 후 승인 또는 수정 요청을 남겨주세요.'}
  ],
  documents:[
    {id:'doc1',kind:'CONTRACT',name:'웹사이트 구축 계약서',meta:'PDF · Signed Aug 12'},
    {id:'doc2',kind:'PROPOSAL',name:'Project Proposal v2',meta:'PDF · Aug 11'},
    {id:'doc3',kind:'SCHEDULE',name:'Master Schedule',meta:'XLSX · Updated Sep 06'}
  ]
};
let state=load();
function clone(v){return JSON.parse(JSON.stringify(v))}
function load(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||clone(seed)}catch{return clone(seed)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function esc(v=''){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function fmt(v){const d=new Date(v+'T00:00:00');return new Intl.DateTimeFormat('en',{month:'short',day:'2-digit'}).format(d)}
function toast(msg){const el=document.querySelector('[data-toast]');el.textContent=msg;el.classList.add('is-visible');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('is-visible'),1700)}
function setView(view){document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('is-active',b.dataset.view===view));document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('is-active',p.dataset.panel===view));const titles={overview:'Corporate Website Renewal',schedule:'Project Schedule',deliverables:'Files & Approval',feedback:'Project Feedback',documents:'Contract & Documents'};const t=document.querySelector('[data-title]');if(t)t.textContent=titles[view]||'Client Portal';history.replaceState(null,'',`?view=${encodeURIComponent(view)}${new URLSearchParams(location.search).get('guide')==='1'?'&guide=1':''}`)}
function render(){renderCounts();renderTimeline();renderSchedule();renderDeliverables();renderLatest();renderFeedback();renderDocuments()}
function renderCounts(){const pending=state.deliverables.filter(x=>x.status==='Pending'||x.status==='Revision').length;document.querySelectorAll('[data-pending-count]').forEach(el=>el.textContent=pending);document.querySelector('[data-total-deliverables]').textContent=state.deliverables.length}
function renderTimeline(){const el=document.querySelector('[data-timeline]');el.innerHTML=state.phases.map(p=>`<div class="timeline-item is-${p.status}"><span class="timeline-dot"></span><div><b>${esc(p.name)}</b><span>${esc(p.detail)}</span></div><small>${fmt(p.date)}</small></div>`).join('')}
function renderSchedule(){const el=document.querySelector('[data-schedule]');el.innerHTML=state.phases.map(p=>`<article><time>${fmt(p.date)}</time><div><b>${esc(p.name)}</b><p>${esc(p.detail)}</p></div><span class="phase-badge ${p.status==='done'?'done':p.status==='current'?'current':''}">${p.status==='done'?'COMPLETED':p.status==='current'?'IN PROGRESS':'UPCOMING'}</span></article>`).join('')}
function statusLabel(s){return s==='Approved'?'승인 완료':s==='Revision'?'수정 요청':'승인 대기'}
function renderLatest(){const el=document.querySelector('[data-latest]');el.innerHTML=state.deliverables.slice(0,3).map(d=>`<div class="latest-card"><b>${esc(d.name)}</b><span class="deliverable-status ${d.status}">${statusLabel(d.status)}</span></div>`).join('')}
function renderDeliverables(){const el=document.querySelector('[data-deliverables]');el.innerHTML=state.deliverables.map(d=>`<article class="deliverable-row"><div><h3>${esc(d.name)}</h3><p>${esc(d.type)}</p></div><span class="deliverable-status ${d.status}">${statusLabel(d.status)}</span><div class="deliverable-actions"><button class="portal-secondary" data-revise="${d.id}" type="button">수정 요청</button><button class="portal-primary" data-approve="${d.id}" type="button">승인하기</button></div></article>`).join('');el.querySelectorAll('[data-approve]').forEach(b=>b.addEventListener('click',()=>changeDeliverable(b.dataset.approve,'Approved')));el.querySelectorAll('[data-revise]').forEach(b=>b.addEventListener('click',()=>changeDeliverable(b.dataset.revise,'Revision')))}
function changeDeliverable(id,status){const item=state.deliverables.find(x=>x.id===id);if(!item)return;item.status=status;save();renderCounts();renderDeliverables();renderLatest();toast(status==='Approved'?'산출물을 승인했습니다.':'수정 요청 상태로 변경했습니다.')}
function renderFeedback(){const el=document.querySelector('[data-feedback-list]');el.innerHTML=state.feedback.slice().reverse().map(f=>`<article><header><b>${esc(f.author)}</b><time>${esc(f.date)}</time></header><p>${esc(f.message)}</p></article>`).join('')}
function renderDocuments(){const el=document.querySelector('[data-documents]');el.innerHTML=state.documents.map(d=>`<article><span>${esc(d.kind)}</span><b>${esc(d.name)}</b><small>${esc(d.meta)}</small><button type="button" data-doc="${d.id}">문서 확인 ↗</button></article>`).join('');el.querySelectorAll('[data-doc]').forEach(b=>b.addEventListener('click',()=>toast('데모 문서 미리보기입니다.')))}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.go)));
document.querySelector('[data-feedback-form]').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const message=fd.get('message').trim();if(!message)return;state.feedback.push({id:'f'+Date.now(),author:'오브젝트랩',date:new Date().toISOString().slice(0,10),message});save();e.currentTarget.reset();renderFeedback();toast('피드백을 등록했습니다.')});
document.querySelector('[data-reset]').addEventListener('click',()=>{if(!confirm('Client Portal 데모 데이터를 초기화할까요?'))return;state=clone(seed);save();render();toast('데모 데이터를 초기화했습니다.')});
const initial=new URLSearchParams(location.search).get('view')||'overview';setView(['overview','schedule','deliverables','feedback','documents'].includes(initial)?initial:'overview');render();