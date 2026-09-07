import { auth, db } from '../firebase-config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const ADMIN_EMAIL='planus253@naver.com';
let users=[];let filteredUsers=[];let loading=false;
const $=selector=>document.querySelector(selector);

function toDate(value){if(!value)return null;if(typeof value.toDate==='function')return value.toDate();if(value instanceof Date)return value;if(typeof value==='number')return new Date(value);if(typeof value==='string'){const parsed=new Date(value);return Number.isNaN(parsed.getTime())?null:parsed}if(typeof value.seconds==='number')return new Date(value.seconds*1000);return null}
function dateText(value,withTime=false){const date=toDate(value);if(!date)return '—';return new Intl.DateTimeFormat('ko-KR',withTime?{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}:{year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
function startOfDay(date=new Date()){const next=new Date(date);next.setHours(0,0,0,0);return next}
function daysAgo(days){const date=startOfDay();date.setDate(date.getDate()-days);return date}
function userCreatedAt(user){return toDate(user.createdAt)||toDate(user.signupAt)||null}
function userLastLogin(user){return toDate(user.lastLoginAt)||toDate(user.updatedAt)||null}
function initial(name,email){return String(name||email||'A').trim().charAt(0).toUpperCase()}

function updateMetrics(){
  const sevenDays=daysAgo(6),thirtyDays=daysAgo(29),today=startOfDay();
  const newUsers=users.filter(user=>{const date=userCreatedAt(user);return date&&date>=sevenDays}).length;
  const activeUsers=users.filter(user=>{const date=userLastLogin(user);return date&&date>=thirtyDays}).length;
  const todayUsers=users.filter(user=>{const date=userLastLogin(user);return date&&date>=today}).length;
  const map=[['[data-total-users]',users.length],['[data-new-users]',newUsers],['[data-active-users]',activeUsers],['[data-today-users]',todayUsers],['[data-dashboard-members]',users.length]];
  map.forEach(([selector,value])=>{const el=$(selector);if(el)el.textContent=value.toLocaleString('ko-KR')});
}
function renderGrowth(){
  const chart=$('[data-growth-chart]'),summary=$('[data-growth-summary]');if(!chart)return;
  const days=[];for(let index=13;index>=0;index-=1){const date=startOfDay();date.setDate(date.getDate()-index);const next=new Date(date);next.setDate(next.getDate()+1);const count=users.filter(user=>{const created=userCreatedAt(user);return created&&created>=date&&created<next}).length;days.push({date,count})}
  const max=Math.max(1,...days.map(day=>day.count));chart.innerHTML='';
  days.forEach(day=>{const item=document.createElement('div');item.className='growth-day';const wrap=document.createElement('div');wrap.className='growth-bar-wrap';const bar=document.createElement('div');bar.className='growth-bar';bar.style.height=`${Math.max(day.count?8:2,(day.count/max)*100)}%`;const value=document.createElement('span');value.className='growth-value';value.textContent=String(day.count);const label=document.createElement('span');label.className='growth-label';label.textContent=`${day.date.getMonth()+1}/${day.date.getDate()}`;wrap.appendChild(bar);item.append(wrap,value,label);chart.appendChild(item)});
  if(summary)summary.textContent=`최근 14일 신규 가입 ${days.reduce((sum,day)=>sum+day.count,0).toLocaleString('ko-KR')}명`;
}
function renderStatuses(){
  const container=$('[data-status-overview]');if(!container)return;const total=Math.max(users.length,1);const map=new Map();users.forEach(user=>{const status=String(user.status||'active').toLowerCase();map.set(status,(map.get(status)||0)+1)});const labels={active:'활성 회원',suspended:'정지 회원',inactive:'비활성 회원'};const keys=[...new Set(['active','suspended','inactive',...map.keys()])].filter(key=>map.has(key));container.innerHTML='';if(!keys.length){container.innerHTML='<div class="empty-state compact"><strong>회원 상태 데이터가 없습니다.</strong></div>';return}
  keys.forEach(key=>{const count=map.get(key)||0;const row=document.createElement('div');row.className='status-row';row.innerHTML=`<strong>${labels[key]||key}</strong><span>${count}명 · ${Math.round(count/total*100)}%</span><div class="status-track"><div class="status-fill" style="width:${count/total*100}%"></div></div>`;container.appendChild(row)})
}
function applyFilters(){
  const keyword=String($('[data-member-search]')?.value||'').trim().toLowerCase();const period=String($('[data-date-filter]')?.value||'all');const threshold=period==='all'?null:daysAgo(Number(period)-1);
  filteredUsers=users.filter(user=>{const text=`${user.displayName||''} ${user.email||''}`.toLowerCase();if(keyword&&!text.includes(keyword))return false;if(threshold){const created=userCreatedAt(user);if(!created||created<threshold)return false}return true});renderTable();
}
function renderTable(){
  const rows=$('[data-member-rows]');if(!rows)return;rows.innerHTML='';
  if(!filteredUsers.length)rows.innerHTML='<tr><td colspan="5"><div class="empty-state"><strong>조건에 맞는 회원이 없습니다.</strong></div></td></tr>';
  else filteredUsers.forEach(user=>{const row=document.createElement('tr');const statusValue=user.status||'active';row.innerHTML=`<td><div class="member-cell"><span class="member-avatar">${initial(user.displayName,user.email)}</span><div><strong>${user.displayName||user.email?.split('@')[0]||'회원'}</strong><small>${user.role||'member'}</small></div></div></td><td>${user.email||'—'}</td><td>${dateText(userCreatedAt(user))}</td><td>${dateText(userLastLogin(user),true)}</td><td><span class="status-badge${statusValue==='suspended'?' is-suspended':''}">${statusValue}</span></td>`;rows.appendChild(row)});
  const count=$('[data-filtered-count]');if(count)count.textContent=`${filteredUsers.length.toLocaleString('ko-KR')}명 표시`;
}
function renderAll(){updateMetrics();renderGrowth();renderStatuses();applyFilters()}

async function loadUsers(){
  if(loading)return;const user=auth.currentUser;if(!user||String(user.email||'').toLowerCase()!==ADMIN_EMAIL)return;loading=true;
  try{const snapshot=await getDocs(collection(db,'users'));users=snapshot.docs.map(item=>({id:item.id,...item.data()}));users.sort((a,b)=>(userCreatedAt(b)?.getTime()||0)-(userCreatedAt(a)?.getTime()||0));renderAll()}
  catch(error){console.error('Admin user load failed',error);users=[];filteredUsers=[];renderAll();const box=$('[data-admin-error]'),message=$('[data-admin-error-message]');if(box)box.hidden=false;if(message)message.textContent='회원 데이터를 불러오지 못했습니다.'}
  finally{loading=false}
}

$('[data-member-search]')?.addEventListener('input',applyFilters);$('[data-date-filter]')?.addEventListener('change',applyFilters);
$('[data-export-csv]')?.addEventListener('click',()=>{const lines=[['이름','이메일','가입일','최근 로그인','역할','상태'],...filteredUsers.map(user=>[user.displayName||'',user.email||'',dateText(userCreatedAt(user),true),dateText(userLastLogin(user),true),user.role||'member',user.status||'active'])];const csv='\ufeff'+lines.map(columns=>columns.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=`aesost-members-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url)});
window.addEventListener('admin:refresh',loadUsers);
loadUsers();
