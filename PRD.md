# BookBuddy — Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** April 2025  
**Author:** Arnav Sharma  
**Status:** Shipped (v1.0)

---

## 1. Executive Summary

BookBuddy is a personal reading companion web application that consolidates a reader's entire journey — from discovering new books to tracking progress, saving memorable quotes, building vocabulary, finding local libraries, and discussing books with friends — into a single, beautifully crafted platform with a handcrafted notebook aesthetic.

The application is built for passionate readers who want a digital reading journal that feels as personal and tactile as a physical notebook, without sacrificing the power and convenience of cloud sync, real-time collaboration, and intelligent recommendations.

---

## 2. Problem Statement

### 2.1 The Core Problem
Avid readers today face a fragmented experience:
- They use Goodreads to track books (cluttered, impersonal UI)
- They use physical notebooks or Apple Notes to save quotes
- They use separate dictionary apps to look up words
- They use Google Maps to find nearby libraries
- They use WhatsApp groups for book club discussions

There is **no single, cohesive space** that feels like a real reading journal while providing all the power of modern technology.

### 2.2 User Pain Points
| Pain Point | Current Solution | BookBuddy Solution |
|------------|-----------------|-------------------|
| Tracking reading progress | Spreadsheets / Goodreads | Visual library with status + progress |
| Saving favourite quotes | Notes apps / physical books | In-app quote journal per book |
| Looking up unfamiliar words | Dictionary app | Integrated word notebook |
| Finding book recommendations | Browsing lists manually | Live AI-style recs from your library data |
| Coordinating book club meetings | WhatsApp + email | Built-in club chat + meeting scheduler |
| Finding nearby bookshops | Google Maps | Integrated geolocation map |
| Dark/Light mode toggle | System preference | Physics-based lamp cord toggle |

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals
- Provide a delightful, friction-free reading tracking experience
- Create a sense of personal ownership through the notebook aesthetic
- Enable readers to discover new books based on their actual tastes
- Foster community reading through collaborative book clubs

### 3.2 Non-Goals (v1.0)
- Social networking features (following other users, public profiles)
- Physical book purchase/rental integration
- Audiobook or ebook reading within the app
- Mobile native apps (iOS / Android)

### 3.3 Success Metrics
| Metric | Target |
|--------|--------|
| User registration → first book added | < 2 minutes |
| Recommendation load time | < 3 seconds |
| Real-time message delivery | < 500ms |
| Page load time (Lighthouse) | > 85 performance score |
| Mobile responsiveness | All core pages functional at 375px |

---

## 4. User Personas

### 4.1 The Avid Reader — "Priya"
- Age: 24, software engineer, reads 20+ books/year
- **Goal:** Track her reading list, never lose track of a quote, and discover books in her genre
- **Frustration:** Goodreads feels social and overwhelming; physical journals get lost

### 4.2 The Book Club Organiser — "Rohan"
- Age: 32, product manager, runs a monthly book club with 8 friends
- **Goal:** Schedule meetings, share invite links, keep discussion in one place
- **Frustration:** Coordination happens across 3 apps; discussions get buried in chat history

### 4.3 The Vocabulary Builder — "Ananya"
- Age: 19, English literature student, reads classic literature
- **Goal:** Build a personal vocabulary notebook from books she reads
- **Frustration:** Writes words in a separate notebook but can never find them later

---

## 5. Feature Specifications

### 5.1 Authentication System

**Description:** Secure multi-provider authentication powered by Firebase Auth.

**Requirements:**
- Email/password registration with display name capture
- Google OAuth sign-in via popup
- Persistent authentication state across sessions
- Protected routes redirect unauthenticated users to `/login`
- User profile document created in Firestore on first sign-in

**User Stories:**
- As a new user, I can register with my name, email, and password
- As a returning user, I can log in with Google in one click
- As a user, I am automatically redirected to my dashboard after login

---

### 5.2 Personal Library

**Description:** A user's private collection of books with full lifecycle tracking.

