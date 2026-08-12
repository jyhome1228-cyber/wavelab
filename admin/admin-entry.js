import { auth } from '../firebase-config.js';
import { getIdToken, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const ADMIN_EMAIL='planus253@naver.com';
const gateTitle=document.querySelector('[data-admin-gate-title]');
const gateMessage=document.querySelector('[data-admin-gate-message]');
const gateActions=document.querySelector('[data-admin-gate-actions]');
let booted=false;

function showDenied(email='현재 계정'){
  gateTitle.textContent='관리자 권한이 없습니다.';
  gateMessage.textContent=`${email} 계정은 관리자 대시보드에 접근할 수 없습니다.`;
  gateActions.hidden=false;
}

async function switchAccount(){
  await signOut(auth);
  location.replace('../login.html?next=admin/');
}

document.querySelector('[data-admin-switch-account]')?.addEventListener('click',switchAccount);

onAuthStateChanged(auth,async user=>{
  if(booted)return;
  if(!user){
    location.replace('../login.html?next=admin/');
    return;
  }

  if(String(user.email||'').toLowerCase()!==ADMIN_EMAIL){
    showDenied(user.email||'현재 계정');
    return;
  }

  booted=true;
  gateTitle.textContent='사이트 데이터 연결 중';
  gateMessage.textContent='관리자 인증 정보를 갱신하고 회원 및 방문자 데이터를 불러오고 있습니다.';
  gateActions.hidden=true;

  try{
    await getIdToken(user,true);
    await import('./admin-owner-dashboard.js?v=20260804-2');
    await import('./admin-visitor-analytics.js?v=20260812-1');
  }catch(error){
    console.error('Admin bootstrap failed',error);
    gateTitle.textContent='관리자 연결에 실패했습니다.';
    gateMessage.textContent='로그아웃 후 다시 로그인하거나 Firestore 규칙 게시 상태를 확인해 주세요.';
    gateActions.hidden=false;
  }
});
