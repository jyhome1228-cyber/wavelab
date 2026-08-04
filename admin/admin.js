import { db } from '../firebase-config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const ACCESS_HASH='83f0deea3b7aa82957b01247b7487e37d236da3d5edb2c944803d2dd3c475ca4';
const SESSION_KEY='aesost:admin:session';
const LOCK_KEY='aesost:admin:lock';

const gate=document.querySelector('[data-admin-gate]');
const app=document.querySelector('[data-admin-app]');
const form=document.querySelector('[data-admin-form]');
const notice=document.querySelector('[data-gate-notice]');
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
  return new Intl.DateTimeFormat('ko-KR',withTime?{
    year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'
  }:{year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
}

function startOfDay(date=new Date()){
  const next=new Date(date);
  next.setHours(0,0,0,0);
  return next;
}

function daysAgo(days){
  const date=startOfDay();
  date.setDate(date.getDate()-days);
  return date;
}

function initial(name,email){
  return String(name||email||'A').trim().charAt(0).toUpperCase();
}

async function sha256(value){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

function readLock(){
  try{return JSON.parse(sessionStorage.getItem(LOCK_KEY)||'{"attempts":0,"until":0}')}catch{return{attempts:0,until:0}}
}

function writeLock(lock){sessionStorage.setItem(LOCK_KEY,JSON.stringify(lock))}

function setGateNotice(message,state='error'){
  notice.textContent=message;
  notice.dataset.state=state;
}

function showDashboard(){
  gate.hidden=true;
  app.hidden=false;
  loadUsers();
}

function lockDashboard(){
  sessionStorage.removeItem(SESSION_KEY);
  app.hidden=true;
  gate.hidden=false;
  form.reset();
  setGateNotice('');
  form.elements.accessCode.focus();
}

form?.addEventListener('submit',async event=>{
  event.preventDefault();
  const current=readLock();
  if(current.until>Date.now()){
    const seconds=Math.ceil((current.until-Date.now())/1000);
    setGateNotice(`입력 횟수가 많습니다. ${seconds}초 후 다시 시도해 주세요.`);
    return;
  }

  const button=form.querySelector('button[type="submit"]');
  const code=String(new FormData(form).get('accessCode')||'');
  button.disabled=true;
  button.textContent='확인 중...';

  try{
    const valid=(await sha256(code))===ACCESS_HASH;
    if(!valid){
      const attempts=(current.attempts||0)+1;
      const next=attempts>=5?{attempts:0,until:Date.now()+30000}:{attempts,until:0};
      writeLock(next);
      setGateNotice(attempts>=5?'입력 횟수가 많아 30초 동안 잠겼습니다.':'관리 코드가 올바르지 않습니다.');
      form.elements.accessCode.select();
      return;
    }

    sessionStorage.setItem(SESSION_KEY,JSON.stringify({openedAt:Date.now()}));
    sessionStorage.removeItem(LOCK_KEY);
    setGateNotice('접속이 확인되었습니다.','success');
    showDashboard();
  }finally{
    button.disabled=false;
    button.textContent='대시보드 열기';
  }
});

document.querySelector('[data-admin-lock]')?.addEventListener('click',lockDashboard);
document.querySelector('[data-refresh]')?.addEventListener('click',()=>loadUsers(true));

function setConnection(message,state=''){
  statusEl.textContent=message;
  statusEl.classList.toggle('is-online',state==='online');
  statusEl.classList.toggle('is-error',state==='error');
}

function userCreatedAt(user){return toDate(user.createdAt)||toDate(user.signupAt)||null}
function userLastLogin(user){return toDate(user.lastLoginAt)||toDate(user.updatedAt)||null}

function updateMetrics(){
  const total=users.length;
  const sevenDays=daysAgo(6);
  const thirtyDays=daysAgo(29);
  const today=startOfDay();
  const newUsers=users.filter(user=>{
    const date=userCreatedAt(user);
    return date&&date>=sevenDays;
  }).length;
  const activeUsers=users.filter(user=>{
    const date=userLastLogin(user);
    return date&&date>=thirtyDays;
  }).length;
  const todayUsers=users.filter(user=>{
    const date=userLastLogin(user);
    return date&&date>=today;
  }).length;

  document.querySelector('[data-total-users]').textContent=total.toLocaleString('ko-KR');
  document.querySelector('[data-new-users]').textContent=newUsers.toLocaleString('ko-KR');
  document.querySelector('[data-active-users]').textContent=activeUsers.toLocaleString('ko-KR');
  document.querySelector('[data-today-users]').textContent=todayUsers.toLocaleString('ko-KR');
}

function renderGrowth(){
  const chart=document.querySelector('[data-growth-chart]');
  const summary=document.querySelector('[data-growth-summary]');
  const days=[];
  for(let index=13;index>=0;index-=1){
    const date=startOfDay();
    date.setDate(date.getDate()-index);
    const next=new Date(date);
    next.setDate(next.getDate()+1);
    const count=users.filter(user=>{
      const created=userCreatedAt(user);
      return created&&created>=date&&created<next;
    }).length;
    days.push({date,count});
  }

  const max=Math.max(1,...days.map(day=>day.count));
  chart.innerHTML='';
  days.forEach(day=>{
    const item=document.createElement('div');
    item.className='growth-day';
    const barWrap=document.createElement('div');
    barWrap.className='growth-bar-wrap';
    const bar=document.createElement('div');
    bar.className='growth-bar';
    bar.style.height=`${Math.max(day.count?8:2,(day.count/max)*100)}%`;
    bar.title=`${dateText(day.date)} · ${day.count}명`;
    const value=document.createElement('span');
    value.className='growth-value';
    value.textContent=String(day.count);
    const label=document.createElement('span');
    label.className='growth-label';
    label.textContent=`${day.date.getMonth()+1}/${day.date.getDate()}`;
    barWrap.appendChild(bar);
    item.append(barWrap,value,label);
    chart.appendChild(item);
  });

  const total=days.reduce((sum,day)=>sum+day.count,0);
  summary.textContent=`최근 14일 동안 ${total.toLocaleString('ko-KR')}명이 새로 가입했습니다.`;
}

function renderStatuses(){
  const container=document.querySelector('[data-status-overview]');
  const total=Math.max(users.length,1);
  const statusMap=new Map();
  users.forEach(user=>{
    const status=String(user.status||'active').toLowerCase();
    statusMap.set(status,(statusMap.get(status)||0)+1);
  });

  const labels={active:'활성 회원',suspended:'정지 회원',inactive:'비활성 회원'};
  const order=['active','suspended','inactive',...statusMap.keys()];
  const unique=[...new Set(order)].filter(key=>statusMap.has(key));
  container.innerHTML='';

  if(!unique.length){
    container.innerHTML='<p class="table-empty">회원 상태 데이터가 없습니다.</p>';
    return;
  }

  unique.forEach(key=>{
    const count=statusMap.get(key)||0;
    const row=document.createElement('div');
    row.className='status-row';
    const strong=document.createElement('strong');
    strong.textContent=labels[key]||key;
    const value=document.createElement('span');
    value.textContent=`${count}명 · ${Math.round(count/total*100)}%`;
    const track=document.createElement('div');
    track.className='status-track';
    const fill=document.createElement('div');
    fill.className='status-fill';
    fill.style.width=`${count/total*100}%`;
    track.appendChild(fill);
    row.append(strong,value,track);
    container.appendChild(row);
  });
}

function applyFilters(){
  const keyword=String(searchInput?.value||'').trim().toLowerCase();
  const period=String(dateFilter?.value||'all');
  const threshold=period==='all'?null:daysAgo(Number(period)-1);

  filteredUsers=users.filter(user=>{
    const text=`${user.displayName||''} ${user.email||''}`.toLowerCase();
    if(keyword&&!text.includes(keyword))return false;
    if(threshold){
      const created=userCreatedAt(user);
      if(!created||created<threshold)return false;
    }
    return true;
  });
  renderTable();
}

function renderTable(){
  rowsEl.innerHTML='';
  if(!filteredUsers.length){
    const row=document.createElement('tr');
    const cell=document.createElement('td');
    cell.colSpan=5;
    cell.className='table-empty';
    cell.textContent='조건에 맞는 회원이 없습니다.';
    row.appendChild(cell);
    rowsEl.appendChild(row);
  }else{
    filteredUsers.forEach(user=>{
      const row=document.createElement('tr');
      const memberCell=document.createElement('td');
      const member=document.createElement('div');
      member.className='member-cell';
      const avatar=document.createElement('span');
      avatar.className='member-avatar';
      avatar.textContent=initial(user.displayName,user.email);
      const nameWrap=document.createElement('div');
      const name=document.createElement('strong');
      name.textContent=user.displayName||user.email?.split('@')[0]||'회원';
      const role=document.createElement('small');
      role.textContent=user.role||'member';
      nameWrap.append(name,role);
      member.append(avatar,nameWrap);
      memberCell.appendChild(member);

      const email=document.createElement('td');
      email.textContent=user.email||'—';
      const joined=document.createElement('td');
      joined.textContent=dateText(userCreatedAt(user));
      const login=document.createElement('td');
      login.textContent=dateText(userLastLogin(user),true);
      const status=document.createElement('td');
      const badge=document.createElement('span');
      const statusValue=user.status||'active';
      badge.className=`status-badge${statusValue==='suspended'?' is-suspended':''}`;
      badge.textContent=statusValue;
      status.appendChild(badge);

      row.append(memberCell,email,joined,login,status);
      rowsEl.appendChild(row);
    });
  }
  document.querySelector('[data-filtered-count]').textContent=`${filteredUsers.length.toLocaleString('ko-KR')}명 표시`;
}

function renderAll(){
  updateMetrics();
  renderGrowth();
  renderStatuses();
  applyFilters();
}

async function loadUsers(force=false){
  if(loading&&!force)return;
  loading=true;
  errorBox.hidden=true;
  setConnection('회원 데이터 불러오는 중');
  const refresh=document.querySelector('[data-refresh]');
  refresh.disabled=true;
  refresh.textContent='불러오는 중...';

  try{
    const snapshot=await getDocs(collection(db,'users'));
    users=snapshot.docs.map(documentSnapshot=>({id:documentSnapshot.id,...documentSnapshot.data()}));
    users.sort((a,b)=>(userCreatedAt(b)?.getTime()||0)-(userCreatedAt(a)?.getTime()||0));
    renderAll();
    setConnection(`Firebase 연결됨 · ${users.length}명`,'online');
  }catch(error){
    console.error('Admin user load failed',error);
    users=[];
    filteredUsers=[];
    renderAll();
    setConnection('Firebase 권한 확인 필요','error');
    errorBox.hidden=false;
    const code=error?.code||'';
    errorMessage.textContent=code.includes('permission-denied')
      ?'Firestore 보안 규칙에서 users 컬렉션 조회가 차단되어 있습니다. 코드 입력 화면은 정상이며, 실제 회원 목록을 표시하려면 관리자용 서버 또는 Firestore 관리자 읽기 권한 연결이 필요합니다.'
      :'Firebase 연결 상태와 users 컬렉션을 확인해 주세요.';
  }finally{
    loading=false;
    refresh.disabled=false;
    refresh.textContent='새로고침';
  }
}

searchInput?.addEventListener('input',applyFilters);
dateFilter?.addEventListener('change',applyFilters);

document.querySelector('[data-export-csv]')?.addEventListener('click',()=>{
  const headers=['이름','이메일','가입일','최근 로그인','역할','상태'];
  const lines=[headers,...filteredUsers.map(user=>[
    user.displayName||'',
    user.email||'',
    dateText(userCreatedAt(user),true),
    dateText(userLastLogin(user),true),
    user.role||'member',
    user.status||'active'
  ])];
  const csv='\ufeff'+lines.map(columns=>columns.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');
  link.href=url;
  link.download=`aesost-members-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

document.querySelectorAll('.sidebar-nav a').forEach(link=>link.addEventListener('click',()=>{
  document.querySelectorAll('.sidebar-nav a').forEach(item=>item.classList.remove('is-active'));
  link.classList.add('is-active');
}));

try{
  const session=JSON.parse(sessionStorage.getItem(SESSION_KEY)||'null');
  if(session?.openedAt&&Date.now()-session.openedAt<8*60*60*1000)showDashboard();
}catch{}
