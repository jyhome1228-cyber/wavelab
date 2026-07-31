import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp,
  setDoc, updateDoc
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const main=document.querySelector('[data-admin-main]');
const gate=document.querySelector('[data-admin-gate]');
const sidebar=document.querySelector('.admin-sidebar');
const tabs=[...document.querySelectorAll('[data-admin-tab]')];
const panels=[...document.querySelectorAll('[data-admin-panel]')];
const heading=document.querySelector('[data-admin-heading]');
const esc=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
let state={users:[],applications:[],columns:[],community:[],notices:[]};

function dateText(value){const d=value?.toDate?.();return d?new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(d):'-'}
function empty(message){return `<div class="admin-empty"><strong>${message}</strong></div>`}
function setTab(name){tabs.forEach(b=>b.classList.toggle('is-active',b.dataset.adminTab===name));panels.forEach(p=>p.classList.toggle('is-active',p.dataset.adminPanel===name));const button=tabs.find(b=>b.dataset.adminTab===name);heading.textContent=button?.textContent||'관리자';sidebar.classList.remove('is-open');history.replaceState(null,'',`#${name}`)}
tabs.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.adminTab)));
document.querySelectorAll('[data-go-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.goTab)));
document.querySelector('[data-admin-menu]')?.addEventListener('click',()=>sidebar.classList.toggle('is-open'));
document.querySelector('[data-admin-logout]')?.addEventListener('click',async()=>{await signOut(auth);location.replace('../index.html')});

async function readCollection(name){const snap=await getDocs(collection(db,name));return snap.docs.map(d=>({id:d.id,...d.data()}))}

function renderCounts(){
  document.querySelector('[data-count-users]').textContent=state.users.length;
  document.querySelector('[data-count-applications]').textContent=state.applications.filter(v=>v.status==='pending').length;
  document.querySelector('[data-count-reviews]').textContent=state.columns.filter(v=>v.status==='review').length;
  document.querySelector('[data-count-community]').textContent=state.community.length;
}
function appItem(item,compact=false){return `<article class="admin-item" data-application-id="${item.id}"><div><h3>${esc(item.penName||item.displayName||'이름 없음')}</h3><p>${esc(item.bio||'소개 없음')}${compact?'':`<br>${esc(item.expertise||'')}<br>${esc(item.topics||'')}`}</p><small>${esc(item.email||'')} · ${esc(item.status||'pending')}</small></div>${compact?'':`<div class="admin-item-actions"><button class="danger" data-reject>반려</button><button class="primary" data-approve>승인</button></div>`}</article>`}
function columnItem(item,compact=false){const status={draft:'임시저장',review:'검토 중',published:'공개'}[item.status]||item.status;return `<article class="admin-item" data-column-id="${item.id}"><div><h3>${esc(item.title||'제목 없음')}</h3><p>${esc(item.summary||'')}</p><small>${esc(item.authorName||'')} · ${esc(item.category||'')} · ${esc(status)}</small></div>${compact?'':`<div class="admin-item-actions"><a href="../column-detail.html?id=${encodeURIComponent(item.id)}" target="_blank">미리보기</a>${item.status!=='published'?'<button class="primary" data-publish>공개</button>':'<button data-unpublish>비공개</button>'}<button class="danger" data-delete-column>삭제</button></div>`}</article>`}
function renderDashboard(){const apps=state.applications.filter(v=>v.status==='pending').slice(0,4);const reviews=state.columns.filter(v=>v.status==='review').slice(0,4);document.querySelector('[data-dashboard-applications]').innerHTML=apps.length?apps.map(v=>appItem(v,true)).join(''):empty('대기 중인 신청이 없습니다.');document.querySelector('[data-dashboard-reviews]').innerHTML=reviews.length?reviews.map(v=>columnItem(v,true)).join(''):empty('검토할 칼럼이 없습니다.')}
function renderMembers(filter=''){const rows=state.users.filter(v=>`${v.displayName||''} ${v.email||''}`.toLowerCase().includes(filter.toLowerCase()));document.querySelector('[data-member-list]').innerHTML=rows.length?rows.map(v=>`<tr data-user-id="${v.id}"><td><div class="admin-member"><strong>${esc(v.displayName||'회원')}</strong><small>${esc(v.email||'')}</small></div></td><td><span class="admin-badge ${v.role==='admin'?'blue':''}">${esc(v.role||'member')}</span></td><td><span class="admin-badge ${v.status!=='suspended'?'green':''}">${esc(v.status||'active')}</span></td><td>${dateText(v.createdAt)}</td><td><div class="admin-item-actions"><button data-toggle-role>${v.role==='admin'?'일반회원':'관리자'}</button><button class="${v.status==='suspended'?'':'danger'}" data-toggle-status>${v.status==='suspended'?'활성화':'정지'}</button></div></td></tr>`).join(''):`<tr><td colspan="5">${empty('표시할 회원이 없습니다.')}</td></tr>`}
function renderApplications(){const pending=state.applications.filter(v=>v.status==='pending');document.querySelector('[data-application-list]').innerHTML=pending.length?pending.map(v=>appItem(v)).join(''):empty('검토할 신청이 없습니다.')}
function renderColumns(filter='all'){const items=filter==='all'?state.columns:state.columns.filter(v=>v.status===filter);items.sort((a,b)=>(b.updatedAt?.seconds||0)-(a.updatedAt?.seconds||0));document.querySelector('[data-column-list]').innerHTML=items.length?items.map(v=>columnItem(v)).join(''):empty('해당 상태의 칼럼이 없습니다.')}
function renderCommunity(){document.querySelector('[data-community-list]').innerHTML=state.community.length?state.community.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).map(v=>`<article class="admin-item" data-community-id="${v.id}"><div><h3>${esc(v.title||'제목 없음')}</h3><p>${esc(v.content||'').slice(0,180)}</p><small>${esc(v.authorName||v.authorEmail||'회원')} · ${esc(v.category||'자유')} · ${dateText(v.createdAt)}</small></div><div class="admin-item-actions"><a href="../community-detail.html?id=${encodeURIComponent(v.id)}" target="_blank">보기</a><button class="danger" data-delete-community>삭제</button></div></article>`).join(''):empty('커뮤니티 게시글이 없습니다.')}
function renderNotices(){document.querySelector('[data-notice-list]').innerHTML=state.notices.length?state.notices.sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).map(v=>`<article class="admin-item" data-notice-id="${v.id}"><div><h3>${esc(v.title||'제목 없음')}</h3><p>${esc(v.content||'').slice(0,180)}</p><small>${dateText(v.createdAt)}</small></div><div class="admin-item-actions"><a href="../notice-detail.html?id=${encodeURIComponent(v.id)}" target="_blank">보기</a><button class="danger" data-delete-notice>삭제</button></div></article>`).join(''):empty('등록된 공지사항이 없습니다.')}
function renderAll(){renderCounts();renderDashboard();renderMembers();renderApplications();renderColumns();renderCommunity();renderNotices()}

