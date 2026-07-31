import { auth } from './firebase-config.js';
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

const authNotice = document.querySelector('[data-auth-notice]');
const loginForm = document.querySelector('[data-login-form]');
const signupForm = document.querySelector('[data-signup-form]');
const resetPassword = document.querySelector('[data-reset-password]');

function setNotice(message, type = '') {
  if (!authNotice) return;
  authNotice.textContent = message;
  authNotice.dataset.state = type;
}

function getNextUrl() {
  const params = new URLSearchParams(location.search);
  return params.get('next') || 'index.html';
}

function authErrorMessage(error) {
  const messages = {
    'auth/email-already-in-use': '이미 가입된 이메일입니다.',
    'auth/invalid-email': '올바른 이메일 주소를 입력해 주세요.',
    'auth/invalid-credential': '이메일 또는 비밀번호를 확인해 주세요.',
    'auth/missing-password': '비밀번호를 입력해 주세요.',
    'auth/weak-password': '비밀번호는 6자 이상 입력해 주세요.',
    'auth/too-many-requests': '로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.',
    'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
    'auth/operation-not-allowed': 'Firebase 콘솔에서 이메일/비밀번호 로그인을 활성화해 주세요.'
  };
  return messages[error.code] || '인증 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}

function setLoading(form, loading) {
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  if (!button.dataset.label) button.dataset.label = button.textContent;
  button.disabled = loading;
  button.textContent = loading ? '처리 중...' : button.dataset.label;
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setLoading(loginForm, true);
  setNotice('로그인 중입니다.');

  const formData = new FormData(loginForm);
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const remember = formData.get('remember') === 'on';

  try {
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(auth, email, password);
    setNotice('로그인되었습니다.', 'success');
    location.href = getNextUrl();
  } catch (error) {
    setNotice(authErrorMessage(error), 'error');
  } finally {
    setLoading(loginForm, false);
  }
});

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setLoading(signupForm, true);
  setNotice('회원가입을 처리하고 있습니다.');

  const formData = new FormData(signupForm);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  try {
    await setPersistence(auth, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(credential.user, { displayName: name });
    setNotice('회원가입이 완료되었습니다.', 'success');
    location.href = getNextUrl();
  } catch (error) {
    setNotice(authErrorMessage(error), 'error');
  } finally {
    setLoading(signupForm, false);
  }
});

resetPassword?.addEventListener('click', async (event) => {
  event.preventDefault();
  const emailInput = loginForm?.querySelector('input[name="email"]');
  const email = emailInput?.value.trim();

  if (!email) {
    setNotice('비밀번호 재설정 메일을 받을 이메일을 먼저 입력해 주세요.', 'error');
    emailInput?.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    setNotice('비밀번호 재설정 메일을 보냈습니다.', 'success');
  } catch (error) {
    setNotice(authErrorMessage(error), 'error');
  }
});

function updateHeaderAuth(user) {
  const loginLink = document.querySelector('.header-actions .login');
  if (!loginLink) return;

  const replacement = loginLink.cloneNode(true);
  loginLink.replaceWith(replacement);

  if (!user) {
    replacement.textContent = '로그인';
    replacement.href = 'login.html';
    return;
  }

  replacement.textContent = '로그아웃';
  replacement.href = '#';
  replacement.title = user.displayName || user.email || '로그아웃';
  replacement.addEventListener('click', async (event) => {
    event.preventDefault();
    await signOut(auth);
    location.href = 'index.html';
  });
}

onAuthStateChanged(auth, (user) => {
  window.WAVELAB_AUTH_USER = user;
  updateHeaderAuth(user);
  window.applyMemberAccess?.(user);

  if (document.body.classList.contains('auth-page') && user) {
    setNotice(`${user.displayName || user.email || '회원'} 계정으로 로그인되어 있습니다.`, 'success');
  }
});
