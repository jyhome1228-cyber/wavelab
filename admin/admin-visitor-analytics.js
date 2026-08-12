import { auth, db } from '../firebase-config.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const ADMIN_EMAIL='planus253@naver.com';
let visits=[];
let loading=false;

function seoulDateKey(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(date);
  const map=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}
function dateKeyOffset(days){return seoulDateKey(new Date(Date.now()+days*86400000))}
function uniqueCount(items){return new Set(items.map(item=>item.visitorId).filter(Boolean)).size}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}

function injectStyles(){
  if(document.querySelector('#aesost-visitor-admin-style'))return;
  const style=document.createElement('style');
  style.id='aesost-visitor-admin-style';
  style.textContent=`
    .visitor-metric-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-bottom:1px solid #2f2c34}
    .visitor-metric{padding:25px 24px;border-right:1px solid #2f2c34;background:linear-gradient(180deg,rgba(109,34,230,.08),transparent)}
    .visitor-metric:last-child{border-right:0}
    .visitor-metric span{display:block;color:#817b87;font-size:10px;font-weight:850;letter-spacing:.1em}
    .visitor-metric strong{display:block;margin:15px 0 7px;color:#f4f1f7;font-size:36px;line-height:1;letter-spacing:-.05em}
    .visitor-metric p{margin:0;color:#77717e;font-size:11px}
    .visitor-chart-wrap{padding:2px 0 0}
    .visitor-chart-title{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:19px 24px 0}
    .visitor-chart-title strong{font-size:12px;color:#d9d3df}
    .visitor-chart-title span{font-size:10px;color:#6f6975}
    .visitor-chart{display:grid;grid-template-columns:repeat(14,minmax(18px,1fr));align-items:end;gap:8px;height:220px;padding:22px 24px 20px}
    .visitor-day{display:flex;height:100%;flex-direction:column;justify-content:flex-end;align-items:center;gap:7px}
    .visitor-bar-wrap{display:flex;width:100%;height:145px;align-items:flex-end;justify-content:center}
    .visitor-bar{width:min(100%,28px);min-height:3px;border-radius:6px 6px 2px 2px;background:linear-gradient(180deg,#9f72f7,#6723dc);box-shadow:0 8px 20px rgba(109,34,230,.18)}
    .visitor-value{color:#dcd7e2;font-size:10px}
    .visitor-label{color:#625c68;font-size:9px}
    .visitor-note{margin:0;padding:0 24px 22px;color:#6e6874;font-size:10px;line-height:1.65}
    .visitor-error{color:#f1a1aa!important}
    @media(max-width:780px){.visitor-metric-grid{grid-template-columns:1fr}.visitor-metric{border-right:0;border-bottom:1px solid #2f2c34}.visitor-metric:last-child{border-bottom:0}.visitor-chart{overflow-x:auto;grid-template-columns:repeat(14,34px);justify-content:start;padding-left:16px;padding-right:16px}}
  `;
  document.head.appendChild(style);
}

function installUi(){
  if(document.querySelector('[data-visitor-analytics]'))return;
  injectStyles();

  const headerLabel=document.querySelector('.admin-header p');
  const headerTitle=document.querySelector('.admin-header h1');
  if(headerLabel)headerLabel.textContent='AESOST SITE ANALYTICS';
  if(headerTitle)headerTitle.textContent='사이트 현황 대시보드';

  const nav=document.querySelector('.sidebar-nav');
  if(nav){
    [...nav.querySelectorAll('a')].forEach((link,index)=>{
      const number=link.querySelector('span');
      if(number)number.textContent=String(index+2).padStart(2,'0');
    });
    const visitorLink=document.createElement('a');
    visitorLink.href='#visitors';
    visitorLink.innerHTML='<span>01</span>방문자';
    nav.prepend(visitorLink);
    nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
      nav.querySelectorAll('a').forEach(item=>item.classList.remove('is-active'));
      link.classList.add('is-active');
    }));
  }

  const overview=document.querySelector('#overview');
  if(!overview)return;
  const section=document.createElement('section');
  section.className='admin-section';
  section.id='visitors';
  section.dataset.visitorAnalytics='';
  section.innerHTML=`
    <article class="dashboard-panel visitor-panel">
      <div class="panel-head">
        <div><span>VISITOR ANALYTICS</span><h2>방문자 기록</h2></div>
        <p data-visitor-summary>Firebase 방문 기록을 불러오는 중입니다.</p>
      </div>
      <div class="visitor-metric-grid">
        <div class="visitor-metric"><span>TODAY</span><strong data-visitor-today>—</strong><p>오늘 순 방문자</p></div>
        <div class="visitor-metric"><span>LAST · 7 DAYS</span><strong data-visitor-week>—</strong><p>최근 7일 순 방문자</p></div>
        <div class="visitor-metric"><span>THIS MONTH</span><strong data-visitor-month>—</strong><p>이번 달 순 방문자</p></div>
      </div>
      <div class="visitor-chart-wrap">
        <div class="visitor-chart-title"><strong>최근 14일 방문 추이</strong><span>브라우저 기준 · 일 1회 집계</span></div>
        <div class="visitor-chart" data-visitor-chart></div>
        <p class="visitor-note">개인정보는 저장하지 않습니다. 익명 브라우저 ID, 날짜, 첫 방문 경로와 유입 도메인만 Firebase에 기록하며 검색봇은 제외합니다.</p>
      </div>
    </article>`;
  overview.before(section);
}

