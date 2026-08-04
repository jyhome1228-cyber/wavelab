import { auth, db } from './firebase-config.js';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const authNotice=document.querySelector('[data-auth-notice]');
const loginForm=document.querySelector('[data-login-form]');
const signupForm=document.querySelector('[data-signup-form]');
const resetPassword=document.querySelector('[data-reset-password]');
const googleLoginButtons=[...document.querySelectorAll('[data-google-login]')];

function setNotice(message,type=''){if(!authNotice)return;authNotice.textContent=message;authNotice.dataset.state=type}
function getNextUrl(){return new URLSearchParams(location.search).get('next')||'index.html'}

function ensureAuthPopup(){
  let popup=document.querySelector('[data-auth-popup]');
  if(popup)return popup;
  const style=document.createElement('style');
  style.textContent=`
    .auth-popup{position:fixed;inset:0;z-index:300;display:none;place-items:center;padding:20px;background:rgba(8,8,10,.76);backdrop-filter:blur(10px)}
    .auth-popup.is-open{display:grid}
    .auth-popup-card{width:min(100%,420px);padding:30px;border:1px solid #3a3a40;border-radius:20px;background:#202023;box-shadow:0 24px 80px rgba(0,0,0,.45);text-align:center}
    .auth-popup-icon{display:grid;place-items:center;width:52px;height:52px;margin:0 auto 20px;border-radius:50%;background:#3b5bff;color:#fff;font-size:22px}
    .auth-popup-card h2{margin:0;font-size:22px;letter-spacing:-.04em}
    .auth-popup-card p{margin:12px 0 24px;color:#aaaab1;font-size:14px;line-height:1.7;white-space:pre-line}
    .auth-popup-card button{width:100%;height:46px;border:0;border-radius:10px;background:#3b5bff;color:#fff;font-size:13px;font-weight:800;cursor:pointer}
  `;
  document.head.appendChild(style);
  popup=document.createElement('div');
  popup.className='auth-popup';
  popup.dataset.authPopup='';
  popup.innerHTML='<div class="auth-popup-card" role="alertdialog" aria-modal="true" aria-labelledby="auth-popup-title"><div class="auth-popup-icon">✦</div><h2 id="auth-popup-title" data-auth-popup-title>로그인을 확인해 주세요.</h2><p data-auth-popup-message></p><button type="button" data-auth-popup-close>확인</button></div>';
  document.body.appendChild(popup);
  const close=()=>{popup.classList.remove('is-open');document.body.style.overflow=''};
  popup.querySelector('[data-auth-popup-close]').addEventListener('click',close);
  popup.addEventListener('click',event=>{if(event.target===popup)close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&popup.classList.contains('is-open'))close()});
  return popup;
}

function showAuthPopup(title,message){
  const popup=ensureAuthPopup();
  popup.querySelector('[data-auth-popup-title]').textContent=title;
  popup.querySelector('[data-auth-popup-message]').textContent=message;
  popup.classList.add('is-open');
  document.body.style.overflow='hidden';
  setTimeout(()=>popup.querySelector('[data-auth-popup-close]')?.focus(),30);
}

