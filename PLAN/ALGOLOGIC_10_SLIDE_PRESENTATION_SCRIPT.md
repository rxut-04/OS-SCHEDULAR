# AlgoLogic — 10-Slide Presentation Script & Color Specs for PPTX

Use this document in your AI editor to generate the PowerPoint. Each slide has: **Title**, **Bullets/Content**, **Speaker Notes**, and **Color Combination** (background, title text, body text, accents) for consistent, professional styling.

---

## GLOBAL COLOR PALETTE (AlgoLogic Theme — use across slides)

| Role | Hex | Name |
|------|-----|------|
| Primary Green | `#064E3B` | Dark forest green |
| Secondary Green | `#10B981` | Emerald / accent |
| Background Light | `#F9FAFB` | Off-white gray |
| Background Mint | `#D1FAE5` | Soft mint |
| Text Dark | `#111827` | Near black |
| Text Secondary | `#374151` | Gray |
| White | `#FFFFFF` | Pure white |
| Accent Yellow | `#FFF4A3` | Soft yellow (highlights) |
| Accent Pink | `#FFC0C7` | Soft pink (optional) |
| Dark Header | `#022C22` | Deep green (headers/footers) |

---

# SLIDE 1 — Title Slide

**Title:**  
AlgoLogic  
*Interactive Learning Platform for OS & AI/ML*

**Subtitle (optional):**  
Learn • Visualize • Quiz — All in One Place

**Speaker Notes:**  
"AlgoLogic is a full-stack interactive learning platform we built to teach Operating Systems and Artificial Intelligence / Machine Learning through theory, animations, and quizzes. Today we’ll walk through everything we built."

**Color Combination for AI Editor:**  
- **Background:** Gradient from `#064E3B` (top) to `#022C22` (bottom), or solid `#064E3B`  
- **Title text:** `#FFFFFF`  
- **Subtitle / tagline:** `#D1FAE5` or `#10B981`  
- **Accent (line or logo area):** `#10B981`  
- **Font:** Sans-serif, bold for "AlgoLogic", regular for subtitle  

---

# SLIDE 2 — Problem & Vision

**Title:**  
Why AlgoLogic?

**Bullets:**  
- **Gap:** OS and AI/ML are taught with static slides and minimal interactivity.  
- **Goal:** One platform — theory, algorithm visualizations, and quizzes — for both domains.  
- **Users:** Students and learners who want to see algorithms in action and test themselves.  
- **Outcome:** Understand concepts deeply through reading, watching, and doing.

**Speaker Notes:**  
"We wanted to bridge the gap between passive learning and hands-on understanding. AlgoLogic gives learners theory pages, step-by-step algorithm animations with explainer videos, and topic-wise quizzes — all aligned to the same curriculum."

**Color Combination:**  
- **Background:** `#F9FAFB`  
- **Title:** `#064E3B`  
- **Body text:** `#111827`  
- **Bullet accent (icon or bar):** `#10B981`  
- **Optional card/panel behind bullets:** `#D1FAE5` at 40% opacity  

---

# SLIDE 3 — What We Built (Feature Map)

**Title:**  
What We Built — At a Glance

**Content (two columns or grid):**  
**Left — Learning & Content**  
- Comprehensive theory (OS + AI/ML, 10 units each)  
- Central References page  
- Modules hub: OS algorithms & AI/ML algorithms  

**Right — Interactivity**  
- Algorithm visualizers (canvas-based, interactive)  
- Explainer videos (CPU Scheduling, Memory Management, Multithreading)  
- Standalone quizzes (OS Quiz, AI/ML Quiz) with 50+ questions each  
- Dashboard: progress, results, achievements, profile, security  
- Functional feedback form (Contact) with Supabase  

**Speaker Notes:**  
"We built end-to-end: theory, modules listing, interactive visualizers with embedded videos, two full quiz experiences, a user dashboard, and a working contact form backed by a database."

**Color Combination:**  
- **Background:** `#FFFFFF`  
- **Title:** `#064E3B`  
- **Section labels ("Learning & Content", "Interactivity"):** `#10B981`  
- **Body text:** `#374151`  
- **Dividers / icons:** `#10B981`  
- **Light panel background (optional):** `#D1FAE5` at 30%  

---

# SLIDE 4 — Operating Systems Track

**Title:**  
Operating Systems — Complete Track

**Bullets:**  
- **Theory:** Dedicated `/theory/os` page — 10 units, 20 topics, collapsible sidebar, code blocks, tables.  
- **Modules:** CPU Scheduling, Memory Management, Multithreading Models, Page Replacement, Disk Scheduling, Contiguous Memory, File Allocation, Scheduling Queues.  
- **Videos:** Explainer videos on CPU Scheduling, Memory Management, and Multithreading (embedded on each page).  
- **Quiz:** Standalone OS Quiz — 50+ questions, multiple topics, difficulty levels, explanations, progress saved in browser.

