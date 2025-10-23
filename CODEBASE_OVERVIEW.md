# VREAD Application - Comprehensive Codebase Overview

## Project Summary
**VREAD** is a French-language reading platform with the tagline: *"Si ce n'est pas sur VREAD, tu ne l'as pas lu"* (If it's not on VREAD, you haven't read it).

The application helps readers track their reading progress, complete books, earn achievements, and build reading habits through a gamified experience with quests, badges, XP levels, and streaks.

---

## 1. Overall Project Structure

### Root Directory Organization
```
/home/user/chapter-coffee-club/
├── src/                          # Main application source code (1.7M)
├── supabase/                     # Backend configuration & migrations (507K)
├── public/                        # Static assets (9.4M - mainly book covers)
├── pages/                         # Page components
├── scripts/                       # Build and utility scripts
├── tests/                         # Test files
├── docs/                          # Documentation and audit reports
├── api/                           # API endpoints (sitemap)
├── ios/                           # iOS app configuration (Capacitor)
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite build configuration
├── tailwind.config.ts             # Styling configuration
├── tsconfig.json                  # TypeScript configuration
├── capacitor.config.ts            # Native mobile configuration
└── playwright.config.ts           # E2E testing configuration
```

**Total Files:** 394 TypeScript/TSX files + 146 SQL/config files

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.20
- **Language:** TypeScript 5.5.3
- **Routing:** React Router DOM 6.26.2
- **Styling:** Tailwind CSS 3.4.11 + shadcn/ui (Radix UI)

### Backend & Database
- **Backend:** Supabase (PostgreSQL 15)
- **State Management:** TanStack React Query, Supabase Auth
- **Edge Functions:** 7+ TypeScript functions (validate-answer, joker-reveal, etc.)

### Native Mobile
- **Framework:** Capacitor 7.4.2 (iOS & Android)

### Dev Tools
- **Testing:** Playwright (E2E) + Vitest (Unit)
- **Linting:** ESLint + TypeScript
- **Deployment:** Vercel

---

## 3. Main Features

### Core Reading Features
1. **Book Management** - Browse, search, add to lists
2. **Reading Validation** - Segment-based quiz questions with instant feedback
3. **Gamification** - XP/Levels, Badges, Quests, Streaks, Jokers
4. **Social Features** - Profiles, follow/followers, notifications
5. **Content** - Blog (markdown), Discover, Explore, Search

### Admin Features
- Book management, auto-cover generation, audit logs, data exports

---

## 4. Key Directory Structure

### `/src/pages` - 31 Page Components
Landing, Home, Auth, Profile, BookPage, Blog, ReadingList, Achievements, etc.

### `/src/components` - 24 Component Categories
UI (shadcn), layout, books (QuizModal, ValidationModal), auth, profile, reading, achievements, admin, etc.