async function loadAll(){const names=['users','columnistApplications','columns','communityPosts','notices'];const results=await Promise.all(names.map(async name=>{try{return await readCollection(name)}catch(error){console.warn(name,error.code);return []}}));[state.users,state.applications,state.columns,state.community,state.notices]=results;renderAll()}

document.querySelector('[data-member-search]')?.addEventListener('input',e=>renderMembers(e.target.value));
document.querySelector('[data-column-filter]')?.addEventListener('change',e=>renderColumns(e.target.value));

document.addEventListener('click',async event=>{
  const app=event.target.closest('[data-application-id]');
  if(app){const id=app.dataset.applicationId;const item=state.applications.find(v=>v.id===id);if(event.target.closest('[data-approve]')){await setDoc(doc(db,'columnistProfiles',id),{uid:id,penName:item.penName||item.displayName||'칼럼니스트',bio:item.bio||'',expertise:item.expertise||'',referenceUrl:item.referenceUrl||'',status:'approved',approvedAt:serverTimestamp(),updatedAt:serverTimestamp()});await updateDoc(doc(db,'columnistApplications',id),{status:'approved',updatedAt:serverTimestamp()});await loadAll()}if(event.target.closest('[data-reject]')){await updateDoc(doc(db,'columnistApplications',id),{status:'rejected',updatedAt:serverTimestamp()});await loadAll()}return}
  const column=event.target.closest('[data-column-id]');
  if(column){const id=column.dataset.columnId;if(event.target.closest('[data-publish]'))await updateDoc(doc(db,'columns',id),{status:'published',publishedAt:serverTimestamp(),updatedAt:serverTimestamp()});if(event.target.closest('[data-unpublish]'))await updateDoc(doc(db,'columns',id),{status:'draft',updatedAt:serverTimestamp()});if(event.target.closest('[data-delete-column]')&&confirm('이 칼럼을 삭제할까요?'))await deleteDoc(doc(db,'columns',id));await loadAll();return}
  const community=event.target.closest('[data-community-id]');if(community&&event.target.closest('[data-delete-community]')&&confirm('이 게시글을 삭제할까요?')){await deleteDoc(doc(db,'communityPosts',community.dataset.communityId));await loadAll();return}
  const notice=event.target.closest('[data-notice-id]');if(notice&&event.target.closest('[data-delete-notice]')&&confirm('이 공지를 삭제할까요?')){await deleteDoc(doc(db,'notices',notice.dataset.noticeId));await loadAll();return}
  const row=event.target.closest('[data-user-id]');if(row){const id=row.dataset.userId;const user=state.users.find(v=>v.id===id);if(event.target.closest('[data-toggle-role]'))await updateDoc(doc(db,'users',id),{role:user.role==='admin'?'member':'admin',updatedAt:serverTimestamp()});if(event.target.closest('[data-toggle-status]'))await updateDoc(doc(db,'users',id),{status:user.status==='suspended'?'active':'suspended',updatedAt:serverTimestamp()});await loadAll()}
});

onAuthStateChanged(auth,async user=>{
  if(!user){location.replace(`../login.html?next=${encodeURIComponent('admin/')}`);return}
  try{const admin=await getDoc(doc(db,'admins',user.uid));if(!admin.exists()){gate.innerHTML='<span>✦</span><strong class="admin-error">관리자 권한이 없습니다.</strong><p>마스터 관리자에게 권한을 요청해 주세요.</p>';return}const data=admin.data();document.querySelector('[data-admin-name]').textContent=data.name||user.displayName||'관리자';document.querySelector('[data-admin-email]').textContent=data.email||user.email||'';document.querySelector('[data-admin-role]').textContent=`${data.role||'admin'} · ${data.status||'active'}`;gate.hidden=true;main.hidden=false;setTab(location.hash.replace('#','')||'dashboard');await loadAll()}catch(error){gate.innerHTML=`<span>✦</span><strong class="admin-error">관리자 페이지를 불러오지 못했습니다.</strong><p>${esc(error.code||'Firestore 권한을 확인해 주세요.')}</p>`}
});