function loginErrorDetail(error){
  const messages={
    'auth/invalid-email':{title:'이메일 주소를 확인해 주세요.',message:'이메일 형식이 올바르지 않습니다.'},
    'auth/missing-email':{title:'이메일을 입력해 주세요.',message:'가입할 때 사용한 이메일 주소를 입력해 주세요.'},
    'auth/missing-password':{title:'비밀번호를 입력해 주세요.',message:'비밀번호 입력란이 비어 있습니다.'},
    'auth/user-not-found':{title:'가입되지 않은 이메일입니다.',message:'입력한 이메일로 가입된 계정을 찾을 수 없습니다.'},
    'auth/wrong-password':{title:'비밀번호가 올바르지 않습니다.',message:'비밀번호를 다시 확인해 주세요.'},
    'auth/invalid-credential':{title:'로그인 정보를 확인해 주세요.',message:'이메일 또는 비밀번호가 올바르지 않습니다.\n보안을 위해 어떤 항목이 틀렸는지는 별도로 표시되지 않을 수 있습니다.'},
    'auth/user-disabled':{title:'사용할 수 없는 계정입니다.',message:'계정이 비활성화되어 있습니다. 관리자에게 문의해 주세요.'},
    'auth/too-many-requests':{title:'로그인 시도가 너무 많습니다.',message:'잠시 후 다시 시도하거나 비밀번호 재설정을 이용해 주세요.'},
    'auth/network-request-failed':{title:'네트워크 연결을 확인해 주세요.',message:'인터넷 연결 상태를 확인한 뒤 다시 시도해 주세요.'},
    'auth/operation-not-allowed':{title:'로그인을 사용할 수 없습니다.',message:'현재 로그인 설정에 문제가 있습니다. 관리자에게 문의해 주세요.'}
  };
  return messages[error.code]||{title:'로그인에 실패했습니다.',message:'이메일과 비밀번호를 확인한 뒤 다시 시도해 주세요.'};
}

