import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { collection, doc, getDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const list=document.querySelector('[data-column-list]');
const writeLink=document.querySelector('[data-column-write-link]');
const esc=value=>String(value||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

async function loadColumns(){
  try{
    const snapshot=await getDocs(query(collection(db,'columns'),where('status','==','published')));
    const dynamic=snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>(b.publishedAt?.seconds||0)-(a.publishedAt?.seconds||0));
    if(!dynamic.length)return;
    const cards=dynamic.map(post=>`<a class="card" data-category="${esc(post.category)}" href="column-detail.html?id=${encodeURIComponent(post.id)}"><div class="real-thumb">${post.thumbnailUrl?`<img src="${esc(post.thumbnailUrl)}" alt="${esc(post.title)} 대표 이미지">`:'<div class="thumb blue"><strong>COLUMN</strong></div>'}<span class="label">COLUMN · ${esc(post.category)}</span></div><h2>${esc(post.title)}</h2><div class="meta"><span>${esc(post.authorName)}</span><span>${esc(post.category)}</span></div></a>`).join('');
    list.insertAdjacentHTML('beforeend',cards);
  }catch(error){
    console.error('Failed to load columns',error);
  }
}

onAuthStateChanged(auth,async user=>{
  if(!user)return;
  try{
    const profile=await getDoc(doc(db,'columnistProfiles',user.uid));
    if(profile.exists()&&profile.data().status==='approved')writeLink.hidden=false;
  }catch{}
});

loadColumns();