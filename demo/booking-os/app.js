const STORAGE_KEY='aesost-booking-os-demo-v1';
const DEMO_DATE='2026-09-06';
const seed={
  clients:[
    {id:'c1',name:'김서윤',phone:'010-4821-2301',last:'2026-09-02',visits:8,pass:'pa1'},
    {id:'c2',name:'박민지',phone:'010-6712-8820',last:'2026-09-05',visits:12,pass:'pa2'},
    {id:'c3',name:'이하늘',phone:'010-9254-1160',last:'2026-08-30',visits:5,pass:'pa3'},
    {id:'c4',name:'최유진',phone:'010-7310-4428',last:'2026-09-01',visits:10,pass:'pa4'},
    {id:'c5',name:'정다은',phone:'010-3188-9201',last:'2026-08-28',visits:3,pass:'pa5'}
  ],
  passes:[
    {id:'pa1',client:'c1',name:'Body Balance 10',total:10,remaining:6,expires:'2026-12-20'},
    {id:'pa2',client:'c2',name:'Facial Care 20',total:20,remaining:11,expires:'2027-01-10'},
    {id:'pa3',client:'c3',name:'Posture Care 10',total:10,remaining:7,expires:'2026-11-30'},
    {id:'pa4',client:'c4',name:'Premium Care 10',total:10,remaining:3,expires:'2026-10-25'},
    {id:'pa5',client:'c5',name:'Body Balance 5',total:5,remaining:4,expires:'2026-12-05'}
  ],
  staff:[
    {id:'s1',name:'Jina',role:'Senior Therapist'},
    {id:'s2',name:'Mina',role:'Care Specialist'},
    {id:'s3',name:'Sora',role:'Body Specialist'}
  ],
  bookings:[
    {id:'b1',client:'c1',program:'Body Balance',date:DEMO_DATE,time:'10:00',staff:'s1',status:'Booked',consumed:false},
    {id:'b2',client:'c2',program:'Facial Care',date:DEMO_DATE,time:'11:30',staff:'s2',status:'Completed',consumed:true},
    {id:'b3',client:'c3',program:'Posture Care',date:DEMO_DATE,time:'13:00',staff:'s3',status:'Booked',consumed:false},
    {id:'b4',client:'c4',program:'Premium Care',date:DEMO_DATE,time:'15:00',staff:'s1',status:'Booked',consumed:false},
    {id:'b5',client:'c5',program:'Body Balance',date:DEMO_DATE,time:'16:30',staff:'s2',status:'No-show',consumed:false},
    {id:'b6',client:'c2',program:'Facial Care',date:'2026-09-07',time:'12:00',staff:'s2',status:'Booked',consumed:false}
  ]
};
let state=loadState();
let filter='all';
let query='';
function cloneSeed(){return JSON.parse(JSON.stringify(seed))}
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||cloneSeed()}catch{return cloneSeed()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function client(id){return state.clients.find(x=>x.id===id)}
function staff(id){return state.staff.find(x=>x.id===id)}
function passById(id){return state.passes.find(x=>x.id===id)}
function fmtDate(v){return new Intl.DateTimeFormat('ko-KR',{month:'short',day:'numeric'}).format(new Date(v+'T00:00:00'))}
function uid(){return 'b'+Date.now().toString(36)}
function esc(v=''){return String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]))}
function toast(msg){const el=document.querySelector('[data-toast]');el.textContent=msg;el.classList.add('is-visible');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('is-visible'),1700)}
function setView(view){document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('is-active',b.dataset.view===view));document.querySelectorAll('[data-view-panel]').forEach(p=>p.classList.toggle('is-active',p.dataset.viewPanel===view));const titles={dashboard:'오늘 예약 현황',bookings:'예약 관리',clients:'고객 데이터베이스',passes:'이용권 관리',staff:'담당자 일정'};document.querySelector('[data-view-title]').textContent=titles[view]||'Booking OS'}
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.go)));
function renderAll(){renderCounts();renderMetrics();renderToday();renderPassBars();renderStaffMini();renderBookings();renderClients();renderPasses();renderStaff();renderSelects()}
function renderCounts(){document.querySelector('[data-count-bookings]').textContent=state.bookings.length;document.querySelector('[data-count-clients]').textContent=state.clients.length}
function renderMetrics(){const today=state.bookings.filter(b=>b.date===DEMO_DATE);document.querySelector('[data-metric="today"]').textContent=today.length;document.querySelector('[data-metric="completed"]').textContent=today.filter(b=>b.status==='Completed').length;document.querySelector('[data-metric="noshow"]').textContent=today.filter(b=>b.status==='No-show').length;document.querySelector('[data-metric="clients"]').textContent=state.clients.length}
function renderToday(){const target=document.querySelector('[data-today-list]');const rows=state.bookings.filter(b=>b.date===DEMO_DATE).sort((a,b)=>a.time.localeCompare(b.time));target.innerHTML=rows.map(b=>`<div class="schedule-row"><time>${b.time}</time><div><strong>${esc(client(b.client)?.name||'-')}</strong><small>${esc(b.program)} · ${esc(staff(b.staff)?.name||'-')}</small></div><span>${esc(passById(client(b.client)?.pass)?.name||'Single')}</span><button class="status-button" data-cycle="${b.id}"><span class="status ${b.status}">${b.status}</span></button></div>`).join('');target.querySelectorAll('[data-cycle]').forEach(btn=>btn.addEventListener('click',()=>cycleStatus(btn.dataset.cycle)))}
function renderPassBars(){const target=document.querySelector('[data-pass-bars]');target.innerHTML=state.passes.slice(0,3).map(p=>{const c=client(p.client);const used=p.total-p.remaining;const pct=Math.round(used/p.total*100);return `<div class="pass-mini"><span>${esc(c?.name||'-')} · ${esc(p.name)}</span><b>${p.remaining}회 남음</b><div class="progress"><i style="width:${pct}%"></i></div></div>`}).join('')}
function renderStaffMini(){const target=document.querySelector('[data-staff-mini]');target.innerHTML=state.staff.map(s=>{const count=state.bookings.filter(b=>b.date===DEMO_DATE&&b.staff===s.id).length;return `<div class="staff-line"><strong>${esc(s.name)}</strong><span>${count} bookings</span></div>`}).join('')}
function filteredBookings(){const q=query.toLowerCase();return state.bookings.filter(b=>(filter==='all'||b.status===filter)&&(!q||[client(b.client)?.name,b.program,staff(b.staff)?.name].some(v=>(v||'').toLowerCase().includes(q))))}
function renderBookings(){const target=document.querySelector('[data-bookings-table]');target.innerHTML=filteredBookings().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(b=>{const c=client(b.client),p=passById(c?.pass);return `<tr><td>${fmtDate(b.date)} ${b.time}</td><td><div class="client-name"><strong>${esc(c?.name||'-')}</strong><span>${esc(c?.phone||'')}</span></div></td><td>${esc(b.program)}</td><td>${esc(staff(b.staff)?.name||'-')}</td><td>${p?`${p.remaining}/${p.total}`:'-'}</td><td><button class="status-button" data-cycle="${b.id}"><span class="status ${b.status}">${b.status}</span></button></td></tr>`}).join('')||'<tr><td colspan="6">검색 결과가 없습니다.</td></tr>';target.querySelectorAll('[data-cycle]').forEach(btn=>btn.addEventListener('click',()=>cycleStatus(btn.dataset.cycle)))}
function renderClients(){const q=query.toLowerCase();const rows=state.clients.filter(c=>!q||[c.name,c.phone].some(v=>v.toLowerCase().includes(q)));document.querySelector('[data-clients-table]').innerHTML=rows.map(c=>{const p=passById(c.pass);return `<tr><td><div class="client-name"><strong>${esc(c.name)}</strong><span>${esc(p?.name||'No pass')}</span></div></td><td>${esc(c.phone)}</td><td>${fmtDate(c.last)}</td><td>${c.visits}</td><td>${p?`${p.remaining} / ${p.total}`:'-'}</td></tr>`}).join('')}
function renderPasses(){document.querySelector('[data-pass-grid]').innerHTML=state.passes.map(p=>{const c=client(p.client);const used=p.total-p.remaining;return `<article class="pass-card"><h3>${esc(c?.name||'-')}</h3><p>${esc(p.name)}</p><strong>${p.remaining} / ${p.total}</strong><small>잔여 횟수 · 만료 ${fmtDate(p.expires)}</small><div class="progress"><i style="width:${Math.round(used/p.total*100)}%"></i></div></article>`}).join('')}
function renderStaff(){document.querySelector('[data-staff-grid]').innerHTML=state.staff.map(s=>{const today=state.bookings.filter(b=>b.date===DEMO_DATE&&b.staff===s.id);const completed=today.filter(b=>b.status==='Completed').length;return `<article class="staff-card"><h3>${esc(s.name)}</h3><p>${esc(s.role)}</p><div class="staff-stat"><div><span>TODAY</span><b>${today.length}</b></div><div><span>DONE</span><b>${completed}</b></div></div><small>${today.map(b=>b.time).join(' · ')||'예약 없음'}</small></article>`}).join('')}
function renderSelects(){document.querySelector('[data-client-select]').innerHTML='<option value="">고객 선택</option>'+state.clients.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');document.querySelector('[data-staff-select]').innerHTML='<option value="">담당자 선택</option>'+state.staff.map(s=>`<option value="${s.id}">${esc(s.name)} · ${esc(s.role)}</option>`).join('')}
function cycleStatus(id){const b=state.bookings.find(x=>x.id===id);if(!b)return;const order=['Booked','Completed','No-show','Cancelled'];const next=order[(order.indexOf(b.status)+1)%order.length];if(next==='Completed'&&!b.consumed){const p=passById(client(b.client)?.pass);if(p&&p.remaining>0)p.remaining-=1;b.consumed=true;const c=client(b.client);if(c){c.visits+=1;c.last=b.date}}b.status=next;saveState();renderAll();toast(`예약 상태: ${next}`)}
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('is-active',x===btn));renderBookings()}));document.querySelector('[data-search]').addEventListener('input',e=>{query=e.target.value.trim();renderBookings();renderClients()});
const modal=document.querySelector('[data-modal]');document.querySelector('[data-open-booking]').addEventListener('click',()=>{modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.querySelector('[name="date"]').value=DEMO_DATE;document.querySelector('[name="time"]').value='14:00'});function closeModal(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true')}document.querySelector('[data-close]').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
document.querySelector('[data-booking-form]').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);state.bookings.push({id:uid(),client:fd.get('client'),program:fd.get('program'),date:fd.get('date'),time:fd.get('time'),staff:fd.get('staff'),status:'Booked',consumed:false});saveState();e.currentTarget.reset();closeModal();renderAll();setView('bookings');toast('새 예약을 등록했습니다.')});document.querySelector('[data-reset]').addEventListener('click',()=>{if(!confirm('Booking OS 데모 데이터를 초기화할까요?'))return;state=cloneSeed();saveState();renderAll();toast('데모 데이터를 초기화했습니다.')});
const params=new URLSearchParams(location.search);const initial=params.get('view');if(initial)setView(initial);renderAll();