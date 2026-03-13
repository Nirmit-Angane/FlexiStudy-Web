# FlexiStudy — Complete Application Flow
### HACKSTOMP · 24-Hour Hackathon · Ed Tech Domain
### PS-4: Adaptive Learning Styles · Student Only Role

---

> **HOW TO READ THIS DOCUMENT**
> This document covers every single screen, every state, every transition,
> every Firebase read/write, and every AI call — for both apps from start to end.
> Flutter Mobile = where learning happens.
> Next.js Web = where the student reviews progress.

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Firebase Collections Overview](#2-firebase-collections-overview)
3. [Flutter Mobile App — Complete Flow](#3-flutter-mobile-app--complete-flow)
   - 3.1 Splash Screen
   - 3.2 Auth Screen
   - 3.3 Home Screen
   - 3.4 Topic Input Screen
   - 3.5 Style Selector Screen ← Hero Screen
   - 3.6 Generation Progress Screen
   - 3.7 Lesson Player Screen ← Core Experience
   - 3.8 Quiz Screen
   - 3.9 Result Screen
   - 3.10 Lesson History Screen
   - 3.11 Profile Screen
4. [Next.js Web App — Complete Flow](#4-nextjs-web-app--complete-flow)
   - 4.1 Login Page
   - 4.2 Dashboard Page ← Hero Page
   - 4.3 History Page
   - 4.4 Analytics Page
   - 4.5 Lesson Detail Page
5. [Cross-App Real-Time Sync Flow](#5-cross-app-real-time-sync-flow)
6. [AI API Call Flow — All 4 Prompts](#6-ai-api-call-flow--all-4-prompts)
7. [Complete Navigation Maps](#7-complete-navigation-maps)
8. [State Management — GetX Controllers](#8-state-management--getx-controllers)
9. [Error States — Every Screen](#9-error-states--every-screen)
10. [Demo Day Flow — Exact Sequence](#10-demo-day-flow--exact-sequence)

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

```
┌──────────────────────────────────────────────────────────────┐
│                     STUDENT (one role)                       │
└──────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                ┌─────────────────────┐
│  FLUTTER APP    │                │   NEXT.JS WEB APP   │
│  (Android)      │                │   (Vercel)          │
│                 │                │                     │
│  Where learning │                │  Where progress     │
│  happens        │                │  is reviewed        │
└────────┬────────┘                └──────────┬──────────┘
         │                                    │
         │  Firebase Auth (same account)      │
         │  Firestore onSnapshot (real-time)  │
         │  Firebase Storage                  │
         └──────────────┬─────────────────────┘
                        │
                        ▼
             ┌─────────────────┐
             │    FIREBASE     │
             │                 │
             │  Auth           │
             │  Firestore      │
             │  Storage        │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │  NEXT.JS API    │
             │  ROUTES         │
             │                 │
             │ /generate-lesson│
             │ /generate-quiz  │
             │ /suggest-style  │
             │ /student-       │
             │  analytics      │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │   GEMINI API    │
             │ (OpenAI backup) │
             └─────────────────┘
```

---

## 2. FIREBASE COLLECTIONS OVERVIEW

```
Firestore
│
├── users/
│   └── {userId}/
│       ├── displayName
│       ├── email
│       ├── role: "student"
│       ├── preferredStyle
│       ├── xpTotal
│       ├── streakCount
│       └── lastActiveDate
│
├── lessons/
│   └── {lessonId}/
│       ├── userId
│       ├── topic
│       ├── subject
│       ├── difficulty
│       ├── style
│       ├── slidesJson
│       ├── status: "generating" | "ready" | "failed"
│       ├── slideCount: 5
│       └── slides/ (subcollection)
│           └── {slideId}/
│               ├── slideIndex (1–5)
│               ├── type
│               ├── title
│               ├── content
│               └── styleHint
│
├── quizResults/
│   └── {resultId}/
│       ├── userId
│       ├── lessonId
│       ├── topic
│       ├── style
│       ├── score (0–5)
│       ├── totalQuestions: 5
│       ├── passed (score >= 3)
│       ├── answers (array)
│       ├── xpEarned
│       └── retryStyle
│
└── styleProgress/
    └── {progressId}/
        ├── userId
        ├── style
        ├── totalAttempts
        ├── totalScore
        ├── avgScore
        └── topicsStudied (array)
```

---

## 3. FLUTTER MOBILE APP — COMPLETE FLOW

---

### 3.1 SPLASH SCREEN

**Route:** `/splash`
**GetX Controller:** `SplashController`
**Firebase:** Auth state check only

---

#### What the user sees:
```
┌─────────────────────────┐
│                         │
│                         │
│       [App Logo]        │
│       FlexiStudy        │
│    "Learn your way."    │
│                         │
│   [Animated gradient    │
│    background fade-in]  │
│                         │
│                         │
└─────────────────────────┘
```

#### Screen States:
| State | What Happens |
|---|---|
| App opens | Logo + tagline fade in (800ms) |
| Checking auth | Silent Firebase Auth check |
| User logged in | After 2s → navigate to Home |
| User not logged in | After 2s → navigate to Auth |

#### Code Flow:
```
onInit() {
  Future.delayed(2 seconds) {
    if (FirebaseAuth.currentUser != null) {
      Get.offAllNamed(Routes.HOME)
    } else {
      Get.offAllNamed(Routes.AUTH)
    }
  }
}
```

#### Animations:
- Logo: fade in + scale from 0.8 → 1.0 (600ms)
- Tagline: fade in with 300ms delay after logo
- Background: soft gradient animation (brand green tones)

#### No Firebase write on this screen.

---

### 3.2 AUTH SCREEN

**Route:** `/auth`
**GetX Controller:** `AuthController`
**Firebase:** Auth (Google Sign-In + Email/Password)

---

#### What the user sees:
```
┌─────────────────────────┐
│                         │
│   [Logo top-left]       │
│                         │
│   "Welcome to          │
│    FlexiStudy"          │
│   "Learn your way."     │
│                         │
│  ┌──────────────────┐   │
│  │  [Google Icon]   │   │
│  │ Continue with    │   │
│  │ Google           │   │
│  └──────────────────┘   │
│                         │
│         ── OR ──        │
│                         │
│  ┌──────────────────┐   │
│  │ Email address    │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │ Password         │   │
│  └──────────────────┘   │
│                         │
│  [Sign In]  [Sign Up]   │
│                         │
│  Forgot password?       │
└─────────────────────────┘
```

#### Screen Tabs:
- **Tab 1:** Sign In (email + password)
- **Tab 2:** Sign Up (name + email + password)
- **Google button** works on both tabs

#### Sign In Flow:
```
User enters email + password
→ AuthController.signInWithEmail()
→ Firebase Auth signInWithEmailAndPassword()
→ SUCCESS:
    AuthController.createOrUpdateUser()
    → Firestore: set users/{uid} with merge:true
    → Get.offAllNamed(Routes.HOME)
→ FAILURE:
    Show error toast via fluttertoast
    (wrong-password / user-not-found / network-error)
```

#### Sign Up Flow:
```
User enters name + email + password
→ AuthController.signUpWithEmail()
→ Firebase Auth createUserWithEmailAndPassword()
→ Firebase Auth updateDisplayName(name)
→ SUCCESS:
    Firestore: CREATE users/{uid}
    → displayName, email, role: "student"
    → xpTotal: 0, streakCount: 0
    → preferredStyle: null (not set yet)
    → createdAt, updatedAt
    → Get.offAllNamed(Routes.HOME)
→ FAILURE:
    Show error toast
    (email-already-in-use / weak-password)
```

#### Google Sign In Flow:
```
User taps "Continue with Google"
→ AuthController.signInWithGoogle()
→ GoogleSignIn().signIn()
→ Firebase Auth signInWithCredential()
→ Check: does users/{uid} exist in Firestore?
    → YES (returning user): update lastActiveDate
    → NO (new user): CREATE users/{uid} document
→ Get.offAllNamed(Routes.HOME)
```

#### Firestore Write on this screen:
```javascript
// New user document
users/{uid} = {
  userId: uid,
  displayName: "Student Name",
  email: "student@email.com",
  role: "student",
  preferredStyle: null,
  xpTotal: 0,
  streakCount: 0,
  lastActiveDate: today_ISO_string,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}
```

#### Validation Rules:
- Email: valid format check
- Password: minimum 6 characters
- Name (signup): minimum 2 characters
- All fields required — show inline error if empty

---

### 3.3 HOME SCREEN

**Route:** `/home`
**GetX Controller:** `HomeController`
**Firebase:** `onSnapshot` on users/{uid} + lessons (last 3)

---

#### What the user sees:
```
┌─────────────────────────┐
│  Good morning, Priya 👋 │
│  [Avatar]               │
│                         │
│  ┌──────┐  ┌──────────┐ │
│  │ 🔥 7 │  │Level 12  │ │
│  │ Days │  │Explorer  │ │
│  └──────┘  └──────────┘ │
│                         │
│  XP Progress            │
│  ████████░░  720/1000   │
│  280 XP to Level 13     │
│                         │
│  ┌────────────────────┐ │
│  │ ✨ Learn Something │ │
│  │    New             │ │
│  └────────────────────┘ │
│                         │
│  Continue Learning      │
│  ┌────────────────────┐ │
│  │ 📖 Newton's Laws   │ │
│  │ Example · 4/5 ★    │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │ 🎨 Photosynthesis  │ │
│  │ Visual · 5/5 ★     │ │
│  └────────────────────┘ │
│                         │
│  Try Today              │
│  [Math] [Science] [Code]│
│                         │
│ [Home][History][Profile]│ ← Bottom Nav
└─────────────────────────┘
```

#### Data Loaded via onSnapshot:
```
// 1. User document (real-time)
onSnapshot: users/{uid}
→ displayName, streakCount, xpTotal → render UI

// 2. Last 3 lessons (real-time)
onSnapshot: lessons
  .where("userId", "==", uid)
  .orderBy("createdAt", "desc")
  .limit(3)
→ render "Continue Learning" list
```

#### Streak Logic (in HomeController.onInit):
```
today = DateTime.now().toIso8601String().substring(0,10)
lastActiveDate = users/{uid}.lastActiveDate

IF lastActiveDate == today:
  → streak unchanged (already counted today)
IF lastActiveDate == yesterday:
  → streakCount += 1
  → update users/{uid}.streakCount
  → update users/{uid}.lastActiveDate = today
IF lastActiveDate is older:
  → streakCount = 1 (reset)
  → update users/{uid}
```

#### Bottom Navigation:
| Tab | Icon | Route |
|---|---|---|
| Home | House | /home (current) |
| History | Clock | /history |
| Profile | Person | /profile |

#### Suggestion Chips:
- Tapping a chip fills the topic input on the next screen
- Chips are: "Photosynthesis", "Fractions", "Newton's Laws", "Python", "World War 2"
- These are hardcoded — not fetched from AI

#### "Learn Something New" Button → navigates to `/topic-input`

---

### 3.4 TOPIC INPUT SCREEN

**Route:** `/topic-input`
**GetX Controller:** `LessonController`
**Firebase:** None (input only screen)

---

#### What the user sees:
```
┌─────────────────────────┐
│ ← Back                  │
│                         │
│  What do you want       │
│  to learn today?        │
│                         │
│  ┌────────────────────┐ │
│  │ 🔍 Type any topic  │ │
│  │ e.g. Photosynthesis│ │
│  └────────────────────┘ │
│                         │
│  Quick Pick             │
│  [📐 Algebra]           │
│  [🔬 Photosynthesis]    │
│  [💻 Python Functions]  │
│  [📖 French Revolution] │
│  [🌍 Water Cycle]       │
│                         │
│  Difficulty             │
│  [Easy] [Medium] [Hard] │
│  (Medium selected)      │
│                         │
│  ┌────────────────────┐ │
│  │     Next →         │ │
│  └────────────────────┘ │
│  (disabled until topic  │
│   is typed/selected)    │
└─────────────────────────┘
```

#### Input Validation:
```
IF topic.isEmpty → Next button disabled
IF topic.length < 3 → show inline hint "Be more specific"
IF topic.length > 100 → show error "Too long"
ELSE → Next button enabled (green)
```

#### Difficulty Options:
| Option | XP Multiplier |
|---|---|
| Easy | 1x (base 20 XP) |
| Medium | 1.5x (base 30 XP) |
| Hard | 2x (base 40 XP) |

#### Quick Pick Chip Tap:
```
onTap(chip) {
  topicController.text = chip.label
  LessonController.topic = chip.label
  LessonController.subject = chip.subject
}
```

#### "Next" Button:
```
LessonController.topic = input.text
LessonController.difficulty = selectedDifficulty
Get.toNamed(Routes.STYLE_SELECTOR)
```

#### No Firebase call on this screen.

---

### 3.5 STYLE SELECTOR SCREEN ← **HERO SCREEN**

**Route:** `/style-selector`
**GetX Controller:** `LessonController` (continued)
**Firebase:** None (selection only)

---

#### What the user sees:
```
┌─────────────────────────┐
│ ← Back                  │
│                         │
│  How do you want        │
│  to learn?              │
│  "Photosynthesis"       │
│                         │
│  ┌──────────┐ ┌───────┐ │
│  │ 🎨       │ │ 📖    │ │
│  │ Visual   │ │Example│ │
│  │ Learner  │ │       │ │
│  │ I learn  │ │ I     │ │
│  │ best     │ │under- │ │
│  │ through  │ │stand  │ │
│  │ diagrams │ │ via   │ │
│  │          │ │stories│ │
│  └──────────┘ └───────┘ │
│  ┌──────────┐ ┌───────┐ │
│  │ 🔨       │ │ 🎮    │ │
│  │Practical │ │Inter- │ │
│  │  Doer    │ │active │ │
│  │ I learn  │ │       │ │
│  │ by doing │ │Quizzes│ │
│  │ hands-on │ │& games│ │
│  │ tasks    │ │       │ │
│  └──────────┘ └───────┘ │
│                         │
│  ┌────────────────────┐ │
│  │  Generate My       │ │
│  │  Lesson ✨         │ │
│  └────────────────────┘ │
│  (disabled until card   │
│   is selected)          │
└─────────────────────────┘
```

#### Card States — All 4 Cards:

| State | Visual Change |
|---|---|
| Default | White card, grey border, grey icon |
| Hover/Press | Lift shadow, colored border, colored icon |
| Selected | Colored gradient bg, strong border, top accent bar, checkmark ✓ top-right |

#### Style Color Map:
| Style | Border | Background Gradient | Icon BG |
|---|---|---|---|
| Visual | #4A7FC1 | white → #EEF4FE | #EEF4FE |
| Example | #F5A623 | white → #FEF7E8 | #FEF7E8 |
| Practical | #3D8B71 | white → #EAF4F0 | #EAF4F0 |
| Interactive | #A06CB0 | white → #F4EDF8 | #F4EDF8 |

#### Card Selection Logic:
```
onTap(card) {
  // Single select — only one card can be active
  LessonController.selectedStyle = card.style
  // All other cards → deselect
  // This card → selected state
  // "Generate My Lesson" button → enabled
}
```

#### "Generate My Lesson" Button Tap:
```
1. LessonController.style = selectedStyle
2. Create lesson document in Firestore:
   Firestore: ADD lessons/{newLessonId}
   {
     userId: uid,
     topic: topic,
     difficulty: difficulty,
     style: style,
     status: "generating",
     slideCount: 5,
     subject: auto-detected from topic keywords,
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
3. Store lessonId in LessonController
4. Call Next.js API: POST /api/generate-lesson
   (fire and don't wait — onSnapshot handles the response)
5. Get.toNamed(Routes.GENERATION_PROGRESS)
```

#### Subject Auto-Detection Logic (in LessonController):
```
topic = topic.toLowerCase()
IF topic contains [algebra, calculus, geometry, fraction, trigonometry, equation] → "Mathematics"
IF topic contains [photosynthesis, cell, newton, atom, biology, chemistry, physics] → "Science"
IF topic contains [python, html, code, algorithm, function, javascript, array] → "Technology"
IF topic contains [war, revolution, history, empire, independence, democracy] → "History"
IF topic contains [climate, geography, soil, water cycle, plate, continent] → "Geography"
IF topic contains [grammar, essay, tense, verb, noun, writing, english] → "English"
IF topic contains [demand, supply, gdp, inflation, budget, economy] → "Economics"
ELSE → "General"
```

---

### 3.6 GENERATION PROGRESS SCREEN

**Route:** `/generation-progress`
**GetX Controller:** `LessonController`
**Firebase:** `onSnapshot` on lessons/{lessonId}

---

#### What the user sees:
```
┌─────────────────────────┐
│                         │
│  Creating your lesson…  │
│  "Photosynthesis"       │
│  📖 Example Style       │
│                         │
│  ┌────────────────────┐ │
│  │ ✅ Understanding   │ │
│  │    your topic      │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │ ✅ Crafting your   │ │
│  │    lesson style    │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │ ⏳ Writing         │ │  ← animated pulse
│  │    content...      │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │ ⬜ Building slides  │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │ ⬜ Preparing quiz   │ │
│  └────────────────────┘ │
│                         │
│  ████████████░░  ~12s   │
│                         │
│  "Did you know? Visual  │
│   learners retain 65%   │
│   more info with color" │
│  (fun fact rotates)     │
│                         │
└─────────────────────────┘
```

#### Steps Animation Timing:
| Step | Trigger | Delay |
|---|---|---|
| Step 1 ✅ | Screen opens | Immediate |
| Step 2 ✅ | 1.5s after screen open | 1.5s |
| Step 3 ⏳ | 2.5s after screen open | 2.5s (pulse) |
| Step 4 ⬜→✅ | onSnapshot status change | When API responds |
| Step 5 ⬜→✅ | 500ms after step 4 | +500ms |

#### onSnapshot Logic:
```
FirebaseFirestore.instance
  .collection('lessons')
  .doc(lessonId)
  .snapshots()
  .listen((snapshot) {
    status = snapshot.data()['status']

    IF status == "ready":
      // Mark steps 4 and 5 complete
      await Future.delayed(800ms) // let animation finish
      Get.offNamed(Routes.LESSON_PLAYER,
        arguments: {'lessonId': lessonId})

    IF status == "failed":
      showErrorDialog()
      Get.back()
  })
```

#### Fun Facts (rotate every 3 seconds):
- "Visual learners retain 65% more information with color-coded content."
- "Example-based learning increases concept retention by 40%."
- "Hands-on learners process information through muscle memory."
- "Interactive quizzes improve long-term memory formation."
- "Spaced repetition improves recall by up to 200%."

#### Error State:
```
IF API returns error OR status == "failed" after 30s:
  Show error dialog:
  "Could not generate lesson"
  "We couldn't connect to our AI. Please try again."
  [Try Again] → calls API again
  [Back to Home] → Get.offAllNamed(Routes.HOME)
```

#### Back Button Behavior:
- **Disabled** on this screen — student cannot go back while generating
- Android back press → shows "Cancel lesson?" dialog

---

### 3.7 LESSON PLAYER SCREEN ← **CORE EXPERIENCE**

**Route:** `/lesson-player`
**GetX Controller:** `LessonPlayerController`
**Firebase:** Read lessons/{lessonId}/slides (5 documents)

---

#### What the user sees (Visual Style example):
```
┌─────────────────────────┐
│ ✕                       │ ← Exit (with confirm dialog)
│ Photosynthesis          │
│ ████████████░░░░  2/5   │ ← Progress bar
│ [🎨 Visual Mode]        │ ← Style badge
│                         │
│  ┌────────────────────┐ │
│  │                    │ │
│  │  🌿 What Is        │ │
│  │  Photosynthesis?   │ │
│  │                    │ │
│  │  ████ GREEN ████   │ │ ← Color block
│  │  Plants capture    │ │
│  │  sunlight using    │ │
│  │  chlorophyll, the  │ │
│  │  green pigment     │ │
│  │  that gives leaves │ │
│  │  their color.      │ │
│  │                    │ │
│  │  ☀️ → 🌿 → 🍃     │ │ ← Visual flow
│  │  Sun → Leaf → Food │ │
│  │                    │ │
│  └────────────────────┘ │
│                         │
│  [← Prev]   [Next →]    │
│                         │
└─────────────────────────┘
```

#### Style-Specific Rendering:

**🎨 Visual Style — SlideWidget:**
```
- Color block at top (subject color)
- Icon representing the concept
- Bold keywords highlighted in brand color
- Visual flow arrows: A → B → C
- Step-by-step numbered breakdown
- Background: subtle gradient
```

**📖 Example Style — SlideWidget:**
```
- Quote mark decoration at top
- Narrative text in relaxed line height
- "Imagine you are..." styled in italic
- Story scenario card with warm background
- Character/scenario name label
- No numbered lists — flowing prose
```

**🔨 Practical Style — SlideWidget:**
```
- "Try This:" header label
- Numbered checklist items
- Action verb in bold at start of each step
- Materials list if needed
- "What you'll observe:" section
- Green accent for action items
```

**🎮 Interactive Style — SlideWidget:**
```
- Question pause card (full-width)
- "What do you think happens next?" prompt
- MCQ options as tappable chips
- Immediate feedback: ✅ or ❌
- Explanation shown after answer
- "Continue" button to proceed to next slide
- These count as practice — NOT part of the quiz score
```

#### Slide Navigation Logic:
```
currentSlide: Rx<int> = 1.obs

onNext() {
  IF currentSlide < 5:
    currentSlide++
    animate slide transition (slide left)
  ELSE (on slide 5):
    "Next" button text becomes "Take Quiz →"
    onTap → Get.toNamed(Routes.QUIZ)
}

onPrev() {
  IF currentSlide > 1:
    currentSlide--
    animate slide transition (slide right)
  IF currentSlide == 1:
    "Prev" button disabled
}
```

#### Exit Button (✕ top-left):
```
showDialog:
"Exit Lesson?"
"Your progress won't be saved if you exit now."
[Keep Learning] → dismiss dialog
[Exit] → Get.offAllNamed(Routes.HOME)
```

#### Progress Bar:
```
width = (currentSlide / 5) * 100%
color = style-specific color
animated via AnimatedContainer (300ms)
```

---

### 3.8 QUIZ SCREEN

**Route:** `/quiz`
**GetX Controller:** `QuizController`
**Firebase:** None during quiz (write only on submit)

---

#### What the user sees:
```
┌─────────────────────────┐
│ Quiz Time! 🎯           │
│ Photosynthesis          │
│ ████░░░░░░  Q2 of 5     │ ← Progress bar
│                         │
│  ┌────────────────────┐ │
│  │                    │ │
│  │  What is the main  │ │
│  │  role of           │ │
│  │  chlorophyll in    │ │
│  │  photosynthesis?   │ │
│  │                    │ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │  A) Store water    │ │  ← tap to select
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │  B) Absorb sunlight│ │  ← SELECTED (highlighted)
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │  C) Produce oxygen │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │  D) Transport food │ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │   Submit Answer    │ │
│  └────────────────────┘ │
└─────────────────────────┘
```

#### Answer States:

| State | Visual |
|---|---|
| Unselected | White card, grey border |
| Selected (pending) | Brand green border, light green bg |
| Correct (after submit) | Green bg, ✅ icon, green border |
| Wrong (after submit) | Red bg, ❌ icon + correct answer shown |

#### Question Flow:
```
// Quiz data loaded from LessonController.quizJson
// (returned by /api/generate-quiz, saved to LessonController)

onOptionSelect(index) {
  selectedAnswer = index
  submitButton → enabled
}

onSubmit() {
  isCorrect = (selectedAnswer == question.correctIndex)

  IF isCorrect:
    → green flash animation (FadeIn)
    → show ✅ on selected option
    → score++
    → wait 1.2s → next question
  ELSE:
    → red shake animation on selected option
    → show ❌ on selected option
    → highlight correct answer in green
    → show explanation text below
    → wait 1.8s → next question

  IF currentQuestion == 5 (last):
    → wait for animation
    → Get.toNamed(Routes.RESULT)
}
```

#### No Back Button on Quiz Screen.
Android back press → "Are you sure? Your quiz progress will be lost."

---

### 3.9 RESULT SCREEN

**Route:** `/result`
**GetX Controller:** `QuizController`
**Firebase:** WRITE to quizResults + UPDATE users + UPDATE styleProgress

---

#### PASS STATE (score ≥ 3/5):
```
┌─────────────────────────┐
│                         │
│  [Confetti Animation]   │
│                         │
│  🎉 Great work!         │
│                         │
│  ┌────────────────────┐ │
│  │  4 / 5             │ │
│  │  ★★★★☆             │ │
│  │  80%               │ │
│  └────────────────────┘ │
│                         │
│  +30 XP  (count-up)     │
│  🔥 Streak: 7 days!     │
│                         │
│  📖 Example Style       │
│  Photosynthesis         │
│                         │
│  ┌────────────────────┐ │
│  │  Back to Home      │ │
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │  Learn Another     │ │
│  └────────────────────┘ │
└─────────────────────────┘
```

#### FAIL STATE (score < 3/5):
```
┌─────────────────────────┐
│                         │
│  Let's try differently  │
│  🔄                     │
│                         │
│  ┌────────────────────┐ │
│  │  2 / 5             │ │
│  │  ★★☆☆☆             │ │
│  │  40%               │ │
│  └────────────────────┘ │
│                         │
│  "The example approach  │
│   was great but visual  │
│   diagrams might help   │
│   you grasp this better"│
│                         │
│  Try with:              │
│  ┌────────────────────┐ │
│  │ 🎨 Visual Learner  │ │ ← AI-suggested style card
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │  Retry with Visual │ │ ← PRIMARY CTA
│  └────────────────────┘ │
│  ┌────────────────────┐ │
│  │  Back to Home      │ │
│  └────────────────────┘ │
└─────────────────────────┘
```

#### Firestore Writes on this screen:

```javascript
// 1. Save quiz result
quizResults/{newId} = {
  userId: uid,
  lessonId: lessonId,
  topic: topic,
  style: style,
  score: score,
  totalQuestions: 5,
  passed: score >= 3,
  answers: answersArray,
  xpEarned: passed ? xpAmount : 0,
  retryStyle: aiSuggestedStyle || null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp()
}

// 2. Update user XP and streak (if passed)
users/{uid} = {
  xpTotal: increment(xpAmount),
  updatedAt: serverTimestamp()
}

// 3. Update style progress
styleProgress/{existing or new} = {
  userId: uid,
  style: style,
  totalAttempts: increment(1),
  totalScore: increment(score),
  avgScore: (totalScore + score) / totalAttempts,
  topicsStudied: arrayUnion(topic),
  updatedAt: serverTimestamp()
}

// 4. Update lesson status to "completed"
lessons/{lessonId} = {
  status: "completed",
  finalScore: score,
  updatedAt: serverTimestamp()
}
```

#### XP Calculation:
```
base = difficulty == "easy" ? 20 : difficulty == "medium" ? 30 : 40
bonus = score == 5 ? 10 : 0  // perfect score bonus
xpEarned = passed ? base + bonus : 0
```

#### Retry Flow:
```
onRetryTap() {
  LessonController.topic = same topic
  LessonController.difficulty = same difficulty
  LessonController.style = aiSuggestedStyle
  // Create new lesson document
  // Call /api/generate-lesson again
  Get.offNamed(Routes.GENERATION_PROGRESS)
}
```

---

### 3.10 LESSON HISTORY SCREEN

**Route:** `/history`
**GetX Controller:** `HistoryController`
**Firebase:** `onSnapshot` on lessons + quizResults

---

#### What the user sees:
```
┌─────────────────────────┐
│ My History              │
│                         │
│ [All][Visual][Example]  │ ← Filter chips row 1
│ [Practical][Interactive]│
│                         │
│ [All][Math][Science]    │ ← Filter chips row 2
│ [Tech][History][English]│
│                         │
│  ┌────────────────────┐ │
│  │ 🔬 SCIENCE         │ │ ← Subject color bar
│  │ Photosynthesis     │ │
│  │ [📖 Example] [4/5] │ │
│  │ Today · 3 mins ago │ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │ 📐 MATHEMATICS     │ │
│  │ Algebra: Quadratics│ │
│  │ [🎨 Visual] [5/5]  │ │
│  │ Yesterday · 2:30 PM│ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │ 💻 TECHNOLOGY      │ │
│  │ Python Functions   │ │
│  │ [🔨 Practical][2/5]│ │ ← failed (red chip)
│  │ 2 days ago         │ │
│  └────────────────────┘ │
│                         │
│ [Home][History][Profile]│
└─────────────────────────┘
```

#### Data Loading:
```
// Load all lessons for this user
onSnapshot: lessons
  .where("userId", "==", uid)
  .orderBy("createdAt", "desc")

// Join with quizResults
onSnapshot: quizResults
  .where("userId", "==", uid)
→ Match quizResults to lessons by lessonId
```

#### Filter Logic (in HistoryController):
```
activeStyleFilter: "all" | "visual" | "example" | "practical" | "interactive"
activeSubjectFilter: "all" | "mathematics" | "science" | ...

filteredLessons = allLessons
  .where(style matches activeStyleFilter OR activeStyleFilter == "all")
  .where(subject matches activeSubjectFilter OR activeSubjectFilter == "all")
```

#### Card Tap → Navigate to Lesson Detail (review mode):
```
Get.toNamed(Routes.LESSON_DETAIL,
  arguments: {'lessonId': lesson.id, 'mode': 'review'})
```

#### Empty State (no lessons yet):
```
"You haven't learned anything yet."
"Tap the button below to start your first lesson!"
[Start Learning →]
```

---

### 3.11 PROFILE SCREEN

**Route:** `/profile`
**GetX Controller:** `ProfileController`
**Firebase:** Read users/{uid} + aggregate from quizResults + styleProgress

---

#### What the user sees:
```
┌─────────────────────────┐
│ My Profile              │
│                         │
│        [Avatar]         │
│        Priya K.         │
│     student@email.com   │
│                         │
│  ┌─────────────────┐   │
│  │  📖 Example     │   │ ← Preferred style badge
│  │  Preferred Style│   │
│  └─────────────────┘   │
│                         │
│  ┌──────┐ ┌──────┐      │
│  │ XP   │ │Level │      │
│  │ 1250 │ │  12  │      │
│  └──────┘ └──────┘      │
│  ┌──────┐ ┌──────┐      │
│  │🔥Days│ │Total │      │
│  │  7   │ │  18  │      │
│  │Streak│ │Lesson│      │
│  └──────┘ └──────┘      │
│                         │
│  XP to Level 13         │
│  ████████████░░  80%    │
│                         │
│  Style Performance      │
│  🎨 Visual   ★★★★☆ 78% │
│  📖 Example  ★★★★★ 91% │
│  🔨 Practical ★★★☆☆ 62%│
│  🎮 Interactive ★★☆☆☆ 48%│
│                         │
│  [Sign Out]             │
│                         │
│ [Home][History][Profile]│
└─────────────────────────┘
```

#### Data Aggregation:
```
// Preferred style: style with highest avgScore from styleProgress
// Level: Math.floor(xpTotal / 1000) + 1
// XP progress: xpTotal % 1000

// Style performance bars: from styleProgress collection
onSnapshot: styleProgress
  .where("userId", "==", uid)
→ render 4 style rows with avgScore
```

#### Sign Out:
```
onSignOut() {
  await FirebaseAuth.instance.signOut()
  await GoogleSignIn().signOut()  // if google user
  Get.offAllNamed(Routes.AUTH)
}
```

---

## 4. NEXT.JS WEB APP — COMPLETE FLOW

---

### 4.1 LOGIN PAGE

**Route:** `/login`
**File:** `src/app/(auth)/login/page.tsx`
**Firebase:** Auth

---

#### What the user sees:
```
┌──────────────────────────────────────────────────┐
│  [FlexiStudy Logo]           "Learn your way."   │
│                                                  │
│         ┌────────────────────────────┐           │
│         │                            │           │
│         │  Welcome back              │           │
│         │  Sign in to your account   │           │
│         │                            │           │
│         │  ┌──────────────────────┐  │           │
│         │  │ [G] Sign in with     │  │           │
│         │  │     Google           │  │           │
│         │  └──────────────────────┘  │           │
│         │                            │           │
│         │  ── or continue with ──    │           │
│         │                            │           │
│         │  Email address             │           │
│         │  ┌──────────────────────┐  │           │
│         │  │                      │  │           │
│         │  └──────────────────────┘  │           │
│         │  Password                  │           │
│         │  ┌──────────────────────┐  │           │
│         │  │                      │  │           │
│         │  └──────────────────────┘  │           │
│         │                            │           │
│         │  ┌──────────────────────┐  │           │
│         │  │     Sign In          │  │           │
│         │  └──────────────────────┘  │           │
│         │                            │           │
│         │  Don't have an account?    │           │
│         │  Sign up here              │           │
│         └────────────────────────────┘           │
└──────────────────────────────────────────────────┘
```

#### Auth Flow (same as Flutter):
```typescript
// src/services/auth.service.ts
signInWithGoogle() → firebase.auth.GoogleAuthProvider
signInWithEmail(email, password) → firebase.auth.signInWithEmailAndPassword
signUp(name, email, password) → firebase.auth.createUserWithEmailAndPassword

// After sign in:
→ Check Firestore users/{uid} exists
→ If not: create document
→ router.push('/dashboard')
```

#### Auth Guard (middleware):
```typescript
// src/middleware.ts
IF user NOT authenticated AND trying to access /dashboard, /history, /analytics:
  → redirect to /login
IF user IS authenticated AND on /login:
  → redirect to /dashboard
```

---

### 4.2 DASHBOARD PAGE ← **HERO PAGE**

**Route:** `/dashboard`
**File:** `src/app/dashboard/page.tsx`
**Firebase:** `onSnapshot` on users/{uid} + lessons (recent 3) + quizResults

---

#### What the user sees:
```
┌──────────────────────────────────────────────────────────────┐
│ [FlexiStudy]  Dashboard  History  Analytics    [Avatar] [←]  │
│ Sidebar ←                                                     │
├─────────────┬────────────────────────────────────────────────┤
│ Navigation  │                                                 │
│             │  Good morning, Priya 👋  🔥 7 day streak       │
│ [Home]      │                                                 │
│ [History]   │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──┐  │
│ [Analytics] │  │ 18       │ │ 78%      │ │ 📖       │ │7 │  │
│             │  │ Lessons  │ │ Avg Score│ │ Best     │ │🔥│  │
│ [Profile]   │  │ Total    │ │          │ │ Style    │ │  │  │
│             │  └──────────┘ └──────────┘ └──────────┘ └──┘  │
│             │                                                 │
│             │  Today's Activity                               │
│             │  ┌───────────────────────────────────────────┐ │
│             │  │ "You completed 2 lessons today. Keep it  │ │
│             │  │  up! Your best style is Example (91%)."  │ │
│             │  └───────────────────────────────────────────┘ │
│             │                                                 │
│             │  ┌────────────────────┐  ┌──────────────────┐  │
│             │  │ Recent Lessons     │  │ Style Usage      │  │
│             │  │                   │  │    [Ring Chart]  │  │
│             │  │ ● Photosynthesis  │  │                  │  │
│             │  │   📖 Example 4/5  │  │  🎨 30%          │  │
│             │  │   3 mins ago      │  │  📖 45%          │  │
│             │  │                   │  │  🔨 15%          │  │
│             │  │ ● Algebra         │  │  🎮 10%          │  │
│             │  │   🎨 Visual 5/5   │  │                  │  │
│             │  │   Yesterday       │  │                  │  │
│             │  │                   │  │                  │  │
│             │  │ ● Python Basics   │  │                  │  │
│             │  │   🔨 Practical 2/5│  │                  │  │
│             │  │   2 days ago      │  │                  │  │
│             │  └────────────────────┘  └──────────────────┘  │
│             │                                                 │
│             │  XP Progress                                   │
│             │  Level 12 — Explorer                           │
│             │  █████████████░░░  1250 / 2000 XP              │
│             │  750 XP to Level 13                            │
│             │                                                 │
└─────────────┴───────────────────────────────────────────────┘
```

#### Data Sources:
```typescript
// src/hooks/useFirestore.ts

// 1. User data — real-time
useEffect(() => {
  const unsubUser = onSnapshot(
    doc(db, 'users', uid),
    (snap) => setUserData(snap.data())
  )
  return unsubUser
}, [uid])

// 2. Recent 3 lessons — real-time
useEffect(() => {
  const unsubLessons = onSnapshot(
    query(
      collection(db, 'lessons'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(3)
    ),
    (snap) => setRecentLessons(snap.docs.map(d => d.data()))
  )
  return unsubLessons
}, [uid])

// 3. Style distribution for ring chart
// Query styleProgress collection for userId == uid
// Calculate percentage per style
```

#### Style Ring Chart (Recharts):
```typescript
import { PieChart, Pie, Cell, Tooltip } from 'recharts'

data = [
  { name: 'Visual',      value: 30, color: '#4A7FC1' },
  { name: 'Example',     value: 45, color: '#F5A623' },
  { name: 'Practical',   value: 15, color: '#3D8B71' },
  { name: 'Interactive', value: 10, color: '#A06CB0' },
]

// Inner radius = donut hole
// Each slice = % of total attempts per style
```

#### Real-Time Wow Moment:
```
When student submits quiz on mobile:
→ quizResults write to Firestore
→ lessons document updated
→ Web dashboard onSnapshot fires
→ Recent lessons list updates
→ Stats row re-calculates
→ Style chart updates
ALL WITHOUT PAGE REFRESH
```

---

### 4.3 HISTORY PAGE

**Route:** `/history`
**File:** `src/app/history/page.tsx`
**Firebase:** `onSnapshot` on lessons + quizResults

---

#### What the user sees:
```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Learning History                               │
│            │                                                 │
│            │  Filter by Style:                               │
│            │  [All] [🎨 Visual] [📖 Example]                │
│            │  [🔨 Practical] [🎮 Interactive]                │
│            │                                                 │
│            │  Filter by Subject:                             │
│            │  [All] [Math] [Science] [Tech]                  │
│            │  [History] [Geography] [English] [Economics]    │
│            │                                                 │
│            │  Showing 18 lessons                             │
│            │                                                 │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │ ▌ SCIENCE (green bar)                   │   │
│            │  │ Photosynthesis                          │   │
│            │  │ [📖 Example] [4/5 ★★★★☆] [Today]       │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │ ▌ MATHEMATICS (amber bar)               │   │
│            │  │ Quadratic Equations                     │   │
│            │  │ [🎨 Visual] [5/5 ★★★★★] [Yesterday]    │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │ ▌ TECHNOLOGY (blue bar)                 │   │
│            │  │ Python Functions                        │   │
│            │  │ [🔨 Practical] [2/5 ★★☆☆☆] [2 days ago]│   │
│            │  │ [FAILED — tried 🎨 Visual instead]      │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

#### Filter Implementation:
```typescript
// src/app/history/page.tsx

const [styleFilter, setStyleFilter] = useState('all')
const [subjectFilter, setSubjectFilter] = useState('all')

const filteredLessons = allLessons.filter(lesson => {
  const matchStyle = styleFilter === 'all' || lesson.style === styleFilter
  const matchSubject = subjectFilter === 'all' || lesson.subject === subjectFilter
  return matchStyle && matchSubject
})
```

#### Card Click:
```typescript
onClick={() => router.push(`/lesson/${lesson.id}`)}
```

#### Score Chip Color:
```typescript
score >= 4 → badge-success (green)
score == 3 → badge-warning (amber)
score < 3  → badge-error (red) + "Retried" label
```

#### Skeleton Loading State:
```
Show 6 skeleton cards while data loads
Each skeleton: subject bar placeholder + title placeholder + badge placeholders
```

---

### 4.4 ANALYTICS PAGE

**Route:** `/analytics`
**File:** `src/app/analytics/page.tsx`
**Firebase:** Read quizResults + styleProgress + AI call for insights

---

#### What the user sees:
```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  My Analytics                                   │
│            │                                                 │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │  🤖 AI Insight                          │   │
│            │  │                                         │   │
│            │  │  "You learn best through examples.      │   │
│            │  │   Your example-style average (91%) is   │   │
│            │  │   significantly higher than your        │   │
│            │  │   interactive average (48%).             │   │
│            │  │   Consider revisiting Python Functions  │   │
│            │  │   using Example style."                  │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
│            │  Style Performance                              │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │ [Bar Chart — Recharts]                  │   │
│            │  │                                         │   │
│            │  │  Visual      ████████░░  78%            │   │
│            │  │  Example     █████████░  91%            │   │
│            │  │  Practical   ██████░░░░  62%            │   │
│            │  │  Interactive ████░░░░░░  48%            │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
│            │  Performance Over Time                          │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │ [Line Chart — last 10 quizzes]          │   │
│            │  │                                         │   │
│            │  │  5 ─────●──────────●──────●            │   │
│            │  │  4 ──●──────●─────────────────●        │   │
│            │  │  3 ──────────────●──────────────       │   │
│            │  │  2 ───────────────────────────────●    │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
│            │  Subjects Studied                               │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│            │  │ Science  │ │   Math   │ │   Tech   │       │
│            │  │ 8 lessons│ │ 6 lessons│ │ 4 lessons│       │
│            │  └──────────┘ └──────────┘ └──────────┘       │
│            │                                                 │
│            │  Topics to Revisit                             │
│            │  [Python Functions ↓2/5] [Calculus ↓2/5]      │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

#### AI Insight Call:
```typescript
// Called once when analytics page loads
// src/app/analytics/page.tsx

useEffect(() => {
  const fetchInsight = async () => {
    const results = await getQuizResults(uid)  // from Firestore
    const progress = await getStyleProgress(uid)

    const response = await fetch('/api/student-analytics', {
      method: 'POST',
      body: JSON.stringify({
        studentName: user.displayName,
        quizResults: results.slice(0, 10),
        topicsStudied: [...new Set(results.map(r => r.topic))],
        stylesUsed: results.map(r => r.style)
      })
    })
    const insight = await response.json()
    setAiInsight(insight)
  }
  fetchInsight()
}, [uid])
```

#### Charts Configuration:

**Style Performance Bar Chart (Recharts):**
```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

data = styleProgress.map(sp => ({
  name: sp.style,
  avgScore: Math.round(sp.avgScore * 20),  // out of 100
  fill: styleColors[sp.style]
}))
```

**Performance Over Time Line Chart (Recharts):**
```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

data = last10QuizResults.map((qr, i) => ({
  quiz: i + 1,
  score: qr.score,
  style: qr.style
}))
```

---

### 4.5 LESSON DETAIL PAGE

**Route:** `/lesson/[id]`
**File:** `src/app/lesson/[id]/page.tsx`
**Firebase:** Read lessons/{id}/slides subcollection + quizResults for this lesson

---

#### What the user sees:
```
┌──────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ← Back to History                             │
│            │                                                 │
│            │  Photosynthesis                                 │
│            │  [📖 Example] [🔬 Science] [Medium]            │
│            │  Completed · Today · Score: 4/5                 │
│            │                                                 │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │ Slide 1 of 5                            │   │
│            │  │ ───────────────────────────             │   │
│            │  │ What Is Photosynthesis?                 │   │
│            │  │                                         │   │
│            │  │ [Full slide content rendered here       │   │
│            │  │  in review mode — same style-specific  │   │
│            │  │  rendering as Flutter mobile app]       │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
│            │  [← Prev Slide]           [Next Slide →]       │
│            │   ●●○○○  (slide dots)                          │
│            │                                                 │
│            │  ─────────────────────────                      │
│            │                                                 │
│            │  Quiz Results                                   │
│            │  4 / 5 correct (80%)                           │
│            │                                                 │
│            │  Q1: ✅ Correct                                 │
│            │  Q2: ✅ Correct                                 │
│            │  Q3: ❌ Wrong (Correct: B)                      │
│            │  Q4: ✅ Correct                                 │
│            │  Q5: ✅ Correct                                 │
│            │                                                 │
│            │  ┌─────────────────────────────────────────┐   │
│            │  │  Retake Quiz                            │   │
│            │  └─────────────────────────────────────────┘   │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

#### Data Loading:
```typescript
// Read lesson document
const lessonDoc = await getDoc(doc(db, 'lessons', lessonId))

// Read all 5 slides from subcollection
const slidesSnap = await getDocs(
  query(
    collection(db, 'lessons', lessonId, 'slides'),
    orderBy('slideIndex', 'asc')
  )
)

// Read quiz result for this lesson
const quizSnap = await getDocs(
  query(
    collection(db, 'quizResults'),
    where('lessonId', '==', lessonId),
    where('userId', '==', uid)
  )
)
```

#### Retake Quiz:
```
"Retake Quiz" button → calls /api/generate-quiz with same lesson content
→ Opens quiz modal on this page
→ Saves new quizResult to Firestore
→ Updates page with new score
```

---

## 5. CROSS-APP REAL-TIME SYNC FLOW

```
THE WOW MOMENT EXPLAINED:

STEP 1: Student takes quiz on Flutter app
        ↓
STEP 2: QuizController.submitQuiz()
        ↓
STEP 3: Firestore writes:
        quizResults/{new} → created
        lessons/{id} → updated (status: "completed", score: 4)
        users/{uid} → updated (xpTotal += 30)
        styleProgress/{id} → updated (avgScore recalculated)
        ↓
STEP 4: Firebase broadcasts changes to ALL listeners
        ↓
STEP 5: Next.js Web Dashboard onSnapshot fires:
        ├── useEffect hook receives new snapshot
        ├── Recent lessons list → RE-RENDERS with new lesson
        ├── Stats row → RE-RENDERS with new XP + lesson count
        └── Style ring chart → RE-RENDERS with new percentages
        ↓
STEP 6: Web dashboard updates — NO refresh needed
        ↓
STEP 7: Judge sees both screens update simultaneously
        = THE WOW MOMENT
```

---

## 6. AI API CALL FLOW — ALL 4 PROMPTS

---

### API Route: `/api/generate-lesson`

```typescript
// src/app/api/generate-lesson/route.ts

POST body: { topic, style, difficulty, lessonId }

FLOW:
1. Receive request
2. Build Gemini prompt (PROMPT A)
3. Call Gemini API (gemini-1.5-flash)
4. Parse JSON response → validate schema
5. IF valid:
   - Write 5 slides to lessons/{lessonId}/slides/
   - Update lessons/{lessonId}.status = "ready"
   - Update lessons/{lessonId}.slidesJson = raw json
6. IF Gemini fails:
   - Try OpenAI (gpt-4o-mini) as fallback
7. IF both fail:
   - Write 3 hardcoded generic slides
   - Update status = "ready" (never fail silently)

Response: { success: true, lessonId }
```

---

### API Route: `/api/generate-quiz`

```typescript
// src/app/api/generate-quiz/route.ts

POST body: { topic, style, slidesContent, lessonId }

FLOW:
1. Join all 5 slide content strings
2. Build Gemini prompt (PROMPT B)
3. Call Gemini API
4. Parse JSON → validate 5 questions, 4 options each, correctIndex 0-3
5. IF valid: return quiz JSON to Flutter app
6. IF invalid or failed: return 3 hardcoded questions

Response: { questions: [...5 MCQs] }
```

---

### API Route: `/api/suggest-style`

```typescript
// src/app/api/suggest-style/route.ts

POST body: { topic, currentStyle, score, styleHistory }

FLOW:
1. Build Gemini prompt (PROMPT C)
2. Call Gemini API
3. Parse response → validate suggestedStyle is one of 4 valid styles
4. IF invalid: default to "interactive"

Response: { suggestedStyle, reason, tip }
```

---

### API Route: `/api/student-analytics`

```typescript
// src/app/api/student-analytics/route.ts

POST body: { studentName, quizResults, topicsStudied, stylesUsed }

FLOW:
1. Build Gemini prompt (PROMPT D)
2. Call Gemini API
3. Parse response → validate all fields present
4. IF failed: return hardcoded generic insight

Response: { preferredStyle, weakTopics, strongTopics, insight, overallScore }
```

---

## 7. COMPLETE NAVIGATION MAPS

---

### Flutter Navigation Map

```
SPLASH
  └── AUTH (if not logged in)
  │     ├── Sign In → HOME
  │     └── Sign Up → HOME
  │
  └── HOME (if logged in)
        │
        ├── Bottom Nav: HISTORY
        │     └── Card tap → LESSON DETAIL (review mode)
        │
        ├── Bottom Nav: PROFILE
        │
        └── "Learn Something New" → TOPIC INPUT
              └── Next → STYLE SELECTOR
                    └── "Generate My Lesson" → GENERATION PROGRESS
                          └── onSnapshot ready → LESSON PLAYER
                                ├── Slide 5 "Take Quiz" → QUIZ
                                │     └── Q5 complete → RESULT
                                │           ├── PASS: HOME or TOPIC INPUT
                                │           └── FAIL: Retry → GENERATION PROGRESS
                                │                               (new lesson, suggested style)
                                └── Exit → HOME
```

---

### Next.js Navigation Map

```
/login
  └── → /dashboard (on auth success)

/dashboard
  ├── Sidebar: /history
  ├── Sidebar: /analytics
  ├── Sidebar: /profile (future)
  └── Recent lesson card → /lesson/[id]

/history
  ├── Sidebar: /dashboard
  ├── Sidebar: /analytics
  ├── Filter chips (client-side, no navigation)
  └── Lesson card → /lesson/[id]

/analytics
  ├── Sidebar: /dashboard
  ├── Sidebar: /history
  └── (no outbound navigation — charts only)

/lesson/[id]
  ├── Back → /history
  ├── Slide navigation (client-side, no route change)
  └── Retake quiz → modal on same page
```

---

## 8. STATE MANAGEMENT — GETX CONTROLLERS

---

### Controller List

| Controller | Scope | Responsibility |
|---|---|---|
| `SplashController` | Single page | Auth check, delay navigation |
| `AuthController` | Permanent (GetX.put) | User session, sign in/out |
| `HomeController` | Page-level | Streak, XP, recent lessons |
| `LessonController` | Permanent during lesson flow | Topic, style, generation, slides |
| `LessonPlayerController` | Page-level | Slide index, navigation |
| `QuizController` | Page-level | Questions, answers, scoring |
| `HistoryController` | Page-level | All lessons, filters |
| `ProfileController` | Page-level | Style stats, sign out |

---

### LessonController — Most Complex

```dart
class LessonController extends GetxController {
  // Input state
  var topic = ''.obs;
  var difficulty = 'medium'.obs;
  var selectedStyle = ''.obs;

  // Generation state
  var lessonId = ''.obs;
  var generationStatus = 'idle'.obs; // idle|generating|ready|failed

  // Lesson content
  var slides = <SlideModel>[].obs;
  var quizQuestions = <QuizQuestion>[].obs;

  // Methods
  Future<void> createLesson() async { ... }
  void listenToLessonStatus() { ... }  // onSnapshot
  Future<void> callGenerateApi() async { ... }
  Future<void> callQuizApi() async { ... }
}
```

---

## 9. ERROR STATES — EVERY SCREEN

| Screen | Error | Handling |
|---|---|---|
| Splash | Firebase unreachable | Show "No internet" screen with retry |
| Auth | Wrong credentials | Inline error toast, field stays filled |
| Auth | Network error | Toast: "Check your connection" |
| Auth | Email in use | Inline: "Email already registered" |
| Home | Firestore read fail | Show cached data or skeleton |
| Topic Input | Topic too short | Inline hint (no navigation block) |
| Style Selector | None selected + tap generate | Shake animation on button |
| Generation | API timeout (>30s) | Dialog: retry or go home |
| Generation | API returns malformed JSON | Auto-fallback to 3 generic slides |
| Lesson Player | Slides empty | Show "Content unavailable, retry" |
| Quiz | Quiz JSON malformed | Auto-fallback to 3 generic questions |
| Result | Firestore write fail | Retry write silently, show success UI |
| History | No lessons | Empty state with CTA |
| Profile | styleProgress empty | Show zeros, not crash |
| Web Dashboard | onSnapshot disconnected | Reconnect banner at top |
| Web History | Lessons not loading | Skeleton → error state after 10s |
| Web Analytics | AI insight call fails | Hide insight card, show charts |

---

## 10. DEMO DAY FLOW — EXACT SEQUENCE

```
TOTAL TIME: 4 MINUTES

[0:00 – 0:20] OPENING
  Presenter: "Every student is forced to learn the teacher's way.
  But every student understands differently.
  We built FlexiStudy — it adapts every lesson to how
  each student actually learns."

[0:20 – 0:50] PHONE — HOME SCREEN
  Show Flutter app on phone.
  Point out: streak counter (7 days), XP bar, Level 12.
  "This is a student's personal learning companion.
   Everything here is their data."

[0:50 – 1:30] PHONE — LESSON GENERATION
  Tap "Learn Something New."
  Type: "Newton's Third Law"
  Show difficulty: Medium selected.
  Tap "Next."
  4 style cards animate in.
  Tap 📖 "Example" card — checkmark appears.
  Tap "Generate My Lesson."
  Generation screen shows animated steps.
  "AI is writing a lesson specifically for how this student
   learns — in about 12 seconds."

[1:30 – 2:10] PHONE — LESSON PLAYER
  Lesson loads into 5 slides.
  Walk through slides 1 and 2.
  Show real-world analogy content.
  "Every word here was written by AI for example-based learners.
   A visual learner would see diagrams and color blocks instead."
  Navigate to slide 5.
  Tap "Take Quiz."

[2:10 – 2:40] PHONE — QUIZ AND RESULT
  Answer 5 questions.
  Score: 2/5.
  Result screen shows retry suggestion: 🎨 Visual.
  "The app detected the struggle and automatically
   suggested a different approach."
  Tap "Retry with Visual."
  New lesson generates in Visual style.
  Score: 5/5.
  Confetti. +40 XP. Streak updated.

[2:40 – 3:10] THE WOW MOMENT — SWITCH TO LAPTOP
  "Now watch this."
  Open web dashboard on laptop (was already open, not refreshed).
  Point: Recent Lessons card now shows "Newton's Third Law — 5/5 🎨 Visual"
  Point: XP bar updated.
  Point: Style distribution ring chart — Visual slice grew.
  "This synced the moment the quiz was submitted.
   No refresh. No manual update. Firebase real-time."

[3:10 – 3:40] WEB — ANALYTICS PAGE
  Switch to Analytics tab.
  Show style performance bar chart.
  Show AI insight card: "You learn 40% better through visual explanations."
  "The app doesn't just teach you — it learns how you learn."

[3:40 – 4:00] CLOSING
  "FlexiStudy doesn't just teach students.
   It builds a personal understanding of how each student
   learns best — and that intelligence follows them
   everywhere they study."
```

---

## PRE-DEMO CHECKLIST (30 minutes before judging)

```
FIREBASE PREP:
□ Seed Firestore with demo student account
□ Pre-load 5 past lessons in history (varied styles + subjects)
□ Set streakCount to 7
□ Set xpTotal to 1250
□ Set preferredStyle to "example"
□ Pre-cache 2 lessons (photosynthesis + newton) as fallback JSON

FLUTTER PREP:
□ Install APK on demo phone (not emulator)
□ Log in with demo account
□ Keep app open to Home screen
□ Disable phone notifications
□ Enable Wi-Fi — same network as laptop
□ Screen brightness to maximum

WEB PREP:
□ Log in with same demo account on laptop
□ Open /dashboard — do not refresh
□ Open /analytics in background tab
□ Verify real-time connection (check onSnapshot is active)
□ Vercel deployment live and green

AI PREP:
□ Test /api/generate-lesson with "Newton's Third Law" + "visual" → confirm works
□ Test /api/generate-quiz → confirm 5 questions generate
□ Have fallback JSON ready in memory (hardcoded in LessonController)

NETWORK PREP:
□ Test on event WiFi 1 hour before demo
□ Have mobile hotspot ready as backup
□ Never demo on public unsecured WiFi
```

---

*FlexiStudy · Complete Application Flow · v1.0*
*HACKSTOMP 24-Hour Hackathon · Ed Tech Domain · PS-4*
*Student-Only Role · Flutter Android + Next.js Web*
*Firebase Firestore Real-Time + Google Gemini AI*
