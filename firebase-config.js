import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDdEz9iZuHU2tP66_A_zGyDYWKaiqGQdCA',
  authDomain: 'wavelab-5aa38.firebaseapp.com',
  projectId: 'wavelab-5aa38',
  storageBucket: 'wavelab-5aa38.firebasestorage.app',
  messagingSenderId: '411115916892',
  appId: '1:411115916892:web:f13e95a30b6d724c5be099'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