**Requirements:**
- Add books with: title, author, genre tags, cover URL, total pages, current page, rating (1–5 stars), notes, status
- Three book statuses: `reading`, `want`, `finished`
- Inline progress editing per book card
- Filter library by status
- Edit and delete individual books
- Visual progress bar rendered with a hand-drawn sketch style
- All data persisted to Firestore per user UID

**User Stories:**
- As a user, I can add a book with its details and set my reading status
- As a user, I can update my current page to track reading progress visually
- As a user, I can rate a finished book from 1 to 5 stars
- As a user, I can delete a book from my library at any time

---

### 5.3 Explore / Book Discovery

**Description:** A powerful search interface over the Google Books API.

**Requirements:**
- Full-text book search by title, author, genre, or ISBN
- Quick-genre shortcut chips (Fiction, Fantasy, Sci-Fi, Mystery, Romance, Biography, History, Self-Help, Horror, Philosophy)
- Paginated results (20 per page), with "Load More" infinite scroll
- Book detail modal with cover, description, page count, genre tags, ratings
- One-click "Want to Read" action adds book directly to the user's library
- Default query loads bestsellers on page load
- Handles API errors gracefully with retry option
- Works with or without a Google Books API key (unauthenticated requests for low volume)

**User Stories:**
- As a user, I can search for any book and see results instantly
- As a user, I can click a genre chip to browse an entire category
- As a user, I can add a book from search results to my library with one click

---

### 5.4 Smart Dashboard

**Description:** A personalised reading analytics and recommendation hub.

**Requirements:**
- **Stats row:** live counts of reading, finished, want-to-read, total books
- **Genre Taste chart:** scored ranking of top 5 genres based on rated + finished books (weighted formula: count × 2 + average rating)
- **Currently Reading shelf:** book cards for all active books
- **Live Recommendations:** fetches up to 8 books from Open Library based on genres derived from library; deduplicates against owned titles; shows matched genre pill on each result
- Recommendations update when library changes

**Recommendation Algorithm:**
1. Derive genre scores from library: reading = weight 4, want = 3, finished+rated≥4 = 2, finished = 1
2. Pick top 4 genres by weighted score
3. Query Open Library subject search API for each genre
4. Merge results, deduplicate by title (case-insensitive), cap at 8 results

**User Stories:**
- As a user, I see my reading stats at a glance when I open the dashboard
- As a user, I get book recommendations tailored to what I actually read
- As a user, I can see my genre taste visualised as a scored progress chart

---

### 5.5 Book Clubs *(Real-time)*

**Description:** A collaborative space for groups to read and discuss books together.

**Requirements:**

**Club Management:**
- Create a book club with name, book title/author, and description
- Join a club via direct Club ID or full invite URL (`?join=clubId`)
- Shareable invite links copyable from within a club
- Leave club (non-owners only)
- Delete club (owners only)

**Real-time Discussion:**
- Chat panel with live message stream via Firestore `onSnapshot`
- Messages grouped by sender with avatar initials and timestamps
- Auto-scroll to latest message
- Relative timestamps ("just now", "3m ago", "2h ago")

**Meeting Scheduler:**
- Schedule meetings with title, date, time, optional video call link, and agenda
- RSVP toggle (Going / Not Going) per meeting
- Separate upcoming and past meetings views
- Delete meeting (any member with schedule access)

**Member Panel:**
- View all club members with join dates
- Owner badge displayed for creator
- Kick member (owner only)

**Info Tab:**
- View and edit club description (owner only)
- Copy invite link from info panel

**User Stories:**
- As a user, I can create a book club for the book I'm reading with friends
- As a user, I can share an invite link so friends can join instantly
- As a club member, I can send and receive messages in real time
- As a club organiser, I can schedule a meeting with a video call link
- As a member, I can RSVP to upcoming meetings

---

### 5.6 Quote Journal

**Description:** A personal scrapbook for saving memorable passages.

