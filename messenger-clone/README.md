# 💬 Messenger Clone

A full-featured real-time messaging web app built with **React**, **Firebase**, and **Tailwind CSS** — deployable for free on Vercel.

![Messenger Clone](https://img.shields.io/badge/React-18-blue) ![Firebase](https://img.shields.io/badge/Firebase-10-orange) ![Tailwind](https://img.shields.io/badge/Tailwind-3-teal)

---

## ✨ Features

- 🔐 **Authentication** — Email/password sign-up & login
- 💬 **Real-time messaging** — Powered by Firestore live listeners
- 🖼 **Image sharing** — Upload & share images via Firebase Storage
- 😊 **Emoji picker** — Full emoji support
- 🟢 **Online status** — Live presence indicators
- ⌨️ **Typing indicators** — See when others are typing
- ✔ **Read receipts** — Unread message counts
- 🌙 **Dark mode** — System-aware + manual toggle
- 📱 **Mobile responsive** — Works great on all screen sizes
- 🎨 **Modern UI** — Glass morphism, smooth animations, beautiful design

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/messenger-clone.git
cd messenger-clone
npm install
```

### 2. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Add a **Web App** → copy the config
4. Enable **Authentication** → Email/Password
5. Create **Firestore Database** (start in test mode, then apply rules)
6. Enable **Storage**
7. Copy `firestore.rules` content into Firebase Console → Firestore → Rules

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in your Firebase config values in `.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=yourapp.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=yourapp
REACT_APP_FIREBASE_STORAGE_BUCKET=yourapp.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Run Locally

```bash
npm start
```

Visit `http://localhost:3000`

---

## 🌐 Deploy to Vercel (Free)

### Option A: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option B: GitHub + Vercel
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Select your GitHub repo
4. Add environment variables (same as `.env`)
5. Click Deploy ✅

Your app will be live at: `https://messenger-clone.vercel.app`

---

## 📁 Project Structure

```
messenger-clone/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx        # Chat list, user search, online status
│   │   ├── ChatWindow.jsx     # Message display with date dividers
│   │   ├── Message.jsx        # Individual message bubbles
│   │   └── MessageInput.jsx   # Text input, emoji, image upload
│   │
│   ├── pages/
│   │   ├── Login.jsx          # Sign-in page
│   │   ├── Register.jsx       # Sign-up page
│   │   └── ChatPage.jsx       # Main chat layout
│   │
│   ├── context/
│   │   ├── AuthContext.jsx    # Firebase auth state
│   │   └── ThemeContext.jsx   # Dark/light mode
│   │
│   ├── hooks/
│   │   └── useChat.js         # All Firestore chat logic
│   │
│   ├── firebase.js            # Firebase initialization
│   └── App.jsx                # Routes & providers
│
├── public/
│   └── index.html
├── firestore.rules            # Security rules
├── .env.example               # Environment template
└── package.json
```

---

## 🗄️ Firestore Data Model

```
users/{uid}
  - uid, email, displayName, photoURL
  - online (boolean), lastSeen (timestamp)

conversations/{uid1_uid2}
  - participants: [uid1, uid2]
  - participantData: { uid: { displayName, photoURL } }
  - lastMessage, lastMessageTime, updatedAt
  - unread: { uid1: 0, uid2: 2 }
  - typing: { uid1: false, uid2: true }

conversations/{id}/messages/{msgId}
  - text, imageUrl, senderId, senderName, senderPhoto
  - createdAt (timestamp), read (boolean)
```

---

## 🔒 Security

Apply the rules in `firestore.rules` to your Firestore instance. They ensure:
- Only authenticated users can read/write
- Users can only modify their own profile
- Only conversation participants can access messages

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Tailwind CSS |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Storage | Firebase Storage |
| Hosting | Vercel |
| Fonts | Sora (Google Fonts) |
| Emoji | emoji-picker-react |

---

## 📄 License

MIT — free to use and modify.
