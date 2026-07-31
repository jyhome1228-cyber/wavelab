import { auth } from './firebase-config.js';
import {
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const dashboard = document.querySelector('[data-mypage]');
const loading = document.querySelector('[data-mypage-loading]');
const logoutButton = document.querySelector('[data-dashboard-logout]');
const profileForm = document.querySelector('[data-profile-form]');
const profileInput = document.querySelector('[data-profile-input]');
const profileImage = document.querySelector('[data-profile-image]');
const profileInitial = document.querySelector('[data-user-initial]');
const removePhotoButton = document.querySelector('[data-profile-remove]');
const savedList = document.querySelector('[data-saved-list]');
const passwordResetButton = document.querySelector('[data-password-reset]');
const deleteAccountButton = document.querySelector('[data-delete-account]');
const profileNotice = document.querySelector('[data-profile-notice]');
const accountNotice = document.querySelector('[data-account-notice]');

let currentUser = null;

function profileKey(uid) {
  return `wavelab:profile:${uid}`;
}

function savedKey(uid) {
  return `wavelab:saved:${uid}`;
}

function readSaved(uid) {
  try { return JSON.parse(localStorage.getItem(savedKey(uid)) || '[]'); }
  catch { return []; }
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
}

function showProfileImage(dataUrl, initial) {
  if (dataUrl) {
    profileImage.src = dataUrl;
    profileImage.hidden = false;
    profileInitial.hidden = true;
  } else {
    profileImage.removeAttribute('src');
    profileImage.hidden = true;
    profileInitial.hidden = false;
    profileInitial.textContent = initial;
  }
}

function renderSaved() {
  if (!currentUser || !savedList) return;
  const items = readSaved(currentUser.uid);

  if (!items.length) {
    savedList.innerHTML = '<div class="empty-state"><strong>저장한 콘텐츠가 없습니다.</strong><p>매거진과 아티클 카드의 별표를 눌러 저장해보세요.</p><a href="article.html">콘텐츠 둘러보기</a></div>';
    return;
  }

  savedList.innerHTML = items.map(item => `
    <div class="saved-item" data-saved-id="${encodeURIComponent(item.id)}">
      <span>${item.category || 'CONTENT'}</span>
      <a href="${item.href}"><strong>${item.title}</strong></a>
      <button type="button" data-remove-saved>삭제</button>
    </div>`).join('');
}

function renderUser(user) {
  currentUser = user;
  const name = user.displayName || user.email?.split('@')[0] || '회원';
  const email = user.email || '-';
  const initial = name.trim().charAt(0).toUpperCase() || 'W';
  const savedProfileImage = localStorage.getItem(profileKey(user.uid));

  setText('[data-user-name]', name);
  setText('[data-user-email]', email);
  showProfileImage(savedProfileImage, initial);

  profileForm.elements.displayName.value = name;
  profileForm.elements.email.value = email;
  renderSaved();

  loading.hidden = true;
  dashboard.hidden = false;
}

profileForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentUser) return;
  const name = profileForm.elements.displayName.value.trim();
  if (!name) return;

  try {
    await updateProfile(currentUser, { displayName: name });
    await currentUser.reload();
    setText('[data-user-name]', name);
    const initial = name.charAt(0).toUpperCase() || 'W';
    if (profileImage.hidden) profileInitial.textContent = initial;
    profileNotice.textContent = '프로필 정보가 저장되었습니다.';
  } catch {
    profileNotice.textContent = '정보 저장 중 오류가 발생했습니다.';
  }
});

profileInput?.addEventListener('change', event => {
  const file = event.target.files?.[0];
  if (!file || !currentUser) return;
  if (file.size > 2 * 1024 * 1024) {
    profileNotice.textContent = '프로필 이미지는 2MB 이하로 등록해 주세요.';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = String(reader.result || '');
    localStorage.setItem(profileKey(currentUser.uid), dataUrl);
    showProfileImage(dataUrl, 'W');
    profileNotice.textContent = '프로필 사진이 저장되었습니다.';
  };
  reader.readAsDataURL(file);
});

removePhotoButton?.addEventListener('click', () => {
  if (!currentUser) return;
  localStorage.removeItem(profileKey(currentUser.uid));
  const name = currentUser.displayName || currentUser.email?.split('@')[0] || '회원';
  showProfileImage('', name.charAt(0).toUpperCase() || 'W');
  profileNotice.textContent = '프로필 사진이 삭제되었습니다.';
});

savedList?.addEventListener('click', event => {
  const button = event.target.closest('[data-remove-saved]');
  if (!button || !currentUser) return;
  const row = button.closest('[data-saved-id]');
  const id = decodeURIComponent(row.dataset.savedId || '');
  const next = readSaved(currentUser.uid).filter(item => item.id !== id);
  localStorage.setItem(savedKey(currentUser.uid), JSON.stringify(next));
  renderSaved();
});

passwordResetButton?.addEventListener('click', async () => {
  if (!currentUser?.email) return;
  accountNotice.textContent = '재설정 메일을 보내고 있습니다.';
  try {
    await sendPasswordResetEmail(auth, currentUser.email);
    accountNotice.textContent = '비밀번호 재설정 메일을 보냈습니다.';
  } catch {
    accountNotice.textContent = '메일 전송 중 오류가 발생했습니다.';
  }
});

deleteAccountButton?.addEventListener('click', async () => {
  if (!currentUser) return;
  const confirmed = confirm('정말 회원탈퇴하시겠습니까? 계정은 복구할 수 없습니다.');
  if (!confirmed) return;

  deleteAccountButton.disabled = true;
  deleteAccountButton.textContent = '처리 중...';
  try {
    const uid = currentUser.uid;
    await deleteUser(currentUser);
    localStorage.removeItem(profileKey(uid));
    localStorage.removeItem(savedKey(uid));
    location.replace('index.html');
  } catch (error) {
    deleteAccountButton.disabled = false;
    deleteAccountButton.textContent = '회원탈퇴';
    accountNotice.textContent = error.code === 'auth/requires-recent-login'
      ? '보안을 위해 다시 로그인한 뒤 회원탈퇴를 진행해 주세요.'
      : '회원탈퇴 중 오류가 발생했습니다.';
  }
});

logoutButton?.addEventListener('click', async () => {
  logoutButton.disabled = true;
  logoutButton.textContent = '로그아웃 중...';
  try {
    await signOut(auth);
    location.replace('index.html');
  } catch {
    logoutButton.disabled = false;
    logoutButton.textContent = '로그아웃';
  }
});

window.addEventListener('wavelab:saved-updated', renderSaved);

onAuthStateChanged(auth, user => {
  if (!user) {
    location.replace(`login.html?next=${encodeURIComponent('mypage.html')}`);
    return;
  }
  renderUser(user);
});
