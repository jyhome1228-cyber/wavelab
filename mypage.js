import { auth, db } from './firebase-config.js';
import {
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const dashboard=document.querySelector('[data-mypage]');
const loading=document.querySelector('[data-mypage-loading]');
const logoutButton=document.querySelector('[data-dashboard-logout]');
const profileForm=document.querySelector('[data-profile-form]');
const profileInput=document.querySelector('[data-profile-input]');
const profileImage=document.querySelector('[data-profile-image]');
const profileInitial=document.querySelector('[data-user-initial]');
const removePhotoButton=document.querySelector('[data-profile-remove]');
const savedList=document.querySelector('[data-saved-list]');
const myPosts=document.querySelector('[data-my-posts]');
const columnistState=document.querySelector('[data-columnist-state]');
const myColumns=document.querySelector('[data-my-columns]');
const columnActions=document.querySelector('[data-column-actions]');
const passwordResetButton=document.querySelector('[data-password-reset]');
const deleteAccountButton=document.querySelector('[data-delete-account]');
const profileNotice=document.querySelector('[data-profile-notice]');
const accountNotice=document.querySelector('[data-account-notice]');
let currentUser=null;

function profileKey(uid){return `wavelab:profile:${uid}`}
function savedKey(uid){return `wavelab:saved:${uid}`}
function readSaved(uid){try{return JSON.parse(localStorage.getItem(savedKey(uid))||'[]')}catch{return[]}}
function setText(selector,value){document.querySelectorAll(selector).forEach(el=>el.textContent=value)}
function escapeHtml(value=''){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function formatDate(timestamp){const date=timestamp?.toDate?.()||new Date();return new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}

function showProfileImage(dataUrl,initial){
  if(dataUrl){profileImage.src=dataUrl;profileImage.hidden=false;profileInitial.hidden=true}
  else{profileImage.removeAttribute('src');profileImage.hidden=true;profileInitial.hidden=false;profileInitial.textContent=initial}
}

function renderSaved(){
  if(!currentUser||!savedList)return;
  const items=readSaved(currentUser.uid);
  if(!items.length){savedList.innerHTML='<div class="empty-state"><strong>저장한 콘텐츠가 없습니다.</strong><p>콘텐츠의 저장 버튼을 눌러보세요.</p><a href="article.html">콘텐츠 둘러보기</a></div>';return}
  savedList.innerHTML=items.map(item=>`<div class="saved-item" data-saved-id="${encodeURIComponent(item.id)}"><span>${escapeHtml(item.category||'CONTENT')}</span><a href="${item.href}"><strong>${escapeHtml(item.title)}</strong></a><button type="button" data-remove-saved>삭제</button></div>`).join('');
}

async function renderMyPosts(){
  if(!currentUser||!myPosts)return;
  try{
    const snapshot=await getDocs(query(collection(db,'communityPosts'),where('authorUid','==',currentUser.uid)));
    const posts=snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    if(!posts.length){myPosts.innerHTML='<div class="empty-state"><strong>작성한 글이 없습니다.</strong><p>커뮤니티에서 고민과 경험을 나눠보세요.</p><a href="community-write.html">글쓰기</a></div>';return}
    myPosts.innerHTML=posts.map(post=>`<a class="my-post-item" href="community-detail.html?id=${encodeURIComponent(post.id)}"><span>${escapeHtml(post.category||'자유')}</span><strong>${escapeHtml(post.title||'제목 없음')}</strong><small>${formatDate(post.createdAt)}</small></a>`).join('');
  }catch{myPosts.innerHTML='<div class="empty-state"><strong>커뮤니티 글을 불러오지 못했습니다.</strong></div>'}
}

function statusLabel(status){return({draft:'임시저장',review:'검토 중',published:'공개'}[status]||status)}

async function renderColumnistAndColumns(){
  if(!currentUser||!columnistState||!myColumns)return;
  try{
    const [profileSnap,applicationSnap,adminSnap,columnSnap]=await Promise.all([
      getDoc(doc(db,'columnistProfiles',currentUser.uid)),
      getDoc(doc(db,'columnistApplications',currentUser.uid)),
      getDoc(doc(db,'admins',currentUser.uid)),
      getDocs(query(collection(db,'columns'),where('authorUid','==',currentUser.uid)))
    ]);
    const approved=profileSnap.exists()&&profileSnap.data().status==='approved';
    if(approved){
      const profile=profileSnap.data();
      columnistState.innerHTML=`<strong>${escapeHtml(profile.penName||'칼럼니스트')} 칼럼니스트</strong><p>칼럼 작성 권한이 활성화되었습니다. 새 글을 작성하거나 기존 글을 수정할 수 있습니다.</p>`;
      columnActions.hidden=false;
    }else if(applicationSnap.exists()&&applicationSnap.data().status==='pending'){
      columnistState.innerHTML='<strong>칼럼니스트 신청 검토 중</strong><p>신청서 검토가 완료되면 글쓰기 권한이 열립니다.</p>';
    }else if(applicationSnap.exists()&&applicationSnap.data().status==='rejected'){
      columnistState.innerHTML='<strong>신청 내용 보완이 필요합니다.</strong><p>소개와 작성 주제를 보완해 다시 신청해 주세요.</p><div class="column-actions" style="justify-content:center;margin:20px 0 0"><a href="columnist-apply.html">다시 신청</a></div>';
    }else{
      columnistState.innerHTML='<strong>웨이블랩 칼럼니스트로 참여해보세요.</strong><p>자신의 경험과 전문 분야를 바탕으로 독자에게 관점을 나눌 수 있습니다.</p><div class="column-actions" style="justify-content:center;margin:20px 0 0"><a class="primary" href="columnist-apply.html">칼럼니스트 신청</a></div>';
    }
    if(adminSnap.exists())columnistState.insertAdjacentHTML('beforeend','<div class="column-actions" style="justify-content:center;margin:12px 0 0"><a href="editorial-review.html">에디토리얼 검토</a></div>');

    const columns=columnSnap.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>(b.updatedAt?.seconds||0)-(a.updatedAt?.seconds||0));
    if(!columns.length){myColumns.innerHTML='<div class="empty-state"><strong>작성한 칼럼이 없습니다.</strong><p>승인 후 첫 번째 칼럼을 작성해보세요.</p></div>';return}
    myColumns.innerHTML=columns.map(item=>`<div class="my-column-item"><span>${statusLabel(item.status)}</span><div><strong>${escapeHtml(item.title||'제목 없음')}</strong><div class="column-card-actions"><a href="column-detail.html?id=${encodeURIComponent(item.id)}">미리보기</a><a href="column-write.html?id=${encodeURIComponent(item.id)}">수정하기</a>${item.status==='published'?`<button type="button" data-share-column="${item.id}">공유하기</button>`:''}</div></div><small>${formatDate(item.updatedAt)}</small></div>`).join('');
  }catch(error){columnistState.innerHTML='<strong>칼럼 정보를 불러오지 못했습니다.</strong><p>Firestore 규칙이 반영되었는지 확인해 주세요.</p>';myColumns.innerHTML='';console.error(error)}
}

function renderUser(user){
  currentUser=user;
  const name=user.displayName||user.email?.split('@')[0]||'회원';
  const email=user.email||'-';
  const initial=name.trim().charAt(0).toUpperCase()||'W';
  setText('[data-user-name]',name);setText('[data-user-email]',email);
  showProfileImage(localStorage.getItem(profileKey(user.uid)),initial);
  profileForm.elements.displayName.value=name;profileForm.elements.email.value=email;
  renderSaved();renderMyPosts();renderColumnistAndColumns();
  loading.hidden=true;dashboard.hidden=false;
}

profileForm?.addEventListener('submit',async event=>{event.preventDefault();if(!currentUser)return;const name=profileForm.elements.displayName.value.trim();if(!name)return;try{await updateProfile(currentUser,{displayName:name});await currentUser.reload();setText('[data-user-name]',name);if(profileImage.hidden)profileInitial.textContent=name.charAt(0).toUpperCase()||'W';profileNotice.textContent='프로필 정보가 저장되었습니다.'}catch{profileNotice.textContent='정보 저장 중 오류가 발생했습니다.'}});
profileInput?.addEventListener('change',event=>{const file=event.target.files?.[0];if(!file||!currentUser)return;if(file.size>2*1024*1024){profileNotice.textContent='프로필 이미지는 2MB 이하로 등록해 주세요.';return}const reader=new FileReader();reader.onload=()=>{const dataUrl=String(reader.result||'');localStorage.setItem(profileKey(currentUser.uid),dataUrl);showProfileImage(dataUrl,'W');profileNotice.textContent='프로필 사진이 저장되었습니다.'};reader.readAsDataURL(file)});
removePhotoButton?.addEventListener('click',()=>{if(!currentUser)return;localStorage.removeItem(profileKey(currentUser.uid));const name=currentUser.displayName||currentUser.email?.split('@')[0]||'회원';showProfileImage('',name.charAt(0).toUpperCase()||'W');profileNotice.textContent='프로필 사진이 삭제되었습니다.'});
savedList?.addEventListener('click',event=>{const button=event.target.closest('[data-remove-saved]');if(!button||!currentUser)return;const row=button.closest('[data-saved-id]');const id=decodeURIComponent(row.dataset.savedId||'');localStorage.setItem(savedKey(currentUser.uid),JSON.stringify(readSaved(currentUser.uid).filter(item=>item.id!==id)));renderSaved()});
myColumns?.addEventListener('click',async event=>{const button=event.target.closest('[data-share-column]');if(!button)return;const url=new URL(`column-detail.html?id=${button.dataset.shareColumn}`,location.href).href;try{if(navigator.share)await navigator.share({title:'WAVELAB COLUMN',url});else{await navigator.clipboard.writeText(url);button.textContent='링크 복사됨';setTimeout(()=>button.textContent='공유하기',1500)}}catch{}});
passwordResetButton?.addEventListener('click',async()=>{if(!currentUser?.email)return;accountNotice.textContent='재설정 메일을 보내고 있습니다.';try{await sendPasswordResetEmail(auth,currentUser.email);accountNotice.textContent='비밀번호 재설정 메일을 보냈습니다.'}catch{accountNotice.textContent='메일 전송 중 오류가 발생했습니다.'}});
deleteAccountButton?.addEventListener('click',async()=>{if(!currentUser||!confirm('정말 회원탈퇴하시겠습니까? 계정은 복구할 수 없습니다.'))return;deleteAccountButton.disabled=true;deleteAccountButton.textContent='처리 중...';try{const uid=currentUser.uid;await deleteUser(currentUser);localStorage.removeItem(profileKey(uid));localStorage.removeItem(savedKey(uid));location.replace('index.html')}catch(error){deleteAccountButton.disabled=false;deleteAccountButton.textContent='회원탈퇴';accountNotice.textContent=error.code==='auth/requires-recent-login'?'보안을 위해 다시 로그인한 뒤 회원탈퇴를 진행해 주세요.':'회원탈퇴 중 오류가 발생했습니다.'}});
logoutButton?.addEventListener('click',async()=>{logoutButton.disabled=true;logoutButton.textContent='로그아웃 중...';try{await signOut(auth);location.replace('index.html')}catch{logoutButton.disabled=false;logoutButton.textContent='로그아웃'}});
window.addEventListener('wavelab:saved-updated',renderSaved);
onAuthStateChanged(auth,user=>{if(!user){location.replace(`login.html?next=${encodeURIComponent('mypage.html')}`);return}renderUser(user)});
