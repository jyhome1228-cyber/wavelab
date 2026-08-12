import { db } from './firebase-config.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const VISITOR_ID_KEY='aesost_visitor_id_v1';
const VISITOR_DAY_KEY='aesost_visitor_day_v1';
const SEO_BOT_PATTERN=/bot|crawler|spider|slurp|bingpreview|yeti|google-inspectiontool/i;
const PRIVATE_PATHS=new Set([
  '/login.html',
  '/mypage.html',
  '/my-references.html',
  '/ability-edit.html',
  '/column-write.html',
  '/notice-write.html',
  '/community-write.html',
  '/career-consulting-request.html',
  '/editorial-review.html'
]);

function isTrackablePage(){
  const path=location.pathname||'/';
  if(path.startsWith('/admin/'))return false;
  if(PRIVATE_PATHS.has(path))return false;
  if(navigator.doNotTrack==='1')return false;
  if(SEO_BOT_PATTERN.test(navigator.userAgent||''))return false;
  return true;
}

function seoulDateKey(date=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(date);
  const map=Object.fromEntries(parts.map(part=>[part.type,part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function makeVisitorId(){
  if(globalThis.crypto?.randomUUID)return globalThis.crypto.randomUUID();
  const bytes=new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  return [...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('')||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getVisitorId(){
  try{
    let value=localStorage.getItem(VISITOR_ID_KEY);
    if(!value){value=makeVisitorId();localStorage.setItem(VISITOR_ID_KEY,value)}
    return value;
  }catch(error){
    return makeVisitorId();
  }
}

function getSavedDay(){
  try{return localStorage.getItem(VISITOR_DAY_KEY)||''}catch(error){return ''}
}

function saveDay(dateKey){
  try{localStorage.setItem(VISITOR_DAY_KEY,dateKey)}catch(error){}
}

function referrerHost(){
  if(!document.referrer)return '';
  try{
    const url=new URL(document.referrer);
    return url.hostname===location.hostname?'internal':url.hostname.slice(0,160);
  }catch(error){return ''}
}

async function recordDailyVisit(){
  if(!isTrackablePage())return;
  const date=seoulDateKey();
  if(getSavedDay()===date)return;

  const visitorId=getVisitorId();
  const visitId=`${date}_${visitorId}`;
  const visitRef=doc(db,'visitorVisits',visitId);

  try{
    const existing=await getDoc(visitRef);
    if(existing.exists()){
      saveDay(date);
      return;
    }
    await setDoc(visitRef,{
      visitorId,
      date,
      visitedAt:serverTimestamp(),
      firstPath:(location.pathname||'/').slice(0,180),
      referrer:referrerHost()
    });
    saveDay(date);
  }catch(error){
    console.debug('AESOST visitor analytics unavailable',error?.code||error?.message||error);
  }
}

recordDailyVisit();