function setMetric(selector,value){
  const element=document.querySelector(selector);
  if(element)element.textContent=Number(value||0).toLocaleString('ko-KR');
}

function renderChart(){
  const chart=document.querySelector('[data-visitor-chart]');
  if(!chart)return;
  const days=[];
  for(let offset=-13;offset<=0;offset+=1){
    const date=dateKeyOffset(offset);
    const count=uniqueCount(visits.filter(visit=>visit.date===date));
    days.push({date,count});
  }
  const max=Math.max(1,...days.map(day=>day.count));
  chart.innerHTML='';
  days.forEach(day=>{
    const [year,month,date]=day.date.split('-');
    const item=document.createElement('div');item.className='visitor-day';
    const wrap=document.createElement('div');wrap.className='visitor-bar-wrap';
    const bar=document.createElement('div');bar.className='visitor-bar';bar.style.height=`${Math.max(day.count?8:2,(day.count/max)*100)}%`;bar.title=`${month}/${date} · ${day.count}명`;
    const value=document.createElement('span');value.className='visitor-value';value.textContent=String(day.count);
    const label=document.createElement('span');label.className='visitor-label';label.textContent=`${Number(month)}/${Number(date)}`;
    wrap.appendChild(bar);item.append(wrap,value,label);chart.appendChild(item);
  });
}

function render(){
  const today=seoulDateKey();
  const weekStart=dateKeyOffset(-6);
  const monthStart=`${today.slice(0,8)}01`;
  setMetric('[data-visitor-today]',uniqueCount(visits.filter(visit=>visit.date===today)));
  setMetric('[data-visitor-week]',uniqueCount(visits.filter(visit=>visit.date>=weekStart&&visit.date<=today)));
  setMetric('[data-visitor-month]',uniqueCount(visits.filter(visit=>visit.date>=monthStart&&visit.date<=today)));
  renderChart();
  const summary=document.querySelector('[data-visitor-summary]');
  if(summary){
    summary.classList.remove('visitor-error');
    summary.textContent=visits.length?'기록된 익명 방문 데이터를 기준으로 집계합니다.':'아직 방문 기록이 없습니다. 적용 이후부터 데이터가 쌓입니다.';
  }
}

async function loadVisits(){
  if(loading)return;
  const user=auth.currentUser;
  if(!user||String(user.email||'').toLowerCase()!==ADMIN_EMAIL)return;
  loading=true;
  const today=seoulDateKey();
  const monthStart=`${today.slice(0,8)}01`;
  const chartStart=dateKeyOffset(-13);
  const queryStart=monthStart<chartStart?monthStart:chartStart;
  const summary=document.querySelector('[data-visitor-summary]');
  if(summary){summary.classList.remove('visitor-error');summary.textContent='Firebase 방문 기록을 불러오는 중입니다.'}
  try{
    const snapshot=await getDocs(query(collection(db,'visitorVisits'),where('date','>=',queryStart)));
    visits=snapshot.docs.map(item=>({id:item.id,...item.data()}));
    render();
  }catch(error){
    console.error('Visitor analytics load failed',error);
    visits=[];
    render();
    if(summary){
      summary.classList.add('visitor-error');
      summary.textContent=String(error?.code||'').includes('permission-denied')?'Firestore visitorVisits 규칙을 게시해야 방문자 집계를 볼 수 있습니다.':'방문자 데이터를 불러오지 못했습니다.';
    }
  }finally{loading=false}
}

installUi();
loadVisits();
document.querySelector('[data-refresh]')?.addEventListener('click',loadVisits);
