const STORAGE_KEY='aesost-solodesk-demo-v2';
const seed={
  clients:[
    {id:'c1',name:'오브젝트랩',email:'hello@objectlab.co.kr',phone:'010-4821-2301',status:'Active'},
    {id:'c2',name:'모리리빙',email:'brand@moriliving.co.kr',phone:'010-6712-8820',status:'Active'},
    {id:'c3',name:'아크헬스',email:'team@archealth.co.kr',phone:'010-9254-1160',status:'Active'},
    {id:'c4',name:'스튜디오 모어',email:'hello@studiomore.kr',phone:'010-7310-4428',status:'Lead'}
  ],
  projects:[
    {id:'p1',name:'Corporate Website Renewal',client:'c1',amount:4800000,status:'In Progress',due:'2026-09-18',paid:true},
    {id:'p2',name:'Brand Identity System',client:'c2',amount:3200000,status:'Review',due:'2026-09-12',paid:false},
    {id:'p3',name:'CRM Dashboard',client:'c3',amount:6500000,status:'In Progress',due:'2026-10-02',paid:false},
    {id:'p4',name:'Campaign Landing Page',client:'c4',amount:1800000,status:'Complete',due:'2026-09-05',paid:true}
  ],
  invoices:[
    {id:'INV-2609-01',project:'p1',amount:2400000,due:'2026-09-10',status:'Paid'},
    {id:'INV-2609-02',project:'p2',amount:1600000,due:'2026-09-15',status:'Pending'},
    {id:'INV-2609-03',project:'p3',amount:3250000,due:'2026-09-22',status:'Pending'},
    {id:'INV-2609-04',project:'p4',amount:1800000,due:'2026-09-03',status:'Paid'}
  ]
};
let state=loadState();
let currentFilter='all';
let searchQuery='';

function cloneSeed(){return JSON.parse(JSON.stringify(seed))}
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||cloneSeed()}catch{return cloneSeed()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function won(v){return '₩'+Math.round(v).toLocaleString('ko-KR')}
function clientById(id){return state.clients.find(c=>c.id===id)}
function projectById(id){return state.projects.find(p=>p.id===id)}
function statusClass(s){return s.replaceAll(' ','-')}
function formatDate(v){const d=new Date(v+'T00:00:00');return new Intl.DateTimeFormat('en',{month:'short',day:'2-digit'}).format(d)}
function uid(prefix){return prefix+Date.now().toString(36)}
function esc(value=''){return String(value).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}

function toast(message){const el=document.querySelector('[data-toast]');el.textContent=message;el.classList.add('is-visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('is-visible'),1800)}

function setView(name){
  document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('is-active',b.dataset.view===name));
  document.querySelectorAll('[data-view-panel]').forEach(p=>p.classList.toggle('is-active',p.dataset.viewPanel===name));
  const titles={dashboard:'오늘의 업무 현황',clients:'고객 데이터베이스',projects:'프로젝트 워크스페이스',finance:'정산 현황'};
  document.querySelector('[data-view-title]').textContent=titles[name]||'SoloDesk';
}

document.querySelectorAll('.nav-item').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));
document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.go)));

