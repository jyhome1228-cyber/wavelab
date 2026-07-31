import { auth, db } from './firebase-config.js';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { doc, getDoc, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const authNotice=document.querySelector('[data-auth-notice]');
const loginForm=document.querySelector('[data-login-form]');
const signupForm=document.querySelector('[data-signup-form]');
const resetPassword=document.querySelector('[data-reset-password]');

function setNotice(message,type=''){if(!authNotice)return;authNotice.textContent=message;authNotice.dataset.state=type}
function getNextUrl(){return new URLSearchParams(location.search).get('next')||'index.html'}
function authErrorMessage(error,mode='auth'){
  if(mode==='login'){
    const messages={'auth/invalid-email':'로그인에 실패했습니다. 올바른 이메일 주소를 입력해 주세요.','auth/invalid-credential':'로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해 주세요.','auth/user-disabled':'로그인에 실패했습니다. 사용할 수 없는 계정입니다.','auth/too-many-requests':'로그인에 실패했습니다. 시도가 많아 잠시 후 다시 이용해 주세요.','auth/network-request-failed':'로그인에 실패했습니다. 네트워크 연결을 확인해 주세요.','auth/operation-not-allowed':'로그인에 실패했습니다. 관리자에게 문의해 주세요.'};
    return messages[error.code]||'로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해 주세요.';
  }
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

loginForm?.addEventListener('submit',async event=>{
  event.preventDefault();setLoading(loginForm,true);setNotice('로그인 중입니다.');
  const data=new FormData(loginForm);const email=String(data.get('email')||'').trim();const password=String(data.get('password')||'');const remember=data.get('remember')==='on';
  try{await setPersistence(auth,remember?browserLocalPersistence:browserSessionPersistence);const credential=await signInWithEmailAndPassword(auth,email,password);await syncUserProfile(credential.user);setNotice('로그인되었습니다.','success');location.href=getNextUrl()}
  catch(error){setNotice(authErrorMessage(error,'login'),'error')}
  finally{setLoading(loginForm,false)}
});

signupForm?.addEventListener('submit',async event=>{
  event.preventDefault();setLoading(signupForm,true);setNotice('회원가입을 처리하고 있습니다.');
  const data=new FormData(signupForm);const name=String(data.get('name')||'').trim();const email=String(data.get('email')||'').trim();const password=String(data.get('password')||'');
  try{await setPersistence(auth,browserLocalPersistence);const credential=await createUserWithEmailAndPassword(auth,email,password);if(name)await updateProfile(credential.user,{displayName:name});await syncUserProfile(credential.user);setNotice('회원가입이 완료되었습니다.','success');location.href=getNextUrl()}
  catch(error){setNotice(authErrorMessage(error),'error')}
  finally{setLoading(signupForm,false)}
});

resetPassword?.addEventListener('click',async event=>{event.preventDefault();const input=loginForm?.querySelector('input[name="email"]');const email=input?.value.trim();if(!email){setNotice('비밀번호 재설정 메일을 받을 이메일을 먼저 입력해 주세요.','error');input?.focus();return}try{await sendPasswordResetEmail(auth,email);setNotice('비밀번호 재설정 메일을 보냈습니다.','success')}catch(error){setNotice(authErrorMessage(error),'error')}});

function toggleAuthLinks(user){const loginLinks=document.querySelectorAll('[data-auth-login], [data-mobile-login]');const mypageLinks=document.querySelectorAll('[data-auth-mypage], [data-mobile-mypage]');const logoutLinks=document.querySelectorAll('[data-auth-logout], [data-mobile-logout]');loginLinks.forEach(link=>{link.hidden=Boolean(user)});mypageLinks.forEach(link=>{link.hidden=!user;if(user)link.title=user.displayName||user.email||'마이페이지'});logoutLinks.forEach(link=>{link.hidden=!user})}
function savedKey(uid){return `wavelab:saved:${uid}`}
function readSaved(uid){try{return JSON.parse(localStorage.getItem(savedKey(uid))||'[]')}catch{return []}}
function writeSaved(uid,items){localStorage.setItem(savedKey(uid),JSON.stringify(items));window.dispatchEvent(new CustomEvent('wavelab:saved-updated',{detail:items}))}
function installBookmarkButtons(user){document.querySelectorAll('.bookmark-button').forEach(button=>button.remove());if(!user)return;const cards=document.querySelectorAll('.card, .study-card');const saved=readSaved(user.uid);cards.forEach(card=>{if(card.classList.contains('member-locked'))return;const title=card.querySelector('h2, h3')?.textContent?.trim();const href=card.dataset.originalHref||card.getAttribute('href')||'#';if(!title||!href||href==='#')return;const category=card.dataset.category||card.querySelector('.label')?.textContent?.trim()||'CONTENT';const id=`${href}|${title}`;const button=document.createElement('button');button.type='button';button.className='bookmark-button';button.setAttribute('aria-label','콘텐츠 저장');button.textContent=saved.some(item=>item.id===id)?'★':'☆';button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();const current=readSaved(user.uid);const exists=current.some(item=>item.id===id);const next=exists?current.filter(item=>item.id!==id):[{id,title,href,category,savedAt:Date.now()},...current];writeSaved(user.uid,next);button.textContent=exists?'☆':'★'});card.querySelector('.thumb, .real-thumb')?.appendChild(button)})}

document.addEventListener('click',async event=>{const logout=event.target.closest('[data-auth-logout], [data-mobile-logout]');if(!logout)return;event.preventDefault();await signOut(auth);location.href='index.html'});

onAuthStateChanged(auth,async user=>{window.WAVELAB_AUTH_USER=user;toggleAuthLinks(user);window.applyMemberAccess?.(user);installBookmarkButtons(user);if(user)await syncUserProfile(user);if(document.body.classList.contains('auth-page')&&user)setNotice(`${user.displayName||user.email||'회원'} 계정으로 로그인되어 있습니다.`,'success')});