**Speaker Notes:**  
"The OS track includes a full theory course, eight algorithm modules with interactive visualizers, three of them with explainer videos, and a dedicated quiz with persistence and progress in the top navigation."

**Color Combination:**  
- **Background:** `#D1FAE5` (soft mint) or `#F9FAFB`  
- **Title:** `#064E3B`  
- **Body text:** `#111827`  
- **Accent (e.g. "Theory", "Modules", "Videos", "Quiz"):** `#10B981`  
- **Small icons/bullets:** `#064E3B`  

---

# SLIDE 5 — AI/ML Track

**Title:**  
AI/ML — Complete Track

**Bullets:**  
- **Theory:** Dedicated `/theory/aiml` page — 10 units, 20 topics, same rich structure as OS theory.  
- **Modules:** Linear Regression, Logistic Regression, K-Nearest Neighbors, Decision Tree, K-Means Clustering, Neural Network, Reinforcement Learning.  
- **Visualizers:** Interactive demos for regression, classification, clustering, and neural networks.  
- **Quiz:** Standalone AI/ML Quiz — 50+ questions, topics and difficulty, explanations, progress in top nav.

**Speaker Notes:**  
"The AI/ML track mirrors the OS experience: full theory, seven modules with visualizations, and a separate quiz. Users can enter from the home page via 'Learn AI/ML' or 'Animations' with the AI/ML tab."

**Color Combination:**  
- **Background:** `#F9FAFB`  
- **Title:** `#064E3B`  
- **Body text:** `#374151`  
- **Accent / category labels:** `#10B981`  
- **Optional "AI" accent:** `#8B8000` (olive/gold from theme) for one highlight only  

---

# SLIDE 6 — Quizzes & Progress

**Title:**  
Quizzes & Progress Tracking

**Bullets:**  
- **Two quizzes:** OS Quiz (`/quiz/os`) and AI/ML Quiz (`/quiz/aiml`) — each with welcome, topic selection, difficulty, timed questions, results, and review.  
- **Question bank:** 50+ questions per subject with explanations and multiple difficulties.  
- **Progress pills:** Top navigation shows latest score for each quiz (from localStorage).  
- **Dashboard:** Past results, achievements, and progress pages for logged-in users.

**Speaker Notes:**  
"Quizzes are standalone so even guests can use them. We store the latest result in the browser and show it in the nav. Logged-in users also see past results and achievements in the dashboard."

**Color Combination:**  
- **Background:** `#FFFFFF`  
- **Title:** `#064E3B`  
- **Body text:** `#111827`  
- **"OS Quiz" / "AI/ML Quiz" labels:** `#10B981`  
- **Progress/success accent:** `#10B981`  
- **Optional badge/pill color:** `#D1FAE5` background, `#064E3B` text  

---

# SLIDE 7 — Dashboard & Authentication

**Title:**  
Dashboard & Authentication

**Bullets:**  
- **Auth:** Login and Signup with Supabase; session handling and secure sign-out.  
- **Dashboard layout:** Responsive sidebar (expand/collapse), logout in both states.  
- **Pages:** Home, Progress, Past Results, Achievements, Profile, Security, Daily Quiz (legacy).  
- **Navigation:** Sidebar links and back-to-home from dashboard; AlgoLogic logo (logo2) throughout.

**Speaker Notes:**  
"We use Supabase for authentication. The dashboard has a sidebar with all sections and a clear logout. Every dashboard page is wired; some are placeholders for future expansion like achievements and security settings."

**Color Combination:**  
- **Background:** `#022C22` (dark green) or `#064E3B`  
- **Title:** `#FFFFFF`  
- **Body text:** `#D1FAE5` or `#FFFFFF` at 90%  
- **Accent (icons, links):** `#10B981`  
- **Cards/panels (if any):** `#064E3B` with `#D1FAE5` text  

---

# SLIDE 8 — Technical Stack

**Title:**  
Technical Stack

**Content (list or table):**  
- **Frontend:** Next.js 16 (App Router), React, TypeScript, Tailwind CSS, Framer Motion  
- **UI:** Custom components, Canvas API for algorithm visualizations, optional shader effects  
- **Backend / DB:** Supabase (Auth + PostgreSQL for feedback table)  
- **Server logic:** Next.js Server Actions (e.g. feedback form submission)  
- **Deploy:** Netlify; repo: GitHub (rxut-04/OS-SCHEDULAR)  
- **Assets:** Local video embeds (MP4), static images, AlgoLogic theme (CSS variables)

