import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import { isAdminUser } from './admin-config.js';

const NOTICES='notices';
const escapeHtml=(value='')=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const formatDate=timestamp=>new Intl.DateTimeFormat('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).format(timestamp?.toDate?.()||new Date());

async function loadList(){const list=document.querySelector('[data-notice-list]');if(!list)return;try{const snap=await getDocs(query(collection(db,NOTICES),orderBy('createdAt','desc')));if(snap.empty){list.innerHTML='<div class="notice-empty">등록된 공지사항이 없습니다.</div>';return}list.innerHTML=snap.docs.map(item=>{const data=item.data();return `<a class="notice-row" href="notice-detail.html?id=${item.id}"><span>NOTICE</span><h2>${escapeHtml(data.title)}</h2><time>${formatDate(data.createdAt)}</time></a>`}).join('')}catch(error){list.innerHTML='<div class="notice-empty">공지사항을 불러오지 못했습니다. Firestore 규칙을 확인해 주세요.</div>'}}

async function loadDetail(){const wrap=document.querySelector('[data-notice-detail]');if(!wrap)return;const id=new URLSearchParams(location.search).get('id');if(!id){wrap.innerHTML='<div class="notice-empty">올바르지 않은 공지 주소입니다.</div>';return}try{const snap=await getDoc(doc(db,NOTICES,id));if(!snap.exists()){wrap.innerHTML='<div class="notice-empty">존재하지 않는 공지사항입니다.</div>';return}const data=snap.data();wrap.innerHTML=`<section class="notice-detail-head"><span>NOTICE</span><h1>${escapeHtml(data.title)}</h1><time>${formatDate(data.createdAt)}</time></section><article class="notice-detail-body">${escapeHtml(data.content)}</article>`}catch{wrap.innerHTML='<div class="notice-empty">공지사항을 불러오지 못했습니다.</div>'}}

const form=document.querySelector('[data-notice-form]');form?.addEventListener('submit',async event=>{event.preventDefault();const button=form.querySelector('button[type="submit"]');const message=document.querySelector('[data-notice-message]');button.disabled=true;button.textContent='등록 중...';const data=new FormData(form);try{const saved=await addDoc(collection(db,NOTICES),{title:String(data.get('title')||'').trim(),content:String(data.get('content')||'').trim(),createdAt:serverTimestamp(),authorUid:auth.currentUser.uid,authorEmail:auth.currentUser.email});location.href=`notice-detail.html?id=${saved.id}`}catch(error){message.textContent=error.code==='permission-denied'?'관리자 권한 또는 Firestore 규칙을 확인해 주세요.':'공지 등록 중 오류가 발생했습니다.';button.disabled=false;button.textContent='등록하기'}});

onAuthStateChanged(auth,user=>{const admin=isAdminUser(user);document.querySelector('[data-notice-admin]')?.classList.toggle('is-visible',admin);const write=document.querySelector('[data-notice-write]'),loading=document.querySelector('[data-notice-loading]');if(write){if(!user){location.replace(`login.html?next=${encodeURIComponent('notice-write.html')}`);return}if(!admin){loading.textContent='관리자 계정만 접근할 수 있습니다.';return}loading.hidden=true;write.hidden=false}});

loadList();loadDetail();
