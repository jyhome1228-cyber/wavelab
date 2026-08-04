import { auth, db } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { collection, doc, getDoc, getDocs } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const gate=document.querySelector('[data-admin-gate]');
const app=document.querySelector('[data-admin-app]');
const gateTitle=document.querySelector('[data-admin-gate-title]');
const gateMessage=document.querySelector('[data-admin-gate-message]');
const gateActions=document.querySelector('[data-admin-gate-actions]');
const statusEl=document.querySelector('[data-connection-status]');
const errorBox=document.querySelector('[data-admin-error]');
const errorMessage=document.querySelector('[data-admin-error-message]');
const rowsEl=document.querySelector('[data-member-rows]');
const searchInput=document.querySelector('[data-member-search]');
const dateFilter=document.querySelector('[data-date-filter]');
let users=[];
let filteredUsers=[];
let loading=false;

function toDate(value){
  if(!value)return null;
  if(typeof value.toDate==='function')return value.toDate();
  if(value instanceof Date)return value;
  if(typeof value==='number')return new Date(value);
  if(typeof value==='string'){
    const parsed=new Date(value);
    return Number.isNaN(parsed.getTime())?null:parsed;
  }
  if(typeof value.seconds==='number')return new Date(value.seconds*1000);
  return null;
}
function dateText(value,withTime=false){
  const date=toDate(value);
  if(!date)return '—';
  return new Intl.DateTimeFormat('ko-KR',withTime?{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}:{year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}
function startOfDay(date=new Date()){const next=new Date(date);next.setHours(0,0,0,0);return next}
function daysAgo(days){const date=startOfDay();date.setDate(date.getDate()-days);return date}
function initial(name,email){return String(name||email||'A').trim().charAt(0).toUpperCase()}
function userCreatedAt(user){return toDate(user.createdAt)||toDate(user.signupAt)||null}
function userLastLogin(user){return toDate(user.lastLoginAt)||toDate(user.updatedAt)||null}

function showGate(title,message,showActions=true){
  gateTitle.textContent=title;
  gateMessage.textContent=message;
  gateActions.hidden=!showActions;
  app.hidden=true;
  gate.hidden=false;
}
function openDashboard(user){
  gate.hidden=true;
  app.hidden=false;
  document.querySelector('[data-admin-account]').textContent=user.email||user.displayName||'관리자';
  loadUsers();
}
function setConnection(message,state=''){
  statusEl.textContent=message;
  statusEl.classList.toggle('is-online',state==='online');
  statusEl.classList.toggle('is-error',state==='error');
}

async function leaveAdmin(){
  await signOut(auth);
  location.replace('../login.html?next=admin/');
}
document.querySelector('[data-admin-logout]')?.addEventListener('click',leaveAdmin);
document.querySelector('[data-admin-switch-account]')?.addEventListener('click',leaveAdmin);
document.querySelector('[data-refresh]')?.addEventListener('click',()=>loadUsers(true));

function updateMetrics(){
  const sevenDays=daysAgo(6);
  const thirtyDays=daysAgo(29);
  const today=startOfDay();
  const newUsers=users.filter(user=>{const date=userCreatedAt(user);return date&&date>=sevenDays}).length;
  const activeUsers=users.filter(user=>{const date=userLastLogin(user);return date&&date>=thirtyDays}).length;
  const todayUsers=users.filter(user=>{const date=userLastLogin(user);return date&&date>=today}).length;
  document.querySelector('[data-total-users]').textContent=users.length.toLocaleString('ko-KR');
  document.querySelector('[data-new-users]').textContent=newUsers.toLocaleString('ko-KR');
  document.querySelector('[data-active-users]').textContent=activeUsers.toLocaleString('ko-KR');
  document.querySelector('[data-today-users]').textContent=todayUsers.toLocaleString('ko-KR');
}
function renderGrowth(){
  const chart=document.querySelector('[data-growth-chart]');
  const summary=document.querySelector('[data-growth-summary]');
  const days=[];
  for(let index=13;index>=0;index-=1){
    const date=startOfDay();date.setDate(date.getDate()-index);
    const next=new Date(date);next.setDate(next.getDate()+1);
    const count=users.filter(user=>{const created=userCreatedAt(user);return created&&created>=date&&created<next}).length;
    days.push({date,count});
  }
  const max=Math.max(1,...days.map(day=>day.count));
  chart.innerHTML='';
  days.forEach(day=>{
    const item=document.createElement('div');item.className='growth-day';
    const wrap=document.createElement('div');wrap.className='growth-bar-wrap';
    const bar=document.createElement('div');bar.className='growth-bar';bar.style.height=`${Math.max(day.count?8:2,(day.count/max)*100)}%`;bar.title=`${dateText(day.date)} · ${day.count}명`;
    const value=document.createElement('span');value.className='growth-value';value.textContent=String(day.count);
    const label=document.createElement('span');label.className='growth-label';label.textContent=`${day.date.getMonth()+1}/${day.date.getDate()}`;
    wrap.appendChild(bar);item.append(wrap,value,label);chart.appendChild(item);
  });
  summary.textContent=`최근 14일 동안 ${days.reduce((sum,day)=>sum+day.count,0).toLocaleString('ko-KR')}명이 새로 가입했습니다.`;
}
function renderStatuses(){
  const container=document.querySelector('[data-status-overview]');
  const total=Math.max(users.length,1);
  const map=new Map();
  users.forEach(user=>{const status=String(user.status||'active').toLowerCase();map.set(status,(map.get(status)||0)+1)});
  const labels={active:'활성 회원',suspended:'정지 회원',inactive:'비활성 회원'};
  const keys=[...new Set(['active','suspended','inactive',...map.keys()])].filter(key=>map.has(key));
  container.innerHTML='';
  if(!keys.length){container.innerHTML='<p class="table-empty">회원 상태 데이터가 없습니다.</p>';return}
  keys.forEach(key=>{
    const count=map.get(key)||0;
    const row=document.createElement('div');row.className='status-row';
    const strong=document.createElement('strong');strong.textContent=labels[key]||key;
    const value=document.createElement('span');value.textContent=`${count}명 · ${Math.round(count/total*100)}%`;
    const track=document.createElement('div');track.className='status-track';
    const fill=document.createElement('div');fill.className='status-fill';fill.style.width=`${count/total*100}%`;
    track.appendChild(fill);row.append(strong,value,track);container.appendChild(row);
  });
}
function applyFilters(){
  const keyword=String(searchInput?.value||'').trim().toLowerCase();
  const period=String(dateFilter?.value||'all');
  const threshold=period==='all'?null:daysAgo(Number(period)-1);
  filteredUsers=users.filter(user=>{
    const text=`${user.displayName||''} ${user.email||''}`.toLowerCase();
    if(keyword&&!text.includes(keyword))return false;
    if(threshold){const created=userCreatedAt(user);if(!created||created<threshold)return false}
    return true;
  });
  renderTable();
}
function renderTable(){
  rowsEl.innerHTML='';
  if(!filteredUsers.length){
    rowsEl.innerHTML='<tr><td class="table-empty" colspan="5">조건에 맞는 회원이 없습니다.</td></tr>';
  }else{
    filteredUsers.forEach(user=>{
      const row=document.createElement('tr');
      const memberCell=document.createElement('td');
      memberCell.innerHTML=`<div class="member-cell"><span class="member-avatar">${initial(user.displayName,user.email)}</span><div><strong>${user.displayName||user.email?.split('@')[0]||'회원'}</strong><small>${user.role||'member'}</small></div></div>`;
      const email=document.createElement('td');email.textContent=user.email||'—';
      const joined=document.createElement('td');joined.textContent=dateText(userCreatedAt(user));
      const login=document.createElement('td');login.textContent=dateText(userLastLogin(user),true);
      const status=document.createElement('td');
      const badge=document.createElement('span');const statusValue=user.status||'active';badge.className=`status-badge${statusValue==='suspended'?' is-suspended':''}`;badge.textContent=statusValue;status.appendChild(badge);
      row.append(memberCell,email,joined,login,status);rowsEl.appendChild(row);
    });
  }
  document.querySelector('[data-filtered-count]').textContent=`${filteredUsers.length.toLocaleString('ko-KR')}명 표시`;
}
function renderAll(){updateMetrics();renderGrowth();renderStatuses();applyFilters()}
async function loadUsers(force=false){
  if(loading&&!force)return;
  loading=true;errorBox.hidden=true;setConnection('회원 데이터 불러오는 중');
  const refresh=document.querySelector('[data-refresh]');refresh.disabled=true;refresh.textContent='불러오는 중...';
  try{
    const snapshot=await getDocs(collection(db,'users'));
    users=snapshot.docs.map(documentSnapshot=>({id:documentSnapshot.id,...documentSnapshot.data()}));
    users.sort((a,b)=>(userCreatedAt(b)?.getTime()||0)-(userCreatedAt(a)?.getTime()||0));
    renderAll();setConnection(`Firebase 연결됨 · ${users.length}명`,'online');
  }catch(error){
    console.error('Admin user load failed',error);users=[];filteredUsers=[];renderAll();setConnection('Firebase 권한 확인 필요','error');errorBox.hidden=false;
    errorMessage.textContent=String(error?.code||'').includes('permission-denied')?'Firestore 규칙에서 관리자 계정의 users 목록 조회 권한을 확인해 주세요.':'Firebase 연결 상태를 확인해 주세요.';
  }finally{loading=false;refresh.disabled=false;refresh.textContent='새로고침'}
}
searchInput?.addEventListener('input',applyFilters);
dateFilter?.addEventListener('change',applyFilters);
document.querySelector('[data-export-csv]')?.addEventListener('click',()=>{
  const lines=[['이름','이메일','가입일','최근 로그인','역할','상태'],...filteredUsers.map(user=>[user.displayName||'',user.email||'',dateText(userCreatedAt(user),true),dateText(userLastLogin(user),true),user.role||'member',user.status||'active'])];
  const csv='\ufeff'+lines.map(columns=>columns.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`aesost-members-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
});
document.querySelectorAll('.sidebar-nav a').forEach(link=>link.addEventListener('click',()=>{document.querySelectorAll('.sidebar-nav a').forEach(item=>item.classList.remove('is-active'));link.classList.add('is-active')}));

onAuthStateChanged(auth,async user=>{
  if(!user){location.replace('../login.html?next=admin/');return}
  showGate('관리자 계정 확인 중',`${user.email||'현재 계정'}의 권한을 확인하고 있습니다.`,false);
  try{
    const profile=await getDoc(doc(db,'users',user.uid));
    const data=profile.exists()?profile.data():null;
    if(!data||data.role!=='admin'||data.status==='suspended'){
      showGate('관리자 권한이 없습니다.',`${user.email||'현재 계정'}은 관리자 계정으로 등록되어 있지 않습니다.`,true);
      return;
    }
    openDashboard(user);
  }catch(error){
    console.error('Admin access check failed',error);
    showGate('관리자 권한을 확인하지 못했습니다.','Firestore 규칙과 관리자 계정 설정을 확인해 주세요.',true);
  }
});
