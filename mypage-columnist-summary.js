import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { collection, doc, getDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

function escapeHtml(value=''){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function formatDate(timestamp){
  const date=timestamp?.toDate?.();
  if(!date)return '활동 시작일 확인 중';
  return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'long',day:'numeric'}).format(date);
}
function installStyles(){
  if(document.querySelector('[data-columnist-summary-style]'))return;
  const style=document.createElement('style');
  style.dataset.columnistSummaryStyle='';
  style.textContent=`
    .columnist-summary{display:grid;gap:22px;text-align:left}
    .columnist-summary-head{display:flex;justify-content:space-between;gap:24px;align-items:flex-start}
    .columnist-summary-badge{display:inline-flex;padding:7px 10px;border-radius:999px;background:rgba(59,91,255,.14);color:#8fa1ff;font-size:10px;font-weight:800;letter-spacing:.09em}
    .columnist-summary h3{margin:12px 0 0;font-size:24px;letter-spacing:-.04em}
    .columnist-summary p{margin:8px 0 0;color:#929299;font-size:13px;line-height:1.7}
    .columnist-summary-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
    .columnist-summary-stat{padding:18px;border:1px solid #343438;border-radius:12px;background:#242428}
    .columnist-summary-stat span{display:block;color:#7f7f86;font-size:10px}
    .columnist-summary-stat strong{display:block;margin-top:9px;font-size:20px}
    .columnist-summary-note{padding:16px 18px;border-radius:12px;background:#171719;color:#9c9ca3;font-size:12px;line-height:1.7}
    @media(max-width:760px){.columnist-summary-head{display:grid}.columnist-summary-stats{grid-template-columns:1fr 1fr}.columnist-summary-stat{padding:15px}}
  `;
  document.head.appendChild(style);
}
function setRoleLabel(profile){
  const role=document.querySelector('.mypage-side > small');
  if(!role)return;
  role.textContent=profile.status==='major'?'WAVELAB MAJOR COLUMNIST':'WAVELAB COLUMNIST';
}
function renderSummary(profile,columns,application){
  const state=document.querySelector('[data-columnist-state]');
  const actions=document.querySelector('[data-column-actions]');
  if(!state)return;
  const active=['approved','major'].includes(profile.status);
  if(!active)return;
  installStyles();
  setRoleLabel(profile);
  const published=columns.filter(item=>item.status==='published').length;
  const draft=columns.filter(item=>item.status==='draft').length;
  const review=columns.filter(item=>item.status==='review').length;
  const startedAt=profile.approvedAt||profile.createdAt||application?.createdAt;
  const major=profile.status==='major';
  state.innerHTML=`<div class="columnist-summary"><div class="columnist-summary-head"><div><span class="columnist-summary-badge">${major?'MAJOR COLUMNIST':'WAVELAB COLUMNIST'}</span><h3>${escapeHtml(profile.penName||'칼럼니스트')}님이 활동 중입니다.</h3><p>${formatDate(startedAt)}부터 웨이블랩에서 자신의 경험과 관점을 기록하고 있습니다.</p></div></div><div class="columnist-summary-stats"><div class="columnist-summary-stat"><span>활동 시작</span><strong>${formatDate(startedAt).replace('년 ','·').replace('월 ','·').replace('일','')}</strong></div><div class="columnist-summary-stat"><span>전체 칼럼</span><strong>${columns.length}개</strong></div><div class="columnist-summary-stat"><span>공개된 글</span><strong>${published}개</strong></div><div class="columnist-summary-stat"><span>작성 중</span><strong>${draft+review}개</strong></div></div><div class="columnist-summary-note">${major?'꾸준히 좋은 글을 작성해 메이저 칼럼니스트로 선정되었습니다.':'좋은 글을 꾸준히 작성하고 독자에게 유용한 관점을 제공하는 칼럼니스트는 운영진 검토를 통해 메이저 칼럼니스트로 선정될 수 있습니다.'}</div></div>`;
  if(actions)actions.hidden=false;
}

onAuthStateChanged(auth,async user=>{
  if(!user||!document.body.classList.contains('mypage-page'))return;
  try{
    const [profileSnap,applicationSnap,columnSnap]=await Promise.all([
      getDoc(doc(db,'columnistProfiles',user.uid)),
      getDoc(doc(db,'columnistApplications',user.uid)),
      getDocs(query(collection(db,'columns'),where('authorUid','==',user.uid)))
    ]);
    if(!profileSnap.exists())return;
    const profile=profileSnap.data();
    const columns=columnSnap.docs.map(item=>({id:item.id,...item.data()}));
    const application=applicationSnap.exists()?applicationSnap.data():null;
    setTimeout(()=>renderSummary(profile,columns,application),120);
  }catch(error){console.warn('Columnist summary failed',error.code)}
});