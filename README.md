# 📚 FlexiStudy Web — AI-Powered Learning Platform

A full-stack, AI-powered study platform built with **Next.js 14 (App Router)**, **Firebase**, and **Groq AI**. It generates interactive video lessons, quizzes, flashcards, and tracks student progress — all in one app.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth & DB | Firebase (Auth + Firestore) |
| AI / LLM | Groq API (`llama-3.3-70b-versatile`) |
| TTS | Browser `SpeechSynthesis` API |
| Icons | `lucide-react` |
| Charts | `recharts` |
| Animations | `canvas-confetti` |

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Groq AI
GROQ_API_KEY=
```

---

## 🗂️ Full File Structure

```
FlexiStudy-Web/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          ← Root layout (fonts, providers)
│   │   ├── globals.css                         ← Global styles + Tailwind theme tokens
│   │   ├── page.tsx                            ← Landing page (marketing homepage)
│   │   │
│   │   ├── (auth)/                             ← Auth route group (no sidebar)
│   │   │   ├── login/page.tsx                  ← Login page (email/password + Google)
│   │   │   └── signup/page.tsx                 ← Sign-up page (email/password + Google)
│   │   │
│   │   ├── (dashboard)/                        ← Dashboard route group (with sidebar)
│   │   │   ├── layout.tsx                      ← Dashboard layout (sidebar + topbar wrapper)
│   │   │   ├── dashboard/page.tsx              ← Home dashboard (XP, streaks, stats)
│   │   │   ├── courses/page.tsx                ← Courses list page
│   │   │   ├── lesson/page.tsx                 ← Individual lesson viewer
│   │   │   ├── practice/
│   │   │   │   ├── page.tsx                    ← Practice hub (topic input → video generation)
│   │   │   │   └── video/
│   │   │   │       └── [topic]/
│   │   │   │           ├── page.tsx            ← AI Video player page
│   │   │   │           ├── mcq/page.tsx        ← Post-video quiz (MCQ with confetti)
│   │   │   │           └── results/page.tsx    ← Score summary + related topics
│   │   │   ├── flashcards/page.tsx             ← Flashcard study mode
│   │   │   ├── analytics/page.tsx              ← Learning analytics (recharts graphs)
│   │   │   ├── history/page.tsx                ← Session history log
│   │   │   ├── streaks/page.tsx                ← Daily streak tracker
│   │   │   ├── achievements/page.tsx           ← Badges and achievement wall
│   │   │   └── settings/page.tsx               ← User profile & preferences
│   │   │
│   │   ├── api/
│   │   │   ├── generate-lesson/route.ts        ← (Legacy) Single-call lesson generator
│   │   │   ├── tts/route.ts                    ← Text-to-speech audio endpoint
│   │   │   └── practice/
│   │   │       └── video/
│   │   │           └── compile/route.ts        ← Master AI video generation route
│   │   │
│   │   └── test-firebase/page.tsx              ← Dev-only Firebase connection test
│   │
│   ├── components/
│   │   ├── providers.tsx                       ← React context providers wrapper
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx                     ← App sidebar (navigation links, user info)
│   │   │   └── topbar.tsx                      ← Top header bar (page title, logout)
│   │   │
│   │   ├── practice/
│   │   │   └── video/
│   │   │       ├── TopicSelector.tsx           ← Subject/topic picker UI (all subjects grid)
│   │   │       ├── InteractiveVideoPlayer.tsx  ← Main video player (TTS + scene sync)
│   │   │       ├── SceneRenderer.tsx           ← Routes scenes to the right component
│   │   │       └── scenes/
│   │   │           ├── TextScene.tsx           ← Full-screen heading + body slide
│   │   │           ├── ComparisonScene.tsx     ← Two-column compare slide
│   │   │           ├── CodeScene.tsx           ← Code block with Mac-chrome window
│   │   │           └── TerminalScene.tsx       ← Typewriter terminal animation slide
│   │   │
│   │   ├── interactive/                        ← Interactive lesson sub-components
│   │   ├── ui/                                 ← Shared UI primitives (buttons, cards, etc.)
│   │   └── video/                              ← Standalone video utility components
│   │
│   ├── hooks/
│   │   └── useAuth.ts                          ← Firebase auth state hook (currentUser, loading)
│   │
│   └── lib/
│       ├── firebase.ts                         ← Firebase app + Auth + Firestore init
│       ├── types.ts                            ← Global TypeScript types
│       ├── utils.ts                            ← Utility helpers (cn, etc.)
│       ├── mock-data.ts                        ← Dev mock data for courses/lessons
│       ├── animations.ts                       ← Animation helper utilities
│       └── video/
│           └── types.ts                        ← VideoLesson, SceneData, SceneType types
```

---

## 📄 Page-by-Page Breakdown

### 🌐 `src/app/page.tsx` — Landing Page
The public-facing marketing page. Shows the product hero, features list, and CTA buttons linking to `/login` and `/signup`. No auth required.

---

### 🔐 Auth Pages (`src/app/(auth)/`)

#### `login/page.tsx`
- Email + Password sign-in via Firebase Auth
- Google Sign-In OAuth button
- On success: redirects to `/dashboard`

#### `signup/page.tsx`
- Email + Password account creation
- On sign-up: creates a Firestore user document at `users/{uid}` with default XP, streak, and profile data
- Google Sign-In also supported

---

### 🏠 Dashboard Pages (`src/app/(dashboard)/`)

All pages inside this group are protected by `useAuth`. Unauthenticated users are redirected to `/login`.

#### `dashboard/page.tsx`
- **XP Bar** — reads `users/{uid}.xp` from Firestore
- **Daily Streak** — day-of-week indicators, reads `.streak`
- **Accuracy & Rank** — calculated from Firestore session logs
- **Recent Activity** — last 5 sessions from Firestore

#### `courses/page.tsx`
- Lists available courses (from `lib/mock-data.ts` or Firestore)
- Each course card links to `lesson/page.tsx`

#### `lesson/page.tsx`
- Renders an individual lesson with content, headings, and progress tracking

#### `practice/page.tsx` — **Practice & Video Generation Hub**
- Subject grid (Math, Science, Technology, History, Geography, English)
- Custom topic text input
- On submit → navigates to `/practice/video/[topic]`
- The `TopicSelector` component pre-fills the topic input from a subject selection

#### `practice/video/[topic]/page.tsx` — **AI Video Player Page**
- Calls `/api/practice/video/compile` to generate the full lesson
- Shows a loading state while the AI generates content
- Mounts `InteractiveVideoPlayer` with the returned `VideoLesson` data
- After video: buttons to take the MCQ quiz or go back

#### `practice/video/[topic]/mcq/page.tsx` — **MCQ Quiz Page**
- Renders the multiple-choice questions generated by the AI
- Tracks selected answers, shows correct/incorrect feedback
- Fires `canvas-confetti` on perfect score
- Shows score and "Try Again" / "See Results" options

#### `practice/video/[topic]/results/page.tsx` — **Results Page**
- Displays final score, notes summary from the AI
- Lists suggested related topics

#### `flashcards/page.tsx`
- Flashcard study mode with flip animation
- Cards sourced from Firestore or mock data

#### `analytics/page.tsx`
- Recharts line/bar charts for XP over time, accuracy trends
- Reads from Firestore session logs

#### `history/page.tsx`
- Chronological list of completed lessons and quiz sessions

#### `streaks/page.tsx`
- Visual streak calendar, current streak count, best streak

#### `achievements/page.tsx`
- Badge wall - unlocked achievements highlighted, locked ones grayed out

#### `settings/page.tsx`
- Update display name, email preferences
- Firebase Auth profile update

---

## 🤖 AI Video Generation — Core Logic

### Flow Overview

```
User enters topic
      ↓
