import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const dashboard = document.querySelector('[data-mypage]');
const loading = document.querySelector('[data-mypage-loading]');
const logoutButton = document.querySelector('[data-dashboard-logout]');

function setText(selector, value) {
  document.querySelectorAll(selector).forEach(element => {
    element.textContent = value;
  });
}

function renderUser(user) {
  const name = user.displayName || user.email?.split('@')[0] || '회원';
  const email = user.email || '-';
  const initial = name.trim().charAt(0).toUpperCase() || 'W';

  setText('[data-user-name]', name);
  setText('[data-user-name-small]', name);
  setText('[data-user-email]', email);
  setText('[data-user-initial]', initial);
  setText('[data-account-name]', name);
  setText('[data-account-email]', email);

  loading.hidden = true;
  dashboard.hidden = false;
}

onAuthStateChanged(auth, user => {
  if (!user) {
    const next = encodeURIComponent('mypage.html');
    location.replace(`login.html?next=${next}`);
    return;
  }
  renderUser(user);
});

logoutButton?.addEventListener('click', async () => {
  logoutButton.disabled = true;
  logoutButton.textContent = '로그아웃 중...';
  try {
    await signOut(auth);
    location.replace('index.html');
  } catch (error) {
    logoutButton.disabled = false;
    logoutButton.textContent = '로그아웃';
    alert('로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요.');
  }
});