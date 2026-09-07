import { auth, db } from '../firebase-config.js';
import { collection, doc, getDocs, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const ADMIN_EMAIL='planus253@naver.com';
const views={
  dashboard:['OVERVIEW','대시보드'],
  requests:['PROJECT REQUESTS','프로젝트 문의'],
  solutions:['SYSTEM SOLUTIONS','솔루션'],
  visitors:['VISITOR ANALYTICS','방문자'],
  members:['MEMBERS','회원']
};
const solutions=[
  ['01','SoloDesk','1인사업자 관리','solution-solodesk.html','demo/solodesk/'],
  ['02','B2B Inquiry Hub','기업 B2B 문의','solution-b2b-inquiry.html','demo/b2b-inquiry/'],
  ['03','Company CMS','기업 홈페이지 운영','solution-company-cms.html','demo/company-cms/'],
  ['04','Client Portal','고객 프로젝트 공유','solution-client-portal.html','demo/client-portal/'],
  ['05','Booking OS','예약 기반 사업 관리','solution-booking-os.html','demo/booking-os/'],
  ['06','Vendor Desk','협력사·발주 관리','solution-vendor-desk.html','demo/vendor-desk/'],
  ['07','Membership Admin','회원·멤버십 운영','solution-membership-admin.html','demo/membership-admin/'],
  ['08','Support Desk','고객 문의·지원','solution-support-desk.html','demo/support-desk/'],
  ['09','Project Room','프로젝트 협업·진행','solution-project-room.html','demo/project-room/'],
  ['10','QuoteFlow','견적·제안서 자동화','solution-quote-flow.html','demo/quote-flow/']
];
const statuses=[['new','신규'],['contacted','연락완료'],['proposal','제안중'],['won','계약'],['closed','종료']];
let requests=[];
let filtered=[];
let loading=false;

const $=selector=>document.querySelector(selector);
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function toDate(value){if(!value)return null;if(typeof value.toDate==='function')return value.toDate();if(value instanceof Date)return value;if(typeof value.seconds==='number')return new Date(value.seconds*1000);const date=new Date(value);return Number.isNaN(date.getTime())?null:date}
function dateText(value,withTime=false){const date=toDate(value);if(!date)return '—';return new Intl.DateTimeFormat('ko-KR',withTime?{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}:{year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}

function setConnection(message,state='online'){
  const el=$('[data-connection-status]');if(!el)return;
  el.textContent=message;
  el.classList.toggle('is-online',state==='online');
  el.classList.toggle('is-error',state==='error');
}

function showView(key,{updateHash=true}={}){
  const target=views[key]?key:'dashboard';
  document.querySelectorAll('[data-admin-view]').forEach(view=>{
    const active=view.dataset.adminView===target;
    view.hidden=!active;
    view.classList.toggle('is-active',active);
  });
  document.querySelectorAll('[data-admin-nav]').forEach(link=>link.classList.toggle('is-active',link.dataset.adminNav===target));
  const [kicker,title]=views[target];
  const kickerEl=$('[data-admin-header-kicker]');const titleEl=$('[data-admin-header-title]');
  if(kickerEl)kickerEl.textContent=kicker;if(titleEl)titleEl.textContent=title;
  if(updateHash&&history.replaceState)history.replaceState(null,'',`#${target}`);
  window.scrollTo({top:0,behavior:'instant'});
}

document.querySelectorAll('[data-admin-nav]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();showView(link.dataset.adminNav)}));
document.querySelectorAll('[data-go-view]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.goView)));
const initialHash=location.hash.replace('#','');showView(views[initialHash]?initialHash:'dashboard',{updateHash:false});

function renderSolutions(){
  const grid=$('[data-admin-solution-grid]');if(!grid)return;
  grid.innerHTML=solutions.map(([number,name,type,page,demo])=>`<article class="admin-solution-card">
    <i>${number}</i><div><small>LIVE SOLUTION</small><strong>${name}</strong><span>${type}</span></div>
    <div class="solution-actions"><a href="../${page}" target="_blank" rel="noopener">소개 ↗</a><a href="../${demo}" target="_blank" rel="noopener">DEMO ↗</a></div>
  </article>`).join('');
}

function renderMetrics(){
  const newCount=requests.filter(item=>(item.status||'new')==='new').length;
  const activeCount=requests.filter(item=>!['won','closed'].includes(item.status||'new')).length;
  const newEl=$('[data-admin-new-requests]');const activeEl=$('[data-admin-active-requests]');
  if(newEl)newEl.textContent=newCount.toLocaleString('ko-KR');if(activeEl)activeEl.textContent=activeCount.toLocaleString('ko-KR');
}

function renderRecent(){
  const list=$('[data-dashboard-request-list]');if(!list)return;
  const recent=requests.slice(0,4);
  if(!recent.length){list.innerHTML='<div class="empty-state compact"><strong>아직 접수된 프로젝트 문의가 없습니다.</strong></div>';return}
  list.innerHTML=recent.map(item=>`<button type="button" class="recent-request" data-recent-request="${escapeHtml(item.id)}"><span><strong>${escapeHtml(item.company||item.name||'프로젝트 문의')}</strong><span>${escapeHtml(item.name||'—')} · ${escapeHtml(dateText(item.createdAt))}</span></span><em>${escapeHtml(statuses.find(([key])=>key===(item.status||'new'))?.[1]||'신규')}</em></button>`).join('');
  list.querySelectorAll('[data-recent-request]').forEach(button=>button.addEventListener('click',()=>{showView('requests');openRequestById(button.dataset.recentRequest)}));
}

function applyFilters(){
  const keyword=String($('[data-request-search]')?.value||'').trim().toLowerCase();
  const status=String($('[data-request-status-filter]')?.value||'all');
  filtered=requests.filter(item=>{
    const text=`${item.company||''} ${item.name||''} ${item.email||''} ${(item.projectTypes||[]).join(' ')}`.toLowerCase();
    return (!keyword||text.includes(keyword))&&(status==='all'||(item.status||'new')===status);
  });
  renderRequestTable();
}

function renderRequestTable(){
  const rows=$('[data-request-rows]');if(!rows)return;
  if(!filtered.length){rows.innerHTML='<tr><td colspan="6"><div class="empty-state"><strong>조건에 맞는 문의가 없습니다.</strong></div></td></tr>'}
  else rows.innerHTML=filtered.map(item=>{
    const types=(Array.isArray(item.projectTypes)?item.projectTypes:[]).slice(0,3);
    return `<tr data-request-id="${escapeHtml(item.id)}"><td>${escapeHtml(dateText(item.createdAt))}</td><td class="request-company"><strong>${escapeHtml(item.company||'회사명 미입력')}</strong><small>${escapeHtml(item.name||'—')} · ${escapeHtml(item.email||'—')}</small></td><td><div class="request-types">${types.map(type=>`<span>${escapeHtml(type)}</span>`).join('')}${(item.projectTypes||[]).length>3?`<span>+${(item.projectTypes||[]).length-3}</span>`:''}</div></td><td>${escapeHtml(item.budget||'미정')}</td><td><select class="request-status" data-request-status>${statuses.map(([key,label])=>`<option value="${key}"${(item.status||'new')===key?' selected':''}>${label}</option>`).join('')}</select></td><td><button type="button" class="request-view" data-request-view>보기</button></td></tr>`;
  }).join('');
  const count=$('[data-request-count]');if(count)count.textContent=`${filtered.length.toLocaleString('ko-KR')}건 표시`;
  rows.querySelectorAll('[data-request-status]').forEach(select=>select.addEventListener('change',changeStatus));
  rows.querySelectorAll('[data-request-view]').forEach(button=>button.addEventListener('click',event=>openRequestById(event.currentTarget.closest('[data-request-id]')?.dataset.requestId)));
}

async function changeStatus(event){
  const row=event.currentTarget.closest('[data-request-id]');const id=row?.dataset.requestId;const value=event.currentTarget.value;if(!id)return;
  event.currentTarget.disabled=true;
  try{await updateDoc(doc(db,'projectRequests',id),{status:value,updatedAt:serverTimestamp()});const item=requests.find(entry=>entry.id===id);if(item)item.status=value;renderMetrics();renderRecent()}
  catch(error){console.error('Project request status update failed',error);const item=requests.find(entry=>entry.id===id);event.currentTarget.value=item?.status||'new';alert('문의 상태를 변경하지 못했습니다.')}
  finally{event.currentTarget.disabled=false}
}

function openRequestById(id){
  const item=requests.find(entry=>entry.id===id);if(!item)return;
  const dialog=$('[data-request-dialog]');const title=$('[data-dialog-title]');const body=$('[data-dialog-body]');if(!dialog||!body)return;
  if(title)title.textContent=item.company||item.name||'프로젝트 문의';
  body.innerHTML=`<div class="admin-detail-grid"><div class="admin-detail-item"><span>담당자</span><strong>${escapeHtml(item.name||'—')}</strong></div><div class="admin-detail-item"><span>접수일</span><strong>${escapeHtml(dateText(item.createdAt,true))}</strong></div><div class="admin-detail-item"><span>이메일</span><strong>${escapeHtml(item.email||'—')}</strong></div><div class="admin-detail-item"><span>연락처</span><strong>${escapeHtml(item.phone||'—')}</strong></div><div class="admin-detail-item"><span>예산</span><strong>${escapeHtml(item.budget||'미정')}</strong></div><div class="admin-detail-item"><span>희망 일정</span><strong>${escapeHtml(item.schedule||'미정')}</strong></div><div class="admin-detail-item"><span>연락 방식</span><strong>${escapeHtml(item.contactMethod||'—')}</strong></div><div class="admin-detail-item"><span>프로젝트 유형</span><strong>${escapeHtml((item.projectTypes||[]).join(', ')||'—')}</strong></div></div><div class="admin-detail-description">${escapeHtml(item.description||'상세 내용이 없습니다.')}</div>`;
  dialog.showModal();
}

$('[data-dialog-close]')?.addEventListener('click',()=>$('[data-request-dialog]')?.close());
$('[data-request-dialog]')?.addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close()});
$('[data-request-search]')?.addEventListener('input',applyFilters);$('[data-request-status-filter]')?.addEventListener('change',applyFilters);

async function loadRequests(){
  if(loading)return;const user=auth.currentUser;if(!user||String(user.email||'').toLowerCase()!==ADMIN_EMAIL)return;
  loading=true;
  try{const snapshot=await getDocs(collection(db,'projectRequests'));requests=snapshot.docs.map(item=>({id:item.id,...item.data()}));requests.sort((a,b)=>(toDate(b.createdAt)?.getTime()||0)-(toDate(a.createdAt)?.getTime()||0));renderMetrics();renderRecent();applyFilters();setConnection('데이터 연결됨','online')}
  catch(error){console.error('Project requests load failed',error);requests=[];filtered=[];renderMetrics();renderRecent();renderRequestTable();setConnection('일부 데이터 확인 필요','error');const box=$('[data-admin-error]');const message=$('[data-admin-error-message]');if(box)box.hidden=false;if(message)message.textContent=String(error?.code||'').includes('permission-denied')?'Firestore projectRequests 관리자 읽기 권한을 확인해 주세요.':'프로젝트 문의 데이터를 불러오지 못했습니다.'}
  finally{loading=false}
}

renderSolutions();loadRequests();
$('[data-refresh]')?.addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('admin:refresh'));loadRequests()});
window.addEventListener('admin:go',event=>showView(event.detail?.view||'dashboard'));
