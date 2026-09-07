import { auth } from '../firebase-config.js';
import { getIdToken, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const ADMIN_EMAIL='planus253@naver.com';
const gate=document.querySelector('[data-admin-gate]');
const app=document.querySelector('[data-admin-app]');
const gateTitle=document.querySelector('[data-admin-gate-title]');
const gateMessage=document.querySelector('[data-admin-gate-message]');
const gateActions=document.querySelector('[data-admin-gate-actions]');
let booted=false;

function showDenied(email='현재 계정'){
  if(gateTitle)gateTitle.textContent='관리자 권한이 없습니다.';
  if(gateMessage)gateMessage.textContent=`${email} 계정은 관리자 대시보드에 접근할 수 없습니다.`;
  if(gateActions)gateActions.hidden=false;
  if(app)app.hidden=true;
  if(gate)gate.hidden=false;
}
async function switchAccount(){await signOut(auth);location.replace('../login.html?next=admin/')}
document.querySelector('[data-admin-switch-account]')?.addEventListener('click',switchAccount);
document.querySelector('[data-admin-logout]')?.addEventListener('click',switchAccount);

onAuthStateChanged(auth,async user=>{
  if(booted)return;
  if(!user){location.replace('../login.html?next=admin/');return}
  if(String(user.email||'').toLowerCase()!==ADMIN_EMAIL){showDenied(user.email||'현재 계정');return}

  booted=true;
  if(gateTitle)gateTitle.textContent='운영 데이터 연결 중';
  if(gateMessage)gateMessage.textContent='프로젝트 문의, 방문자와 회원 데이터를 불러오고 있습니다.';
  if(gateActions)gateActions.hidden=true;

  try{
    await getIdToken(user,true);
    if(gate)gate.hidden=true;
    if(app)app.hidden=false;
    const account=document.querySelector('[data-admin-account]');if(account)account.textContent=user.email||'관리자';
    await import('./admin-business-dashboard.js?v=20260907-2');
    await import('./admin-visitor-analytics.js?v=20260907-2');
    await import('./admin-owner-dashboard.js?v=20260907-2');
  }catch(error){
    console.error('Admin bootstrap failed',error);
    if(app)app.hidden=true;
    if(gate)gate.hidden=false;
    if(gateTitle)gateTitle.textContent='관리자 연결에 실패했습니다.';
    if(gateMessage)gateMessage.textContent='로그아웃 후 다시 로그인하거나 Firebase 연결 상태를 확인해 주세요.';
    if(gateActions)gateActions.hidden=false;
  }
});