function authErrorMessage(error,mode='auth'){
  if(mode==='login')return loginErrorDetail(error).message.replace('\n',' ');
  const messages={'auth/email-already-in-use':'이미 가입된 이메일입니다.','auth/invalid-email':'올바른 이메일 주소를 입력해 주세요.','auth/missing-password':'비밀번호를 입력해 주세요.','auth/weak-password':'비밀번호는 6자 이상 입력해 주세요.','auth/too-many-requests':'요청이 많습니다. 잠시 후 다시 시도해 주세요.','auth/network-request-failed':'네트워크 연결을 확인해 주세요.','auth/operation-not-allowed':'Firebase 콘솔에서 이메일/비밀번호 로그인을 활성화해 주세요.'};
  return messages[error.code]||'인증 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}
function setLoading(form,loading){if(!form)return;const button=form.querySelector('button[type="submit"]');if(!button)return;if(!button.dataset.label)button.dataset.label=button.textContent;button.disabled=loading;button.textContent=loading?'처리 중...':button.dataset.label}

async function syncUserProfile(user){
  if(!user)return;
  try{
    const ref=doc(db,'users',user.uid);
    const snap=await getDoc(ref);
    const profile={uid:user.uid,displayName:user.displayName||user.email?.split('@')[0]||'회원',email:user.email||'',photoURL:user.photoURL||'',updatedAt:serverTimestamp(),lastLoginAt:serverTimestamp()};
    if(snap.exists())await setDoc(ref,profile,{merge:true});
    else await setDoc(ref,{...profile,role:'member',status:'active',createdAt:serverTimestamp()});
  }catch(error){console.warn('User profile sync failed',error.code)}
}

const googleProvider=new GoogleAuthProvider();
googleProvider.setCustomParameters({prompt:'select_account'});

function googleLoginErrorDetail(error){
  const messages={
    'auth/popup-closed-by-user':{title:'Google 로그인이 취소되었습니다.',message:'계정 선택 창을 닫았습니다. 다시 시도해 주세요.'},
    'auth/popup-blocked':{title:'팝업이 차단되었습니다.',message:'브라우저에서 aesost.com의 팝업을 허용한 뒤 다시 시도해 주세요.'},
    'auth/cancelled-popup-request':{title:'로그인 요청이 취소되었습니다.',message:'이미 다른 로그인 창이 열려 있습니다. 잠시 후 다시 시도해 주세요.'},
    'auth/network-request-failed':{title:'네트워크 연결을 확인해 주세요.',message:'인터넷 연결 상태를 확인한 뒤 다시 시도해 주세요.'},
    'auth/operation-not-allowed':{title:'Google 로그인을 사용할 수 없습니다.',message:'Firebase Authentication에서 Google 로그인 제공업체를 활성화해 주세요.'},
    'auth/unauthorized-domain':{title:'승인되지 않은 도메인입니다.',message:'Firebase Authentication 승인 도메인에 aesost.com과 www.aesost.com을 추가해 주세요.'},
    'auth/account-exists-with-different-credential':{title:'이미 가입된 이메일입니다.',message:'같은 이메일로 만든 기존 로그인 방식으로 먼저 로그인해 주세요.'},
    'auth/user-disabled':{title:'사용할 수 없는 계정입니다.',message:'계정이 비활성화되어 있습니다. 관리자에게 문의해 주세요.'},
    'auth/too-many-requests':{title:'로그인 요청이 너무 많습니다.',message:'잠시 후 다시 시도해 주세요.'}
  };
  return messages[error.code]||{title:'Google 로그인에 실패했습니다.',message:'잠시 후 다시 시도해 주세요.'};
}

function setGoogleLoading(loading){
  googleLoginButtons.forEach(button=>{
    if(!button.dataset.label)button.dataset.label=button.textContent.trim();
    button.disabled=loading;
    button.classList.toggle('is-loading',loading);
    const label=button.querySelector('[data-google-label]');
    if(label)label.textContent=loading?'Google 로그인 중...':button.dataset.label;
    else button.textContent=loading?'Google 로그인 중...':button.dataset.label;
  });
}

async function signInWithGoogle(){
  if(!googleLoginButtons.length)return;
  setGoogleLoading(true);
  setNotice('Google 계정으로 로그인 중입니다.');
  try{
    await setPersistence(auth,browserLocalPersistence);
    const credential=await signInWithPopup(auth,googleProvider);
    await syncUserProfile(credential.user);
    setNotice('Google 계정으로 로그인되었습니다.','success');
    location.href=getNextUrl();
  }catch(error){
    const detail=googleLoginErrorDetail(error);
    setNotice(detail.message,'error');
    if(error.code!=='auth/popup-closed-by-user')showAuthPopup(detail.title,detail.message);
  }finally{
    setGoogleLoading(false);
  }
}

googleLoginButtons.forEach(button=>button.addEventListener('click',signInWithGoogle));

loginForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  const data=new FormData(loginForm);const email=String(data.get('email')||'').trim();const password=String(data.get('password')||'');const remember=data.get('remember')==='on';
  const emailInput=loginForm.querySelector('input[name="email"]');
  const passwordInput=loginForm.querySelector('input[name="password"]');
  if(!email){showAuthPopup('이메일을 입력해 주세요.','가입할 때 사용한 이메일 주소를 입력해 주세요.');emailInput?.focus();return}
  if(!/^\S+@\S+\.\S+$/.test(email)){showAuthPopup('이메일 주소를 확인해 주세요.','예: name@example.com 형식으로 입력해 주세요.');emailInput?.focus();return}
  if(!password){showAuthPopup('비밀번호를 입력해 주세요.','비밀번호 입력란이 비어 있습니다.');passwordInput?.focus();return}
  setLoading(loginForm,true);setNotice('로그인 중입니다.');
  try{await setPersistence(auth,remember?browserLocalPersistence:browserSessionPersistence);const credential=await signInWithEmailAndPassword(auth,email,password);await syncUserProfile(credential.user);setNotice('로그인되었습니다.','success');location.href=getNextUrl()}
  catch(error){const detail=loginErrorDetail(error);setNotice(detail.message.replace('\n',' '),'error');showAuthPopup(detail.title,detail.message);if(error.code==='auth/invalid-email'||error.code==='auth/user-not-found')emailInput?.focus();else passwordInput?.focus()}
  finally{setLoading(loginForm,false)}
});