**Speaker Notes:**  
"We built on Next.js 16 with TypeScript and Tailwind. Algorithm views use HTML5 Canvas. Supabase handles auth and the feedback table; form submission uses a server action. The app is deployed on Netlify from our GitHub repo."

**Color Combination:**  
- **Background:** `#F9FAFB`  
- **Title:** `#064E3B`  
- **Category (Frontend, Backend, etc.):** `#10B981`  
- **Body text:** `#374151`  
- **Tech tags (optional):** `#D1FAE5` bg, `#064E3B` text  

---

# SLIDE 9 — Design & User Experience

**Title:**  
Design & User Experience

**Bullets:**  
- **Theme:** AlgoLogic (FINALYPRO) — primary green `#064E3B`, accent `#10B981`, mint `#D1FAE5`, clean backgrounds.  
- **Consistency:** CSS variables (`--alg-*`) for colors and borders across the app.  
- **UX:** Hero cards (Learning, Animations, Quiz); clear CTAs (Learn OSY, Learn AI/ML, Animations, Quiz); TopNav with progress pills and overlays.  
- **Accessibility:** Contrast fixes (dark text on light panels), scroll behavior fixed site-wide, responsive layout.  
- **Content:** Theory pages with nav, code blocks, tables, and next/previous links; video sections with header/footer on algorithm pages.

**Speaker Notes:**  
"Our design uses a single green/mint palette and CSS variables so we can keep the look consistent. We fixed scrolling and contrast site-wide and made the hero and nav clear so users can jump to theory, animations, or quizzes quickly."

**Color Combination:**  
- **Background:** `#D1FAE5` (mint)  
- **Title:** `#064E3B`  
- **Body text:** `#111827`  
- **Swatch or strip:** Show `#064E3B` | `#10B981` | `#D1FAE5` | `#F9FAFB`  
- **Accent line:** `#10B981`  

---

# SLIDE 10 — Summary & Takeaway

**Title:**  
AlgoLogic — Summary

**Bullets:**  
- **Single platform** for OS and AI/ML: theory, visualizations, videos, and quizzes.  
- **Rich content:** 10-unit theory (×2), 8 OS + 7 AI/ML modules, 3 explainer videos, 100+ quiz questions with explanations.  
- **Fully functional:** Auth, dashboard, feedback form, progress tracking, responsive UI.  
- **Deployed:** Live on Netlify; code on GitHub (rxut-04/OS-SCHEDULAR).  
- **Next steps:** Add more videos, expand achievements, integrate more backend features.

**Closing line (optional):**  
*Thank you.*

**Speaker Notes:**  
"AlgoLogic is a complete learning platform with two full tracks, interactive visualizers, embedded videos, and quizzes with progress. It’s live on Netlify and ready for users. We can extend it with more videos and backend features."

**Color Combination:**  
- **Background:** Gradient `#064E3B` → `#022C22` or solid `#064E3B`  
- **Title:** `#FFFFFF`  
- **Body text:** `#D1FAE5`  
- **Accent / "Thank you":** `#10B981`  
- **Optional logo or icon:** White or `#10B981`  

---

# QUICK REFERENCE — Slide-by-Slide Colors (for AI Editor)

| Slide | Background       | Title    | Body       | Accent    |
|-------|------------------|----------|------------|-----------|
| 1     | #064E3B / #022C22 | #FFFFFF  | #D1FAE5    | #10B981   |
| 2     | #F9FAFB         | #064E3B  | #111827    | #10B981   |
| 3     | #FFFFFF         | #064E3B  | #374151    | #10B981   |
| 4     | #D1FAE5 / #F9FAFB | #064E3B  | #111827    | #10B981   |
| 5     | #F9FAFB         | #064E3B  | #374151    | #10B981   |
| 6     | #FFFFFF         | #064E3B  | #111827    | #10B981   |
| 7     | #022C22 / #064E3B | #FFFFFF  | #D1FAE5    | #10B981   |
| 8     | #F9FAFB         | #064E3B  | #374151    | #10B981   |
| 9     | #D1FAE5         | #064E3B  | #111827    | #10B981   |
| 10    | #064E3B / #022C22 | #FFFFFF  | #D1FAE5    | #10B981   |

---

# FONTS (Recommendation)

- **Title / Headings:** Source Sans 3 or Space Grotesk, Bold (700).  
- **Body:** Source Sans 3 or similar sans-serif, Regular (400) / SemiBold (600).  
- **Code / tech terms (optional):** JetBrains Mono or Consolas.

Use the same font family across all slides for a clean, professional look.
