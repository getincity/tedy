/* ══════════════════════════════════════════
   GIC BROADBAND — Firebase Integration
   ══════════════════════════════════════════
   
   SETUP INSTRUCTIONS:
   1. Go to https://console.firebase.google.com
   2. Create a new project: "gic-broadband"
   3. Enable Firestore Database (production mode)
   4. Enable Authentication → Email/Password
   5. Create Admin user via Firebase Auth console
   6. Replace the firebaseConfig below with your config
   7. For AI chatbot: Deploy the Cloud Function in /functions/
   ══════════════════════════════════════════ */

// ── FIREBASE CONFIG ──
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ── FIREBASE CLOUD FUNCTION URL ──
// Deploy the function from /functions/index.js
const CHATBOT_FUNCTION_URL = "https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/chatbot";

// ── INITIALIZE ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let app, db, auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log('[GIC Firebase] ✅ Connected');
} catch (err) {
  console.warn('[GIC Firebase] ⚠️ Not configured. Running in demo mode.', err.message);
}

// ── EXPOSE API ──
window.gicFirebase = {

  /* Add a new lead to Firestore */
  addLead: async (leadData) => {
    if (!db) throw new Error('Firebase not configured');
    const ref = await addDoc(collection(db, 'leads'), leadData);
    console.log('[GIC] Lead saved:', ref.id);
    return ref.id;
  },

  /* Load all leads (admin only) */
  loadLeads: async () => {
    if (!db) throw new Error('Firebase not configured');
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  /* Update lead status */
  updateLead: async (id, updates) => {
    if (!db) throw new Error('Firebase not configured');
    await updateDoc(doc(db, 'leads', id), updates);
    console.log('[GIC] Lead updated:', id, updates);
  },

  /* Admin login */
  loginAdmin: async (email, password) => {
    if (!auth) throw new Error('Firebase not configured');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    showAdminPanel(cred.user.email);
    loadFirebaseLeads();
    return cred.user;
  },

  /* Admin logout */
  logoutAdmin: async () => {
    if (!auth) return;
    await signOut(auth);
  },

  /* AI Chatbot via Cloud Function */
  chatWithAI: async (message) => {
    if (CHATBOT_FUNCTION_URL.includes('YOUR_')) {
      throw new Error('Chatbot function URL not configured');
    }
    const res = await fetch(CHATBOT_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Chatbot request failed');
    const data = await res.json();
    return data.reply || data.message || 'Sorry, I could not process that.';
  },
};

/* Auth state listener */
if (auth) {
  onAuthStateChanged(auth, user => {
    if (user) {
      console.log('[GIC] Admin session restored:', user.email);
      showAdminPanel(user.email);
      loadFirebaseLeads();
    }
  });
}

async function loadFirebaseLeads() {
  try {
    const leads = await window.gicFirebase.loadLeads();
    if (typeof renderLeads === 'function') renderLeads(leads);
  } catch (err) {
    console.error('[GIC] Error loading leads:', err);
  }
}

function showAdminPanel(email) {
  const authEl = document.getElementById('adminAuth');
  const panelEl = document.getElementById('adminPanel');
  const infoEl = document.getElementById('adminUserInfo');
  if (authEl) authEl.style.display = 'none';
  if (panelEl) panelEl.style.display = 'block';
  if (infoEl) infoEl.textContent = '🔐 Logged in as: ' + email;
}

/* ══════════════════════════════════════════
   FIRESTORE SECURITY RULES
   ══════════════════════════════════════════
   
   Paste these in Firebase Console → Firestore → Rules:
   
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Public: anyone can submit a lead
       match /leads/{leadId} {
         allow create: if request.resource.data.keys().hasAll(['name','phone','plan','pincode','status','createdAt']);
         // Only authenticated admin can read/update
         allow read, update, delete: if request.auth != null;
       }
     }
   }
   
   ══════════════════════════════════════════ */
