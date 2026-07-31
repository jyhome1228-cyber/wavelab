import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const POSTS = 'communityPosts';
const FIRESTORE_TIMEOUT = 15000;
let currentUser = null;
let allPosts = [];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));
}

function formatDate(timestamp) {
  const date = timestamp?.toDate?.() || new Date();
  return new Intl.DateTimeFormat('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' }).format(date);
}

function excerpt(content = '') {
  const plain = String(content).replace(/\s+/g, ' ').trim();
  return plain.length > 100 ? `${plain.slice(0, 100)}…` : plain;
}

function withTimeout(promise, milliseconds = FIRESTORE_TIMEOUT) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => {
      const error = new Error('Firestore request timed out');
      error.code = 'wavelab/firestore-timeout';
      reject(error);
    }, milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer));
}

function firestoreMessage(error) {
  if (error?.code === 'wavelab/firestore-timeout') {
    return '저장 서버 응답이 없습니다. Firebase Console에서 Firestore Database 생성과 보안 규칙 게시 여부를 확인해 주세요.';
  }
  if (error?.code === 'permission-denied') return '게시글 저장 권한이 없습니다. Firestore 보안 규칙과 로그인 상태를 확인해 주세요.';
  if (error?.code === 'failed-precondition') return 'Firebase Console에서 Firestore Database를 먼저 생성해 주세요.';
  if (error?.code === 'unavailable') return 'Firebase 서버에 연결할 수 없습니다. 인터넷 연결이나 브라우저 차단 설정을 확인해 주세요.';
  return `게시글 처리 중 오류가 발생했습니다.${error?.code ? ` (${error.code})` : ''}`;
}

function renderPosts(category = '전체') {
  const list = document.querySelector('[data-community-list]');
  const count = document.querySelector('[data-community-count]');
  if (!list) return;
  const posts = category === '전체' ? allPosts : allPosts.filter(post => post.category === category);
  if (count) count.textContent = `${posts.length} POSTS`;

  if (!posts.length) {
    list.innerHTML = '<div class="community-empty"><strong>아직 등록된 글이 없습니다.</strong><span>첫 번째 고민과 경험을 나눠보세요.</span></div>';
    return;
  }

  list.innerHTML = posts.map(post => `
    <a class="community-post" href="community-detail.html?id=${encodeURIComponent(post.id)}">
      <span class="community-category">${escapeHtml(post.category || '자유')}</span>
      <div><h2 class="community-title">${escapeHtml(post.title)}</h2><p class="community-excerpt">${escapeHtml(excerpt(post.content))}</p></div>
      <div class="community-meta"><span>${escapeHtml(post.authorName || '회원')}</span><span>${formatDate(post.createdAt)}</span></div>
    </a>`).join('');
}

async function loadPosts() {
  const list = document.querySelector('[data-community-list]');
  if (!list) return;
  try {
    const snapshot = await withTimeout(getDocs(query(collection(db, POSTS), orderBy('createdAt', 'desc'))));
    allPosts = snapshot.docs.map(item => ({ id:item.id, ...item.data() }));
    renderPosts('전체');
  } catch (error) {
    list.innerHTML = `<div class="community-empty"><strong>게시글을 불러오지 못했습니다.</strong><span>${escapeHtml(firestoreMessage(error))}</span></div>`;
    const count = document.querySelector('[data-community-count]');
    if (count) count.textContent = '0 POSTS';
  }
}

document.querySelector('[data-community-filters]')?.addEventListener('click', event => {
  const button = event.target.closest('[data-category]');
  if (!button) return;
  document.querySelectorAll('[data-community-filters] button').forEach(item => item.classList.remove('is-active'));
  button.classList.add('is-active');
  renderPosts(button.dataset.category);
});

const form = document.querySelector('[data-community-form]');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  const notice = document.querySelector('[data-community-notice]');
  const submit = form.querySelector('button[type="submit"]');
  if (!currentUser) {
    location.href = `login.html?next=${encodeURIComponent('community-write.html')}`;
    return;
  }

  const data = new FormData(form);
  const category = String(data.get('category') || '').trim();
  const title = String(data.get('title') || '').trim();
  const content = String(data.get('content') || '').trim();
  if (!category || !title || !content) {
    if (notice) notice.textContent = '카테고리, 제목, 내용을 모두 입력해 주세요.';
    return;
  }

  submit.disabled = true;
  submit.textContent = '등록 중...';
  if (notice) notice.textContent = '게시글을 저장하고 있습니다.';

  try {
    const saved = await withTimeout(addDoc(collection(db, POSTS), {
      category,
      title,
      content,
      authorUid: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email?.split('@')[0] || '회원',
      authorEmail: currentUser.email || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
    location.href = `community-detail.html?id=${saved.id}`;
  } catch (error) {
    if (notice) notice.textContent = firestoreMessage(error);
    submit.disabled = false;
    submit.textContent = '등록하기';
  }
});

async function loadDetail() {
  const container = document.querySelector('[data-community-detail]');
  if (!container) return;
  const id = new URLSearchParams(location.search).get('id');
  if (!id) {
    container.innerHTML = '<div class="community-empty"><strong>게시글 주소가 올바르지 않습니다.</strong><a href="community.html">목록으로 돌아가기</a></div>';
    return;
  }

  try {
    const snapshot = await withTimeout(getDoc(doc(db, POSTS, id)));
    if (!snapshot.exists()) {
      container.innerHTML = '<div class="community-empty"><strong>삭제되었거나 존재하지 않는 글입니다.</strong></div>';
      return;
    }
    const post = { id:snapshot.id, ...snapshot.data() };
    const own = currentUser?.uid === post.authorUid;
    container.innerHTML = `
      <section class="community-detail-head"><span>${escapeHtml(post.category || '자유')}</span><h1>${escapeHtml(post.title)}</h1><div class="community-detail-meta"><span>${escapeHtml(post.authorName || '회원')}</span><span>${formatDate(post.createdAt)}</span></div></section>
      <article class="community-detail-body">${escapeHtml(post.content)}</article>
      ${own ? '<div class="community-owner-actions"><button class="danger" type="button" data-delete-post>게시글 삭제</button></div>' : ''}`;

    container.querySelector('[data-delete-post]')?.addEventListener('click', async () => {
      if (!confirm('이 게시글을 삭제하시겠습니까?')) return;
      await withTimeout(deleteDoc(doc(db, POSTS, id)));
      location.replace('community.html');
    });
  } catch (error) {
    container.innerHTML = `<div class="community-empty"><strong>게시글을 불러오지 못했습니다.</strong><span>${escapeHtml(firestoreMessage(error))}</span></div>`;
  }
}

onAuthStateChanged(auth, user => {
  currentUser = user;
  const writePage = document.querySelector('[data-community-write-page]');
  const loading = document.querySelector('[data-community-loading]');
  if (writePage) {
    if (!user) {
      location.replace(`login.html?next=${encodeURIComponent('community-write.html')}`);
      return;
    }
    loading.hidden = true;
    writePage.hidden = false;
  }
  if (document.querySelector('[data-community-detail]')) loadDetail();
});

if (document.querySelector('[data-community-list]')) loadPosts();