POST /api/practice/video/compile
      ↓        ↓         ↓         ↓
  Script    Scenes     MCQs     Notes
  (Groq)    (Groq)    (Groq)   (Groq)
      ↓
VideoLesson JSON returned
      ↓
InteractiveVideoPlayer renders scenes
SpeechSynthesis narrates the script
Scenes auto-advance by duration
      ↓
MCQ Quiz → Results
```

### `src/app/api/practice/video/compile/route.ts`
The **master orchestration route**. Called with `POST { topic }`.

1. **Script generation** — prompts Groq to write a 60-second educational narration script for the topic
2. **Scene generation** — prompts Groq to produce exactly **6 visual scenes** (JSON array) summing to **60,000ms** total. Each scene has a `type` and `data` payload
3. **MCQ generation** — 5 multiple-choice questions based on the script
4. **Notes generation** — a structured notes/summary object
5. Returns a single `VideoLesson` JSON object

**Groq Model:** `llama-3.3-70b-versatile`

### `src/app/api/generate-lesson/route.ts`
Legacy single-call route (kept for backward compatibility). Generates a simplified lesson object.

### `src/app/api/tts/route.ts`
Text-to-speech helper route. Accepts `{ text }` and returns audio data using the browser or a TTS service.

---

## 🎬 Video Player Components

### `InteractiveVideoPlayer.tsx`
```
Props: { lesson: VideoLesson }
```
- Renders `SceneRenderer` for the current scene
- Uses `window.speechSynthesis` to narrate `lesson.script`
- Voice priority: `Google US English` → `Samantha` → `Zira` → any `en-US`
- Uses `requestAnimationFrame` to track elapsed time and auto-advance scenes
- **UI:** Dark cinematic chrome with header bar, gradient progress bar, slide dot indicators, play/pause/restart controls

### `SceneRenderer.tsx`
```
Props: { scene: SceneData }
```
- Switches on `scene.type` and mounts the correct scene component

### Scene Components

| Component | Scene Type | Description |
|---|---|---|
| `TextScene` | `TextScene` | Full-screen colored background with heading + body text |
| `ComparisonScene` | `ComparisonScene` | Two-column split with left/right titles and bodies |
| `CodeScene` | `CodeScene` | Mac-chrome code window with syntax-colored code block |
| `TerminalScene` | `TerminalScene` | Animated typewriter terminal with `$` prompt lines |

### `TopicSelector.tsx`
- Grid of 6 subject cards (Math, Science, Technology, History, Geography, English)
- Each card has sub-topics shown on hover
- Clicking a sub-topic fills the parent page's topic input

---

## 🔐 Auth & Data Layer

### `src/hooks/useAuth.ts`
- Wraps `onAuthStateChanged` from Firebase
- Returns `{ currentUser, loading }`
- Used in all protected pages and the sidebar

### `src/lib/firebase.ts`
- Initializes Firebase App
- Exports `auth` (Firebase Auth instance) and `db` (Firestore instance)

### Firestore Collections

| Collection | Document | Fields |
|---|---|---|
| `users` | `{uid}` | `name`, `email`, `xp`, `streak`, `bestStreak`, `accuracy`, `rank`, `createdAt` |
| `sessions` | `{uid}/sessions/{id}` | `topic`, `score`, `mode`, `timestamp` |

---

## 🧩 Types

### `src/lib/video/types.ts`
```ts
type SceneType = "TextScene" | "ComparisonScene" | "CodeScene" | "TerminalScene";