function renderAll(){renderCounts();renderMetrics();renderDashboardProjects();renderChart();renderUpcoming();renderClients();renderProjects();renderFinance();renderClientSelect()}
function renderCounts(){document.querySelectorAll('[data-count="clients"]').forEach(e=>e.textContent=state.clients.length);document.querySelectorAll('[data-count="projects"]').forEach(e=>e.textContent=state.projects.length)}
function renderMetrics(){
  const paid=state.invoices.filter(i=>i.status==='Paid').reduce((s,i)=>s+i.amount,0);
  const outstanding=state.invoices.filter(i=>i.status==='Pending').reduce((s,i)=>s+i.amount,0);
  const active=state.projects.filter(p=>p.status!=='Complete').length;
  document.querySelector('[data-metric="revenue"]').textContent=won(paid);
  document.querySelector('[data-metric="outstanding"]').textContent=won(outstanding);
  document.querySelector('[data-metric="active"]').textContent=active;
  document.querySelector('[data-metric="clients"]').textContent=state.clients.length;
  document.querySelector('[data-cash-total]').textContent=won(paid+outstanding);
}
function renderDashboardProjects(){
  const target=document.querySelector('[data-dashboard-projects]');
  const rows=state.projects.slice().sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,5);
  target.innerHTML=rows.map(p=>`<div class="project-line"><div class="project-main"><b>${esc(p.name)}</b><span>${esc(clientById(p.client)?.name||'Unknown client')}</span></div><span>${won(p.amount)}</span><span>${formatDate(p.due)}</span><span class="status ${statusClass(p.status)}">${p.status}</span></div>`).join('')||'<p>등록된 프로젝트가 없습니다.</p>';
}
function renderChart(){
  const target=document.querySelector('[data-chart]');
  const points=[{a:34,b:14},{a:62,b:18},{a:48,b:38},{a:75,b:20},{a:58,b:28},{a:86,b:16},{a:68,b:34}];
  target.innerHTML=points.map(x=>`<div class="bar-col"><i class="bar income" style="height:${x.a}%"></i><i class="bar pending" style="height:${x.b}%"></i></div>`).join('');
}
function renderUpcoming(){
  const target=document.querySelector('[data-upcoming]');
  const rows=state.projects.filter(p=>p.status!=='Complete').slice().sort((a,b)=>new Date(a.due)-new Date(b.due)).slice(0,3);
  target.innerHTML=rows.map(p=>{const d=new Date(p.due+'T00:00:00');return `<div class="upcoming"><div class="date-box"><b>${String(d.getDate()).padStart(2,'0')}</b><span>${d.toLocaleString('en',{month:'short'}).toUpperCase()}</span></div><div><strong>${esc(p.name)}</strong><small>${esc(clientById(p.client)?.name||'Unknown client')} · ${p.status}</small></div></div>`}).join('')||'<p>예정된 업무가 없습니다.</p>';
}
function renderClients(){
  const tbody=document.querySelector('[data-clients-table]');
  const q=searchQuery.toLowerCase();
  const rows=state.clients.filter(c=>!q||[c.name,c.email,c.phone].some(v=>v.toLowerCase().includes(q)));
  tbody.innerHTML=rows.map(c=>{const projects=state.projects.filter(p=>p.client===c.id);const value=projects.reduce((s,p)=>s+p.amount,0);return `<tr><td><div class="client-cell"><strong>${esc(c.name)}</strong><span>${esc(c.email)}</span></div></td><td>${esc(c.phone)}</td><td>${projects.length}</td><td>${won(value)}</td><td><span class="status ${c.status==='Active'?'Complete':'Review'}">${c.status}</span></td></tr>`}).join('')||'<tr><td colspan="5">검색 결과가 없습니다.</td></tr>';
}
function renderProjects(){
  const target=document.querySelector('[data-project-board]');
  const q=searchQuery.toLowerCase();
  const rows=state.projects.filter(p=>(currentFilter==='all'||p.status===currentFilter)&&(!q||p.name.toLowerCase().includes(q)||(clientById(p.client)?.name||'').toLowerCase().includes(q)));
  target.innerHTML=rows.map(p=>`<article class="project-card"><div class="project-top"><span class="status ${statusClass(p.status)}">${p.status}</span><button class="status-button" data-cycle="${p.id}" title="상태 변경">•••</button></div><h3>${esc(p.name)}</h3><p>${esc(clientById(p.client)?.name||'Unknown client')}</p><div class="project-meta"><div><span>VALUE</span><b>${won(p.amount)}</b></div><div><span>DUE</span><b>${formatDate(p.due)}</b></div></div></article>`).join('')||'<p>조건에 맞는 프로젝트가 없습니다.</p>';
  target.querySelectorAll('[data-cycle]').forEach(btn=>btn.addEventListener('click',()=>cycleStatus(btn.dataset.cycle)));
}
function renderFinance(){
  const paid=state.invoices.filter(i=>i.status==='Paid').reduce((s,i)=>s+i.amount,0);
  const pending=state.invoices.filter(i=>i.status==='Pending').reduce((s,i)=>s+i.amount,0);
  const total=state.projects.reduce((s,p)=>s+p.amount,0);
  document.querySelector('[data-finance-paid]').textContent=won(paid);
  document.querySelector('[data-finance-pending]').textContent=won(pending);
  document.querySelector('[data-finance-total]').textContent=won(total);
  document.querySelector('[data-finance-table]').innerHTML=state.invoices.map(i=>{const p=projectById(i.project);return `<tr><td>${i.id}</td><td>${esc(clientById(p?.client)?.name||'-')}</td><td>${esc(p?.name||'-')}</td><td>${won(i.amount)}</td><td>${formatDate(i.due)}</td><td><span class="status ${i.status}">${i.status}</span></td></tr>`}).join('');
}
function renderClientSelect(){
  const select=document.querySelector('[data-client-select]');
  select.innerHTML='<option value="">고객 선택</option>'+state.clients.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
}
function cycleStatus(id){
  const p=projectById(id);if(!p)return;const order=['In Progress','Review','Complete'];p.status=order[(order.indexOf(p.status)+1)%order.length];saveState();renderAll();toast(`프로젝트 상태: ${p.status}`);
}

document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('is-active',b===btn));renderProjects()}));
document.querySelector('[data-search]').addEventListener('input',e=>{searchQuery=e.target.value.trim();renderClients();renderProjects()});

function openModal(name){const m=document.querySelector(`[data-modal="${name}"]`);m.classList.add('is-open');m.setAttribute('aria-hidden','false');m.querySelector('input,select')?.focus()}
function closeModals(){document.querySelectorAll('.modal').forEach(m=>{m.classList.remove('is-open');m.setAttribute('aria-hidden','true')})}
document.querySelector('[data-open-project]').addEventListener('click',()=>openModal('project'));
document.querySelector('[data-open-client]').addEventListener('click',()=>openModal('client'));
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeModals));
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModals()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});

document.querySelector('[data-project-form]').addEventListener('submit',e=>{
  e.preventDefault();const fd=new FormData(e.currentTarget);const project={id:uid('p'),name:fd.get('name').trim(),client:fd.get('client'),amount:Number(fd.get('amount')),status:fd.get('status'),due:fd.get('due'),paid:false};state.projects.unshift(project);state.invoices.unshift({id:'INV-'+new Date().getFullYear().toString().slice(-2)+String(state.invoices.length+1).padStart(3,'0'),project:project.id,amount:Math.round(project.amount*.5),due:project.due,status:'Pending'});saveState();e.currentTarget.reset();closeModals();renderAll();setView('projects');toast('프로젝트를 추가했습니다.');
});
document.querySelector('[data-client-form]').addEventListener('submit',e=>{
  e.preventDefault();const fd=new FormData(e.currentTarget);state.clients.unshift({id:uid('c'),name:fd.get('name').trim(),email:fd.get('email').trim(),phone:fd.get('phone').trim(),status:'Active'});saveState();e.currentTarget.reset();closeModals();renderAll();toast('고객을 추가했습니다.');
});
document.querySelector('[data-reset]').addEventListener('click',()=>{if(!confirm('SoloDesk 데모 데이터를 초기화할까요?'))return;state=cloneSeed();saveState();renderAll();toast('데모 데이터를 초기화했습니다.')});

renderAll();