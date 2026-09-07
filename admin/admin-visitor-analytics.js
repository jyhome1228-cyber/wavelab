import { auth, db } from '../firebase-config.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const ADMIN_EMAIL='planus253@naver.com';
let visits=[];let loading=false;
const $=selector=>document.querySelector(selector);

function seoulDateKey(date=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const map=Object.fromEntries(parts.map(part=>[part.type,part.value]));return `${map.year}-${map.month}-${map.day}`}
function dateKeyOffset(days){return seoulDateKey(new Date(Date.now()+days*86400000))}
function uniqueCount(items){return new Set(items.map(item=>item.visitorId).filter(Boolean)).size}
function setMetric(selector,value){const element=$(selector);if(element)element.textContent=Number(value||0).toLocaleString('ko-KR')}

function renderChart(){
  const chart=$('[data-visitor-chart]');if(!chart)return;const days=[];
  for(let offset=-13;offset<=0;offset+=1){const date=dateKeyOffset(offset);const count=uniqueCount(visits.filter(visit=>visit.date===date));days.push({date,count})}
  const max=Math.max(1,...days.map(day=>day.count));chart.innerHTML='';
  days.forEach(day=>{const [,month,date]=day.date.split('-');const item=document.createElement('div');item.className='visitor-day';const wrap=document.createElement('div');wrap.className='visitor-bar-wrap';const bar=document.createElement('div');bar.className='visitor-bar';bar.style.height=`${Math.max(day.count?8:2,(day.count/max)*100)}%`;const value=document.createElement('span');value.className='visitor-value';value.textContent=String(day.count);const label=document.createElement('span');label.className='visitor-label';label.textContent=`${Number(month)}/${Number(date)}`;wrap.appendChild(bar);item.append(wrap,value,label);chart.appendChild(item)});
}
function render(){
  const today=seoulDateKey(),weekStart=dateKeyOffset(-6),monthStart=`${today.slice(0,8)}01`;
  const todayCount=uniqueCount(visits.filter(visit=>visit.date===today));
  setMetric('[data-visitor-today]',todayCount);setMetric('[data-visitor-week]',uniqueCount(visits.filter(visit=>visit.date>=weekStart&&visit.date<=today)));setMetric('[data-visitor-month]',uniqueCount(visits.filter(visit=>visit.date>=monthStart&&visit.date<=today)));setMetric('[data-dashboard-visitors]',todayCount);renderChart();
  const summary=$('[data-visitor-summary]');if(summary)summary.textContent=visits.length?'익명 방문 기록을 기준으로 집계합니다.':'아직 방문 기록이 없습니다.';
}
async function loadVisits(){
  if(loading)return;const user=auth.currentUser;if(!user||String(user.email||'').toLowerCase()!==ADMIN_EMAIL)return;loading=true;
  const today=seoulDateKey(),monthStart=`${today.slice(0,8)}01`,chartStart=dateKeyOffset(-13),queryStart=monthStart<chartStart?monthStart:chartStart;
  try{const snapshot=await getDocs(query(collection(db,'visitorVisits'),where('date','>=',queryStart)));visits=snapshot.docs.map(item=>({id:item.id,...item.data()}));render()}
  catch(error){console.error('Visitor analytics load failed',error);visits=[];render();const summary=$('[data-visitor-summary]');if(summary)summary.textContent='방문자 데이터를 불러오지 못했습니다.'}
  finally{loading=false}
}
window.addEventListener('admin:refresh',loadVisits);loadVisits();