signupForm?.addEventListener('submit',async event=>{
  event.preventDefault();setLoading(signupForm,true);setNotice('회원가입을 처리하고 있습니다.');
  const data=new FormData(signupForm);const name=String(data.get('name')||'').trim();const email=String(data.get('email')||'').trim();const password=String(data.get('password')||'');
  try{await setPersistence(auth,browserLocalPersistence);const credential=await createUserWithEmailAndPassword(auth,email,password);if(name)await updateProfile(credential.user,{displayName:name});await syncUserProfile(credential.user);setNotice('회원가입이 완료되었습니다.','success');location.href=getNextUrl()}
  catch(error){const message=authErrorMessage(error);setNotice(message,'error');showAuthPopup('회원가입을 완료하지 못했습니다.',message)}
  finally{setLoading(signupForm,false)}
});

resetPassword?.addEventListener('click',async event=>{event.preventDefault();const input=loginForm?.querySelector('input[name="email"]');const email=input?.value.trim();if(!email){const message='비밀번호 재설정 메일을 받을 이메일을 먼저 입력해 주세요.';setNotice(message,'error');showAuthPopup('이메일을 입력해 주세요.',message);input?.focus();return}try{await sendPasswordResetEmail(auth,email);setNotice('비밀번호 재설정 메일을 보냈습니다.','success');showAuthPopup('재설정 메일을 보냈습니다.','받은편지함과 스팸함을 확인해 주세요.')}catch(error){const message=authErrorMessage(error);setNotice(message,'error');showAuthPopup('메일을 보내지 못했습니다.',message)}});

function toggleAuthLinks(user){const loginLinks=document.querySelectorAll('[data-auth-login], [data-mobile-login]');const mypageLinks=document.querySelectorAll('[data-auth-mypage], [data-mobile-mypage]');const logoutLinks=document.querySelectorAll('[data-auth-logout], [data-mobile-logout]');loginLinks.forEach(link=>{link.hidden=Boolean(user)});mypageLinks.forEach(link=>{link.hidden=!user;if(user)link.title=user.displayName||user.email||'마이페이지'});logoutLinks.forEach(link=>{link.hidden=!user})}
function savedKey(uid){return `wavelab:saved:${uid}`}
function readSaved(uid){try{return JSON.parse(localStorage.getItem(savedKey(uid))||'[]')}catch{return []}}
function writeSaved(uid,items){localStorage.setItem(savedKey(uid),JSON.stringify(items));window.dispatchEvent(new CustomEvent('wavelab:saved-updated',{detail:items}))}
function installBookmarkButtons(user){document.querySelectorAll('.bookmark-button').forEach(button=>button.remove());if(!user)return;const cards=document.querySelectorAll('.card, .study-card');const saved=readSaved(user.uid);cards.forEach(card=>{if(card.classList.contains('member-locked'))return;const title=card.querySelector('h2, h3')?.textContent?.trim();const href=card.dataset.originalHref||card.getAttribute('href')||'#';if(!title||!href||href==='#')return;const category=card.dataset.category||card.querySelector('.label')?.textContent?.trim()||'CONTENT';const id=`${href}|${title}`;const button=document.createElement('button');button.type='button';button.className='bookmark-button';button.setAttribute('aria-label','콘텐츠 저장');button.textContent=saved.some(item=>item.id===id)?'★':'☆';button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const current=readSaved(user.uid);const exists=current.some(item=>item.id===id);const next=exists?current.filter(item=>item.id!==id):[{id,title,href,category,savedAt:Date.now()},...current];writeSaved(user.uid,next);button.textContent=exists?'☆':'★'});card.querySelector('.thumb, .real-thumb')?.appendChild(button)})}

document.addEventListener('click',async event=>{const logout=event.target.closest('[data-auth-logout], [data-mobile-logout]');if(!logout)return;event.preventDefault();await signOut(auth);location.href='index.html'});

onAuthStateChanged(auth,async user=>{window.AESOST_AUTH_USER=user;window.WAVELAB_AUTH_USER=user;toggleAuthLinks(user);window.applyMemberAccess?.(user);installBookmarkButtons(user);if(user)await syncUserProfile(user);if(document.body.classList.contains('auth-page')&&user)setNotice(`${user.displayName||user.email||'회원'} 계정으로 로그인되어 있습니다.`,'success')});