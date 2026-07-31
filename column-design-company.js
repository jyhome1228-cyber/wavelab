import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';

const content = {
  id: 'column-design-company-210',
  title: '디자인 회사는 더 이상 디자인을 하지 않는다',
  href: 'column-design-company.html',
  category: 'COLUMN · DESIGN · BUSINESS'
};

const saveButton = document.querySelector('[data-static-save]');
const shareButton = document.querySelector('[data-static-share]');
let currentUser = null;

function savedKey(uid) { return `wavelab:saved:${uid}`; }
function readSaved(uid) {
  try { return JSON.parse(localStorage.getItem(savedKey(uid)) || '[]'); }
  catch { return []; }
}

function renderSaveState() {
  if (!saveButton) return;
  if (!currentUser) {
    saveButton.textContent = '저장하기';
    return;
  }
  const saved = readSaved(currentUser.uid).some(item => item.id === content.id);
  saveButton.textContent = saved ? '저장됨 ✓' : '저장하기';
}

saveButton?.addEventListener('click', () => {
  if (!currentUser) {
    location.href = `login.html?next=${encodeURIComponent(content.href)}`;
    return;
  }
  const items = readSaved(currentUser.uid);
  const exists = items.some(item => item.id === content.id);
  const next = exists
    ? items.filter(item => item.id !== content.id)
    : [{ ...content, savedAt: Date.now() }, ...items];
  localStorage.setItem(savedKey(currentUser.uid), JSON.stringify(next));
  renderSaveState();
  window.dispatchEvent(new CustomEvent('wavelab:saved-updated'));
});

shareButton?.addEventListener('click', async () => {
  const shareData = { title: document.title, text: content.title, url: location.href };
  try {
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(location.href);
      shareButton.textContent = '링크 복사됨';
      setTimeout(() => { shareButton.textContent = '공유하기'; }, 1800);
    }
  } catch {}
});

onAuthStateChanged(auth, user => {
  currentUser = user;
  renderSaveState();
});
