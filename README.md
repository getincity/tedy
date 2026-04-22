# GIC Broadband Website — Setup Guide

## 📁 File Structure
```
gic-broadband/
├── index.html          ← Main website
├── style.css           ← All styles
├── app.js              ← Core JS (animations, logic, local fallbacks)
├── firebase-init.js    ← Firebase integration (module)
├── functions/
│   └── index.js        ← Firebase Cloud Function (AI chatbot)
└── README.md           ← This file
```

---

## 🚀 Quick Start (No Firebase)

Just open `index.html` in a browser. Everything works in **demo mode**:
- ✅ All animations and UI
- ✅ Pincode coverage checker
- ✅ Admin login: `admin@gicbroadband.in` / `admin123`
- ✅ AI chatbot with smart local responses
- ✅ Lead form (logs to console)

---

## 🔥 Firebase Setup (Production)

### Step 1 — Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create project: **gic-broadband**
3. Enable **Google Analytics** (optional)

### Step 2 — Firestore Database
1. Firebase Console → Build → Firestore Database
2. Click **Create Database** → **Production mode** → Choose region (asia-south1 for India)
3. Go to **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leads/{leadId} {
      allow create: if request.resource.data.keys().hasAll(['name','phone','plan','pincode','status','createdAt']);
      allow read, update, delete: if request.auth != null;
    }
  }
}
```

### Step 3 — Authentication
1. Firebase Console → Build → Authentication → Get Started
2. Enable **Email/Password** provider
3. Go to **Users** tab → Add User
4. Create: `admin@gicbroadband.in` with a strong password

### Step 4 — Get Config
1. Firebase Console → Project Settings (gear icon)
2. Under **Your apps** → Add app → Web
3. Register app, copy the `firebaseConfig` object

### Step 5 — Update `firebase-init.js`
Replace the placeholder config:
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "gic-broadband.firebaseapp.com",
  projectId: "gic-broadband",
  storageBucket: "gic-broadband.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 🤖 AI Chatbot Setup (OpenAI via Cloud Function)

### Step 1 — Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2 — Initialize Functions
```bash
cd gic-broadband/
firebase init functions
# Select your project
# Choose JavaScript
# Say yes to ESLint
# Say yes to install dependencies
```

### Step 3 — Set OpenAI API Key
```bash
firebase functions:secrets:set OPENAI_API_KEY
# Paste your OpenAI API key when prompted
# Get key at: platform.openai.com/api-keys
```

### Step 4 — Deploy Function
```bash
cd functions
npm install openai cors
cd ..
firebase deploy --only functions
```

### Step 5 — Update Function URL
After deployment, copy the function URL from the terminal output:
```
https://asia-south1-gic-broadband.cloudfunctions.net/chatbot
```

Update in `firebase-init.js`:
```js
const CHATBOT_FUNCTION_URL = "https://asia-south1-gic-broadband.cloudfunctions.net/chatbot";
```

---

## 🌐 Hosting (Optional — Firebase Hosting)

```bash
firebase init hosting
# Public directory: . (root)
# Single-page app: No
# Automatic builds: No

firebase deploy --only hosting
```

Your site will be live at: `https://gic-broadband.web.app`

---

## 📱 Mobile Responsive
The site is fully responsive across:
- Desktop (1400px+)
- Tablet (768px–1100px)
- Mobile (< 768px)

---

## 🎨 Customization

### Colors (in `style.css` `:root`)
```css
--purple: #a855f7;   /* Primary accent */
--blue:   #3b82f6;   /* Secondary */
--cyan:   #06b6d4;   /* Highlight */
--green:  #10b981;   /* Success / Online */
```

### Coverage Pincodes (in `app.js`)
Update the `COVERED_PINCODES` array to add/remove serviceable pincodes.

### Plans (in `index.html`)
Update plan names, speeds, and prices directly in the HTML.

---

## 🔒 Security Checklist
- [ ] Replace all placeholder Firebase config values
- [ ] Set strong admin password in Firebase Auth
- [ ] Apply Firestore security rules (Step 2 above)
- [ ] Add Firebase App Check for production
- [ ] Enable CORS restrictions on Cloud Function
- [ ] Store OpenAI key only as Firebase Secret (never in code)

---

## 📞 Support
Built for GIC Broadband · 2025
