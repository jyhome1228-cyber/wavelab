import { auth } from '../firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

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
  await import('./admin-owner-dashboard.js?v=20260804-1');
});
