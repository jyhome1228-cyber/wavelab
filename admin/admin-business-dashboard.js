import { auth, db } from '../firebase-config.js';
import { collection, doc, getDocs, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const ADMIN_EMAIL='planus253@naver.com';
const solutions=[
  ['01','SoloDesk','1인사업자 관리','solution-solodesk.html'],
  ['02','B2B Inquiry Hub','기업 B2B 문의','solution-b2b-inquiry.html'],
  ['03','Company CMS','기업 홈페이지 운영','solution-company-cms.html'],
  ['04','Client Portal','고객 프로젝트 공유','solution-client-portal.html'],
  ['05','Booking OS','예약 기반 사업 관리','solution-booking-os.html'],
  ['06','Vendor Desk','협력사·발주 관리','solution-vendor-desk.html'],
  ['07','Membership Admin','회원·멤버십 운영','solution-membership-admin.html'],
  ['08','Support Desk','고객 문의·지원','solution-support-desk.html'],
  ['09','Project Room','프로젝트 협업·진행','solution-project-room.html'],
  ['10','QuoteFlow','견적·제안서 자동화','solution-quote-flow.html']
];
const statuses=[
  ['new','신규'],['contacted','연락완료'],['proposal','제안중'],['won','계약'],['closed','종료']
];
let requests=[];
let filtered=[];
let loading=false;

function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function toDate(value){if(!value)return null;if(typeof value.toDate==='function')return value.toDate();if(value instanceof Date)return value;if(typeof value.seconds==='number')return new Date(value.seconds*1000);const date=new Date(value);return Number.isNaN(date.getTime())?null:date}
function dateText(value,withTime=false){const date=toDate(value);if(!date)return '—';return new Intl.DateTimeFormat('ko-KR',withTime?{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}:{year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
function statusLabel(value){return statuses.find(([key])=>key===value)?.[1]||value||'신규'}

function installNavigation(){
  const nav=document.querySelector('.sidebar-nav');
  if(!nav)return;
  nav.innerHTML=`
    <a class="is-active" href="#business-overview"><span>01</span>대시보드</a>
    <a href="#requests"><span>02</span>프로젝트 문의</a>
    <a href="#solutions-admin"><span>03</span>솔루션</a>
    <a href="#visitors"><span>04</span>방문자</a>
    <a href="#members"><span>05</span>회원</a>`;
  nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    nav.querySelectorAll('a').forEach(item=>item.classList.remove('is-active'));
    link.classList.add('is-active');
  }));
}

function installOverview(){
  if(document.querySelector('#business-overview'))return;
  const header=document.querySelector('.admin-header');
  if(!header)return;
  const headerLabel=header.querySelector('p');
  const headerTitle=header.querySelector('h1');
  if(headerLabel)headerLabel.textContent='AESOST BUSINESS CONSOLE';
  if(headerTitle)headerTitle.textContent='운영 대시보드';

  const section=document.createElement('section');
  section.className='admin-section';
  section.id='business-overview';
  section.innerHTML=`
    <div class="admin-section-title">
      <div><span>TODAY OVERVIEW</span><h2>현재 운영 상태</h2></div>
      <p>문의와 솔루션 상태를 먼저 보고, 방문자와 회원 데이터는 아래에서 이어서 확인합니다.</p>
    </div>
    <div class="business-metrics">
      <article class="business-metric"><i><svg viewBox="0 0 24 24"><path d="M4 5h16v12H8l-4 4z"/><path d="M8 9h8M8 13h5"/></svg></i><span>NEW REQUESTS</span><strong data-admin-new-requests>—</strong><p>확인하지 않은 신규 문의</p></article>
      <article class="business-metric"><i><svg viewBox="0 0 24 24"><path d="M4 19V5h16v14z"/><path d="M8 15V9M12 15v-3M16 15V7"/></svg></i><span>ACTIVE PIPELINE</span><strong data-admin-active-requests>—</strong><p>진행 중 문의·제안</p></article>
      <article class="business-metric"><i><svg viewBox="0 0 24 24"><path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 11 8 4 8-4M4 15l8 4 8-4"/></svg></i><span>LIVE SOLUTIONS</span><strong>10</strong><p>현재 공개 중인 시스템 솔루션</p></article>
      <article class="business-metric"><i><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg></i><span>INTERACTIVE DEMOS</span><strong>10</strong><p>직접 체험 가능한 데모</p></article>
    </div>`;
  header.after(section);
}

function installRequests(){
  if(document.querySelector('#requests'))return;
  const anchor=document.querySelector('#business-overview');
  if(!anchor)return;
  const section=document.createElement('section');
  section.className='admin-section';
  section.id='requests';
  section.innerHTML=`
    <div class="admin-section-title">
      <div><span>PROJECT REQUESTS</span><h2>프로젝트 문의</h2></div>
      <p>aesost.com 문의폼으로 접수된 실제 Firestore projectRequests 데이터입니다.</p>
    </div>
    <article class="request-panel">
      <div class="request-tools">
        <input type="search" placeholder="회사명, 이름, 이메일 검색" data-request-search aria-label="프로젝트 문의 검색">
        <select data-request-status-filter aria-label="문의 상태 필터"><option value="all">전체 상태</option>${statuses.map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select>
      </div>
      <div class="request-table-wrap">
        <table class="request-table">
          <thead><tr><th>접수일</th><th>회사 / 담당자</th><th>요청 유형</th><th>예산</th><th>상태</th><th></th></tr></thead>
          <tbody data-request-rows><tr><td colspan="6" class="table-empty">문의 데이터를 불러오는 중입니다.</td></tr></tbody>
        </table>
      </div>
      <div class="table-footer"><span data-request-count>0건 표시</span><span>Firestore projectRequests</span></div>
    </article>`;
  anchor.after(section);
  section.querySelector('[data-request-search]')?.addEventListener('input',applyRequestFilters);
  section.querySelector('[data-request-status-filter]')?.addEventListener('change',applyRequestFilters);
}

function installSolutions(){
  if(document.querySelector('#solutions-admin'))return;
  const anchor=document.querySelector('#requests');
  if(!anchor)return;
  const section=document.createElement('section');
  section.className='admin-section';
  section.id='solutions-admin';
  section.innerHTML=`
    <div class="admin-section-title">
      <div><span>SYSTEM SOLUTIONS</span><h2>현재 공개 솔루션</h2></div>
      <p>10개 솔루션 소개 페이지와 LIVE DEMO 상태를 빠르게 확인합니다.</p>
    </div>
    <div class="admin-solution-grid">${solutions.map(([number,name,type,url])=>`<article class="admin-solution-card"><i>${number}</i><div><small>LIVE SOLUTION</small><strong>${name}</strong><span>${type}</span></div><a href="../${url}" target="_blank" rel="noopener">페이지 보기 ↗</a></article>`).join('')}</div>`;
  anchor.after(section);
}

function ensureDialog(){
  if(document.querySelector('[data-request-dialog]'))return;
  const dialog=document.createElement('dialog');
  dialog.className='admin-dialog';
  dialog.dataset.requestDialog='';
  dialog.innerHTML='<div class="admin-dialog-head"><h3 data-dialog-title>프로젝트 문의</h3><button type="button" data-dialog-close>닫기</button></div><div class="admin-dialog-body" data-dialog-body></div>';
  document.body.appendChild(dialog);
  dialog.querySelector('[data-dialog-close]')?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
}

function renderMetrics(){
  const newCount=requests.filter(item=>(item.status||'new')==='new').length;
  const activeCount=requests.filter(item=>!['won','closed'].includes(item.status||'new')).length;
  const newEl=document.querySelector('[data-admin-new-requests]');
  const activeEl=document.querySelector('[data-admin-active-requests]');
  if(newEl)newEl.textContent=newCount.toLocaleString('ko-KR');
  if(activeEl)activeEl.textContent=activeCount.toLocaleString('ko-KR');
}

function applyRequestFilters(){
  const keyword=String(document.querySelector('[data-request-search]')?.value||'').trim().toLowerCase();
  const status=String(document.querySelector('[data-request-status-filter]')?.value||'all');
  filtered=requests.filter(item=>{
    const text=`${item.company||''} ${item.name||''} ${item.email||''} ${(item.projectTypes||[]).join(' ')}`.toLowerCase();
    if(keyword&&!text.includes(keyword))return false;
    if(status!=='all'&&(item.status||'new')!==status)return false;
    return true;
  });
  renderRequestTable();
}

function renderRequestTable(){
  const rows=document.querySelector('[data-request-rows]');
  if(!rows)return;
  if(!filtered.length){rows.innerHTML='<tr><td colspan="6" class="table-empty">조건에 맞는 문의가 없습니다.</td></tr>'}
  else{
    rows.innerHTML=filtered.map(item=>{
      const types=(Array.isArray(item.projectTypes)?item.projectTypes:[]).slice(0,3);
      return `<tr data-request-id="${escapeHtml(item.id)}">
        <td>${escapeHtml(dateText(item.createdAt))}</td>
        <td class="request-company"><strong>${escapeHtml(item.company||'회사명 미입력')}</strong><small>${escapeHtml(item.name||'—')} · ${escapeHtml(item.email||'—')}</small></td>
        <td><div class="request-types">${types.map(type=>`<span>${escapeHtml(type)}</span>`).join('')}${(item.projectTypes||[]).length>3?`<span>+${(item.projectTypes||[]).length-3}</span>`:''}</div></td>
        <td>${escapeHtml(item.budget||'미정')}</td>
        <td><select class="request-status" data-request-status>${statuses.map(([key,label])=>`<option value="${key}"${(item.status||'new')===key?' selected':''}>${label}</option>`).join('')}</select></td>
        <td><button type="button" class="request-view" data-request-view>보기</button></td>
      </tr>`;
    }).join('');
  }
  const count=document.querySelector('[data-request-count]');if(count)count.textContent=`${filtered.length.toLocaleString('ko-KR')}건 표시`;
  rows.querySelectorAll('[data-request-status]').forEach(select=>select.addEventListener('change',changeRequestStatus));
  rows.querySelectorAll('[data-request-view]').forEach(button=>button.addEventListener('click',openRequestDetail));
}

async function changeRequestStatus(event){
  const row=event.currentTarget.closest('[data-request-id]');
  const id=row?.dataset.requestId;
  const value=event.currentTarget.value;
  if(!id)return;
  event.currentTarget.disabled=true;
  try{
    await updateDoc(doc(db,'projectRequests',id),{status:value,updatedAt:serverTimestamp()});
    const item=requests.find(entry=>entry.id===id);if(item)item.status=value;
    renderMetrics();
  }catch(error){
    console.error('Project request status update failed',error);
    const item=requests.find(entry=>entry.id===id);event.currentTarget.value=item?.status||'new';
    alert('문의 상태를 변경하지 못했습니다. Firestore 관리자 권한을 확인해 주세요.');
  }finally{event.currentTarget.disabled=false}
}

function openRequestDetail(event){
  const id=event.currentTarget.closest('[data-request-id]')?.dataset.requestId;
  const item=requests.find(entry=>entry.id===id);if(!item)return;
  const dialog=document.querySelector('[data-request-dialog]');
  const title=dialog?.querySelector('[data-dialog-title]');
  const body=dialog?.querySelector('[data-dialog-body]');
  if(!dialog||!body)return;
  if(title)title.textContent=item.company||item.name||'프로젝트 문의';
  body.innerHTML=`<div class="admin-detail-grid">
    <div class="admin-detail-item"><span>담당자</span><strong>${escapeHtml(item.name||'—')}</strong></div>
    <div class="admin-detail-item"><span>접수일</span><strong>${escapeHtml(dateText(item.createdAt,true))}</strong></div>
    <div class="admin-detail-item"><span>이메일</span><strong>${escapeHtml(item.email||'—')}</strong></div>
    <div class="admin-detail-item"><span>연락처</span><strong>${escapeHtml(item.phone||'—')}</strong></div>
    <div class="admin-detail-item"><span>예산</span><strong>${escapeHtml(item.budget||'미정')}</strong></div>
    <div class="admin-detail-item"><span>희망 일정</span><strong>${escapeHtml(item.schedule||'미정')}</strong></div>
    <div class="admin-detail-item"><span>연락 방식</span><strong>${escapeHtml(item.contactMethod||'—')}</strong></div>
    <div class="admin-detail-item"><span>프로젝트 유형</span><strong>${escapeHtml((item.projectTypes||[]).join(', ')||'—')}</strong></div>
  </div><div class="admin-detail-description">${escapeHtml(item.description||'상세 내용이 없습니다.')}</div>`;
  dialog.showModal();
}

async function loadRequests(){
  if(loading)return;
  const user=auth.currentUser;
  if(!user||String(user.email||'').toLowerCase()!==ADMIN_EMAIL)return;
  loading=true;
  try{
    const snapshot=await getDocs(collection(db,'projectRequests'));
    requests=snapshot.docs.map(item=>({id:item.id,...item.data()}));
    requests.sort((a,b)=>(toDate(b.createdAt)?.getTime()||0)-(toDate(a.createdAt)?.getTime()||0));
    renderMetrics();applyRequestFilters();
  }catch(error){
    console.error('Project requests load failed',error);
    const rows=document.querySelector('[data-request-rows]');if(rows)rows.innerHTML='<tr><td colspan="6" class="table-empty">프로젝트 문의를 불러오지 못했습니다.</td></tr>';
  }finally{loading=false}
}

installNavigation();
installOverview();
installRequests();
installSolutions();
ensureDialog();
loadRequests();
document.querySelector('[data-refresh]')?.addEventListener('click',loadRequests);