**Requirements:**
- Save quotes with book title, author reference, and optional page number
- View quotes in a hand-drawn scrapbook layout
- Edit and delete saved quotes
- Quotes persisted to Firestore per user

**User Stories:**
- As a user, I can save a quote from any book I'm reading
- As a user, I can browse all my saved quotes like flipping through a notebook

---

### 5.7 Word Notebook

**Description:** A built-in dictionary + personal vocabulary builder.

**Requirements:**
- Search any word using the Free Dictionary API
- View phonetics, part of speech, definitions, examples, and synonyms
- Save a word with its definition to the personal word notebook
- Browse saved words in a notebook card layout
- Delete saved words
- Word notes persisted to Firestore per user

**User Stories:**
- As a user, I can look up any word I encounter while reading
- As a user, I can save words I want to remember to my personal notebook

---

### 5.8 Nearby Libraries / Bookshops

**Description:** A geolocation-powered discovery feature for local reading spaces.

**Requirements:**
- Request browser geolocation permission on mount
- Query Geoapify Places API for libraries and bookshops within a set radius
- Display results on an interactive map with pins
- Show name, address, and distance for each result

**User Stories:**
- As a user, I can discover libraries and bookshops near my current location

---

### 5.9 Profile & Personalisation

**Description:** A reader identity page with avatar selection and preference management.

**Requirements:**
- Display reading stats: currently reading, finished, want-to-read counts
- Edit display name (saved to Firebase Auth profile)
- Choose from 6 illustrated character avatars: Godzilla, Pigeon, Space Penguin, Wizard, Buff Cat, Business Cat
- Avatar choice persisted to localStorage per user UID
- Genre preference picker (15 genre options) for future personalisation
- Account management: sign out
- "Member since" date shown
- Random reading quote shown on profile

**User Stories:**
- As a user, I can choose my character avatar to personalise my profile
- As a user, I can update my display name at any time
- As a user, I can see a summary of my reading history on my profile

---

### 5.10 Theme System (Light / Dark Mode)

**Description:** A physics-based theme toggle inspired by a hanging lamp cord.

**Requirements:**
- Animated Verlet-physics rope simulation draggable by the user
- Pulling the cord toggles between light and dark modes
- Theme persisted to `localStorage`
- Full CSS custom property system — all colors, fonts, and shadows respond to `[data-theme="dark"]`
- Ink-on-paper aesthetic in light mode; dark parchment in dark mode

---

## 6. Technical Architecture

### 6.1 Frontend Architecture

```
React 19 (SPA)
├── React Router DOM v7 — client-side routing
├── Framer Motion 12 — page transitions + micro-animations
├── Context API — AuthContext, ThemeContext, ModeContext
├── Vanilla CSS — design system with CSS custom properties
└── Rough.js — hand-drawn sketch shapes
```

### 6.2 Backend Architecture

```
Firebase
├── Firebase Auth — Email/Password + Google OAuth
├── Firestore — NoSQL document database
│   ├── /users/{uid}
│   ├── /books/{bookId}       — per-user book records
│   ├── /quotes/{quoteId}     — per-user quotes
│   ├── /wordNotes/{noteId}   — per-user vocabulary
│   └── /bookclubs/{clubId}
│       ├── /messages/{msgId}  — real-time chat
│       └── /meetings/{meetingId}
└── Firebase Storage — (reserved for avatars v2)
```

### 6.3 External APIs

| API | Purpose | Auth Required |
|-----|---------|--------------|
| Google Books API v1 | Book search & metadata | Optional (API key) |
| Open Library Search API | Live recommendations | None |
| Free Dictionary API | Word definitions | None |
| Geoapify Places API | Nearby libraries | API key required |

### 6.4 Data Flow — Recommendations
```
User Library (Firestore)
  → deriveGenresFromLibrary() [weighted scoring]
  → fetchRecommendations(genres, ownedTitles) [Open Library API]
  → Deduplicated results displayed on Dashboard
```

### 6.5 Data Flow — Book Clubs (Real-time)
```
User sends message
  → addDoc() to /bookclubs/{id}/messages
  → onSnapshot() listener on all clients fires
  → UI re-renders with new message within ~200ms
```