### `/src/services` - 59 Business Logic Files
- **reading/** (14 files): progressService, validationService, streakService, etc.
- **user/** (10 files): userProfileService, levelService, discoverService, etc.
- **books/** (8 files): classicBooks, bookMapper, bookMutations, etc.
- Other: badgeService, questService, jokerService, blogService, etc.

### `/src/hooks` - 39 Custom React Hooks
useBookValidation, useReadingProgress, useReadingList, useQuizCompletion, useJokersInfo, etc.

### `/src/types` - 8 TypeScript Interfaces
book.ts, reading.ts, user.ts, quest.ts, badge.ts, blog.ts, etc.

### `/supabase` - Backend Configuration
- **migrations/**: 17 SQL migration files
- **functions/**: 7+ Edge Functions (validate-answer, joker-reveal, streak-cron, etc.)
- **config.toml**: Supabase local development setup

---

## 5. Architecture Pattern

```
Vite (Build)
  ↓
React Components (UI Layer)
  ↓
Custom Hooks (Logic Layer)
  ↓
Services (Business Logic)
  ↓
Supabase Client (Data Access)
  ↓
PostgreSQL (Database)
```

### State Management
- **Auth:** React Context (AuthContext)
- **Server State:** React Query (TanStack)
- **UI State:** Local useState
- **Caching:** progressCache service
- **Session:** Supabase JWT persistence

---

## 6. Core Features Implementation

### Reading Validation Flow
- User answers question in QuizModal
- useQuizCompletion hook calls validate-answer edge function
- validationService.ts creates record in DB
- badgeAndQuestWorkflow checks for achievement unlocks
- progressService updates reading state
- levelService awards XP
- UI updates with confetti on success

### Gamification System
- **XP System:** Levels 1-100+, earned from validations
- **Badges:** 40+ achievement badges with rarity
- **Quests:** 4 special challenges (early reader, triple validation, multi-booker, back on track)
- **Jokers:** Daily help to skip questions (usage constraints)
- **Streaks:** Track consecutive reading days

### Reading List Management
- Three states: "to_read", "in_progress", "completed"
- Derived fields: progressPercent, nextSegmentPage, currentSegment
- Defensive consistency checks
- Caching layer for performance

---

## 7. Key Configuration Files

### Build & Styling
- **vite.config.ts:** PWA, compression, code splitting, node module stubbing
- **tailwind.config.ts:** 8-size responsive typography, custom Reed/Coffee/Chocolate palette
- **tsconfig.json:** Path aliases (@/*), loose type checking

### Deployment
- **vercel.json:** Vercel configuration
- **capacitor.config.ts:** iOS/Android native app config
- **playwright.config.ts:** E2E test configuration

---

## 8. Database Schema (Key Tables)

- **profiles:** User accounts with admin/premium flags
- **books:** Book catalog with metadata
- **reading_progress:** User reading state per book
- **reading_questions:** Quiz questions per segment
- **reading_validations:** Validation history with answers
- **user_badges:** Unlocked badges per user
- **user_quests:** Completed quests per user
- **followers:** Social follow relationships
- **notifications:** User notification history
- **blog_posts:** Markdown blog articles

---

## 9. Notable Architectural Decisions

1. **Supabase** for backend (auth, database, edge functions)
2. **React Query** for server state management
3. **Service Layer Pattern** for business logic encapsulation
4. **Custom Hooks** for component logic reuse
5. **Capacitor** for single web/native codebase
6. **Tailwind CSS** for rapid styling with custom theme
7. **TypeScript** for type safety across 394 files
8. **Vite** for fast dev and optimized builds

---

## 10. Performance Optimizations

- **Code Splitting:** Vendor chunks (React, Supabase, UI, Utils)
- **Image Optimization:** Sharp library for covers
- **Lazy Loading:** Dynamic component imports
- **Query Caching:** React Query with stale-while-revalidate
- **PWA Support:** Service Worker for offline capability
- **Compression:** Auto Gzip/Brotli compression

---

## 11. File Statistics

- **TypeScript/TSX files:** 394
- **SQL/Config files:** 146
- **Source code size:** 1.7M
- **Public assets:** 9.4M
- **Supabase config:** 507K

---

## 12. Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run test:e2e     # Playwright tests
npm run brand:check  # SEO brand audit
```

---

## 13. SEO & Accessibility

- **Canonical URLs:** Dynamic canonical management
- **Open Graph:** Social media meta tags
- **JSON-LD:** Schema.org structured data (WebSite, Organization)
- **Sitemap:** Auto-generated at `/sitemap.xml`
- **Security Headers:** CSP, X-Frame-Options, Referrer-Policy, HSTS
- **Responsive:** Mobile-first design
- **Dark Mode:** Full dark mode support

---

## 14. Deployment & Platforms

### Web
- Vercel deployment
- ES2020 target
- PWA support
- Responsive design
- Dark mode

### Native Mobile (Capacitor)
- iOS configuration
- Android configuration
- Status bar integration
- Local notifications

---

See `CODEBASE_OVERVIEW.md` in the root for the full detailed version.