interface SceneData {
  type: SceneType;
  duration: number; // milliseconds
  data: any;
}

interface VideoLesson {
  topic: string;
  script: string;      // TTS narration text (60-second)
  scenes: SceneData[]; // exactly 6 scenes
  mcqs: any[];
  notes: any;
}
```

### `src/lib/types.ts`
Global shared types: `User`, `Course`, `Lesson`, `Flashcard`, `Achievement`, etc.

---

## ⚡ Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

---

## 📦 Key Dependencies

| Package | Purpose |
|---|---|
| `next` | Framework |
| `firebase` | Auth + Firestore |
| `groq-sdk` | Groq AI API client |
| `lucide-react` | Icons |
| `recharts` | Analytics charts |
| `canvas-confetti` | Quiz celebration effect |
| `tailwindcss` | Utility-first CSS |

---

## 🗺️ Route Map

```
/                           → Landing page
/login                      → Login
/signup                     → Sign up
/dashboard                  → Home dashboard
/courses                    → Course catalogue
/lesson                     → Lesson viewer
/practice                   → Practice hub & video generation
/practice/video/[topic]     → AI video player
/practice/video/[topic]/mcq → Post-video quiz
/practice/video/[topic]/results → Score & notes
/flashcards                 → Flashcard study
/analytics                  → Learning analytics
/history                    → Session history
/streaks                    → Streak tracker
/achievements               → Achievement badges
/settings                   → User settings
```
