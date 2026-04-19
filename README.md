# 📚 BookBuddy

> *Your personal reading companion — track every book, save quotes, discover your taste, and find libraries near you, all in one living notebook.*

![BookBuddy](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-EF008F?logo=framer&logoColor=white)

---

## 🧩 Problem Statement

Avid readers juggle multiple apps — one to track books, another to save quotes, another to find bookshops, and a spreadsheet for vocabulary. There is no single space that feels personal, tactile, and alive like a real reading journal.

**BookBuddy** solves this by bringing your entire reading life into one beautifully crafted, notebook-inspired web app. It respects the intimate, pen-and-paper feel of reading while giving you the power of a cloud-synced, AI-assisted platform.

---

## ✨ Features

### 📖 Library Management
- Add books with title, author, genre, cover, progress, rating, and status
- Three reading states: **Currently Reading**, **Want to Read**, **Finished**
- Track page-by-page progress with a visual sketch progress bar
- Star-based ratings (1–5) with a hand-drawn aesthetic

### 🔍 Explore & Discover
- Search **millions of books** via the Google Books API
- Quick-genre chips: Fiction, Fantasy, Sci-Fi, Mystery, Romance, Biography, and more
- One-click "Want to Read" addition directly from search results
- Paginated results with infinite "Load More" scrolling

### 📊 Smart Dashboard
- Live reading stats: books reading, finished, want-to-read, total
- **Genre Taste Chart** — visualises your top genres based on ratings
- **AI-powered Recommendations** fetched live from Open Library based on your actual library genres
- Currently reading shelf at a glance

### 💬 Book Clubs *(Real-time)*
- Create or join book clubs tied to a specific book
- **Real-time group chat** powered by Firestore `onSnapshot`
- **Meeting scheduler** with date, time, video call link, agenda, and RSVP
- Member management with owner/member role distinction
- Shareable invite links — join a club via URL (`?join=clubId`)

### 📝 Quote Journal
- Save your favourite passages from any book
- Flip through saved quotes in a scrapbook-style layout

### 🔤 Word Notebook
- Look up any word using the Free Dictionary API
- Save definitions and build a personal vocabulary notebook

### 🗺️ Find Nearby Libraries
- Geolocation-powered map using the Geoapify Places API
- Discover bookshops and libraries in your vicinity

### 👤 Profile & Personalisation
- Choose from 6 custom illustrated character avatars (Godzilla, Pigeon, Penguin, Wizard, Buff Cat, Business Cat)
- Edit display name; email and avatar persist across sessions
- Genre preference picker
- Reading stats summary on profile

### 🌙 Light / Dark Mode
- Physics-based **lamp cord** theme toggle — pull it to switch!
- Full ink-on-paper notebook aesthetic in both themes
- CSS custom property-driven design system for seamless transitions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19 + Vite 8 |
| **Routing** | React Router DOM v7 |
| **Animations** | Framer Motion 12 |
| **Styling** | Vanilla CSS with custom design tokens (notebook aesthetic) |
| **Sketch UI** | Rough.js (hand-drawn borders & shapes) |
| **Backend / Auth** | Firebase 12 (Auth + Firestore + Storage) |
| **Real-time Data** | Firestore `onSnapshot` listeners |
| **Book Search** | Google Books API v1 |
| **Recommendations** | Open Library Search API |
| **Dictionary** | Free Dictionary API |
| **Nearby Places** | Geoapify Places API |
| **Notifications** | React Toastify |
| **Build Tool** | Vite 8 |

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher
- A **Firebase** project with Authentication and Firestore enabled
- (Optional) Google Books API key & Geoapify API key

---

### 1. Clone the repository

```bash
git clone https://github.com/Arnav-Sharma21/Book-Buddy.git
cd Book-Buddy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEOAPIFY_API_KEY=your_geoapify_key
VITE_GOOGLE_BOOKS_API_KEY=your_google_books_key
```

> **Note:** Google Books works without an API key for low-volume usage. Geoapify is required for the nearby libraries feature.

---

### 4. Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Authentication** → Sign-in methods: Email/Password and Google
3. Enable **Firestore Database** in production mode
4. Add your domain (or `localhost`) to **Authentication → Authorized Domains**
5. Apply the following **Firestore security rules**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /books/{bookId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /bookclubs/{clubId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.createdBy == request.auth.uid || 
         request.auth.uid in resource.data.memberIds);
      allow delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
      match /messages/{msgId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/bookclubs/$(clubId)).data.memberIds;
      }
      match /meetings/{meetingId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/bookclubs/$(clubId)).data.memberIds;
      }
    }
  }
}
```

---

### 5. Run the development server

```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

---

### 6. Build for production

```bash
npm run build
```

The output will be in the `dist/` folder.

---

## 🌐 Deploying to Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Set **Framework Preset** to `Vite`
4. Add all environment variables from your `.env` file in the Vercel dashboard
5. Click **Deploy**

Every subsequent push to `main` triggers an automatic redeploy.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute
│   ├── books/         # BookCard, BookForm, StarRating, ProgressBar
│   ├── layout/        # Navbar, PageWrapper, LampCord (theme toggle)
│   ├── nearby/        # NearbyStores map component
│   ├── quotes/        # QuoteCard, QuoteEditor, QuotesBook
│   ├── ui/            # DoodleBackground, DoodleIcons, RoughBox, etc.
│   └── words/         # WordCard, WordModal, WordNotebook
├── context/
│   ├── AuthContext.jsx    # Firebase auth state + helpers
│   ├── ThemeContext.jsx   # Dark/light mode
│   └── ModeContext.jsx    # App mode state
├── hooks/
│   ├── useBooks.js        # Book CRUD helpers
│   ├── useQuotes.js       # Quote CRUD helpers
│   └── useWordNotes.js    # Word note helpers
├── pages/
│   ├── Landing.jsx        # Public landing page
│   ├── Login.jsx          # Sign in
│   ├── Register.jsx       # Sign up
│   ├── Dashboard.jsx      # Reading stats + recommendations
│   ├── Library.jsx        # Personal book library
│   ├── Explore.jsx        # Google Books search
│   ├── BookDetail.jsx     # Individual book view
│   ├── BookClub.jsx       # Book clubs + real-time chat
│   └── Profile.jsx        # User profile + avatar
├── services/
│   ├── firebase.js            # Firebase app init
│   ├── firestoreBooks.js      # Book Firestore CRUD
│   ├── firestoreQuotes.js     # Quote Firestore CRUD
│   ├── firestoreWords.js      # Word note Firestore CRUD
│   ├── recommendationsApi.js  # Open Library recommendations
│   ├── dictionaryApi.js       # Free Dictionary API
│   └── placesApi.js           # Geoapify Places API
└── index.css              # Global design system & CSS variables
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ☕ and too many books &nbsp;·&nbsp; BookBuddy © 2025
</p>