---

## 7. Design System

### 7.1 Visual Identity — "Ink on Paper"
BookBuddy uses a handcrafted notebook aesthetic as its core design language:
- **Borders:** Organic sketch-style SVG borders (255px/15px alternating radius)
- **Shadows:** Flat offset box shadows — `5px 5px 0 var(--color-ink)`
- **Backgrounds:** Lined paper texture using `repeating-linear-gradient`
- **Typography:** Google Fonts — sketch/display + study/body typefaces
- **Decorations:** Doodle stars, zigzag dividers, arrow accents, stamp badges
- **Micro-animations:** Spring physics-based animations via Framer Motion

### 7.2 CSS Custom Properties (Design Tokens)

| Token | Light Value | Dark Value |
|-------|-------------|------------|
| `--color-ink` | `#1a1a1a` | `#e8dfc0` |
| `--color-paper` | `#fffef6` | `#1e1a12` |
| `--color-pencil` | `#6b5f4e` | `#a8956e` |
| `--color-paper-dark` | `#f0ebe0` | `#2a2318` |
| `--font-sketch` | Architects Daughter | same |
| `--font-study` | Kalam / Nunito | same |

---

## 8. Security Considerations

- All user-data Firestore collections are protected by security rules — only authenticated users can read/write their own data
- Environment variables (API keys) are never committed to the repository — `.env` is gitignored
- Book club messages are only accessible to club members (verified via Firestore rules with `memberIds` array check)
- Firebase Auth handles all password hashing and token management

---

## 9. Constraints & Assumptions

| Constraint | Detail |
|-----------|--------|
| Google Books API quota | 1000 requests/day unauthenticated; API key raises this limit |
| Open Library | Free, no rate limit documented — suitable for low-volume recommendations |
| Geoapify | Free tier: 3000 req/day — sufficient for personal use |
| Firebase Free Tier | 50K reads/day, 20K writes/day — sufficient for personal/small group use |
| No offline support | App requires internet connection; no service worker / PWA in v1 |

---

## 10. Roadmap (Post v1.0)

| Priority | Feature |
|----------|---------|
| P1 | Social profiles — follow friends, see their reading activity |
| P1 | Reading challenges — annual goal setting with progress tracking |
| P2 | Custom lists — "Best of 2024", "Favourites", themed lists |
| P2 | Export library — PDF/CSV download of reading history |
| P2 | Book rating comments / reviews on individual book pages |
| P3 | Push notifications for book club messages |
| P3 | PWA / offline mode with service worker |
| P3 | Integration with Goodreads CSV import for migration |
| P3 | Mobile native app (React Native) |

---

## 11. Appendix

### 11.1 Routes

| Path | Component | Protected |
|------|-----------|-----------|
| `/` | Landing | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Dashboard | Yes |
| `/library` | Library | Yes |
| `/explore` | Explore | Yes |
| `/book/:bookId` | BookDetail | Yes |
| `/profile` | Profile | Yes |
| `/bookclubs` | BookClub | Yes |

### 11.2 Firestore Collections

```
users/
  {uid}/
    name, email, avatarUrl, preferredGenres, createdAt

books/
  {bookId}/
    userId, title, author, genres[], status, currentPage,
    totalPages, rating, coverUrl, notes, createdAt

quotes/
  {quoteId}/
    userId, bookTitle, author, text, page, createdAt

wordNotes/
  {noteId}/
    userId, word, definition, phonetic, partOfSpeech, createdAt

bookclubs/
  {clubId}/
    name, bookTitle, bookAuthor, description, createdBy,
    creatorName, memberIds[], members[], createdAt
    
    messages/
      {msgId}/
        text, uid, senderName, createdAt
    
    meetings/
      {meetingId}/
        title, date, time, link, agenda,
        createdBy, creatorName, rsvps[], createdAt
```

---

*BookBuddy PRD v1.0 — April 2025*
