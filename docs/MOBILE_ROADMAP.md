# RemoteHive Mobile — Development Roadmap

## Bottom Tab Navigation (Both Roles)

```
Jobseeker:  Home | All Jobs | Activity | Resume | Profile
Employer:   Home | My Jobs | Post Job | Company | Settings
```

---

## Jobseeker Features: Web vs Mobile

| # | Feature | Web | Mobile | API Endpoint(s) |
|---|---------|-----|--------|-----------------|
| 1 | Dashboard Overview (stats, strength, recent) | ✅ | ❌ | `getUserByClerkId`, `getSavedJobsCount`, `getApplicationsCount`, `getApplications` |
| 2 | My Profile (personal info, resume upload, skills, address, social links, phone verify) | ✅ | ❌ | `getUserByClerkId`, `updateUser`, `uploadResume`, `sendOtp` |
| 3 | Resume Builder (22 templates, AI rewrite, drag-drop sections, PDF export) | ✅ | ❌ | Client-side (save/load from server) |
| 4 | My Applications (track status, cover letter, withdraw) | ✅ | ❌ | `getApplications`, `withdrawApplication` |
| 5 | Saved Jobs (bookmark, remove) | ✅ | ❌ | `getSavedJobs`, `unsaveJob` |
| 6 | Smart Jobs (AI match scoring, skill gap, hiring probability) | ✅ | ❌ | `getJobs`, `getCompanies`, `saveJob`, `unsaveJob`, `trackJobEngagement` |
| 7 | Job Feed (search, filters, company sidebar) | ✅ | ❌ | `getJobs`, `getCompanies` |
| 8 | Companies Feed (browse, categories, search) | ✅ | ❌ | `getCompanyCategories`, `getCompanies` |
| 9 | Academy / Interview Prep (courses, video player, quizzes, AI chat) | ✅ | ❌ | `fetchRoles`, `fetchCourses`, `fetchCourseWithProgress`, `upsertProgress`, `sendAiChatMessage` |
| 10 | Gadgets Store (products, cart, flash sale, buy) | ✅ | ❌ | `fetchProducts`, `fetchProductCategories` |
| 11 | Account Settings (Clerk profile, security) | ✅ | ✅ Skeleton | Clerk-managed |
| 12 | Auto-Apply Campaigns (AI-driven, realtime) | ✅ | ❌ | Supabase `auto_apply_campaigns`, POST `/api/auto-apply/start` |
| 13 | Wallet Management | ❌ | ❌ | TBD |
| 14 | Apply Tracking + Notifications | ✅ Partial | ❌ | `getApplications` |
| 15 | User Deletion | ✅ | ❌ | `deleteUser` |

## Employer Features: Web vs Mobile

| # | Feature | Web | Mobile | API Endpoint(s) |
|---|---------|-----|--------|-----------------|
| 1 | Employer Dashboard (stats, charts, job health, top jobs) | ✅ | ✅ Skeleton | `getUserBySupabaseId`, `getEmployerDashboardStats` |
| 2 | Post Job (4-step wizard: core details, role, AI+filters, preview) | ✅ | ❌ | `getEmployerJobRoles`, `getEmployerSkillSuggestions`, `saveEmployerJobDraft`, POST `/api/employer/post-job/` |
| 3 | My Jobs + Applicant Tracking (list, manage, pipeline, custom forms) | ✅ | ✅ Skeleton | `getEmployerJobsWithStats`, `getEmployerJobApplicants`, `updateEmployerJob`, `updateApplicationStatus` |
| 4 | Company Profile (general info, logo, team members, SSO) | ✅ | ✅ Skeleton | `getCompany`, `updateEmployerCompany`, `getEmployerCompanyUsers`, `uploadEmployerCompanyLogo` |
| 5 | Buy Job Posts (plans, Stripe checkout) | ✅ | ❌ | `getPricingPlans`, POST `/api/create-checkout-session/` |
| 6 | Subscriptions & Billing (quota, usage) | ✅ | ❌ | GET `/api/employer-subscription-status/` |
| 7 | Employer Settings (profile, notifications, password, delete account) | ✅ | ❌ | `getUserBySupabaseId`, `updateUserBySupabaseId`, `updateUser` |

---

## Implementation Phases

### Phase 1 — Auth & Navigation (NOW)
- [x] Clerk + Supabase auth flow
- [x] Role selection (jobseeker/employer)
- [x] Signed-in guards on all auth screens
- [x] EAS Update for OTA JS updates
- [x] In-app update notification dialog
- [ ] **Fix user identification:** Clerk auto-detect existing users by email
- [ ] **Login flow:** New user → signup; existing user → login (auto-detect)
- [ ] **Redesign bottom tabs:** Home | All Jobs | My Activity | Resume | Profile (jobseeker)
- [ ] **Mandatory phone verification** on onboarding for jobseekers

### Phase 2 — Jobseeker Core Features
- [ ] **Home Dashboard:** Profile strength gauge, active apps count, saved count, recent activity feed, quick actions
- [ ] **All Jobs:** Search bar, filters (date, type, location, salary, remote), AI match score cards, save/bookmark, apply
- [ ] **My Activity:** Applications tab (status pipeline: Applied→Screening→Interview→Offer→Rejected→Withdrawn), Saved Jobs tab
- [ ] **Resume Builder:** Template picker (22 templates), section editor (work, education, projects, skills, certs), live preview, AI bullet rewrite, PDF export
- [ ] **Profile:** Personal info (name, headline, bio, phone+OTP, skills, experience level), Address (location picker, GPS), Links (LinkedIn, portfolio), Resume upload, Settings (notifications, password, delete account), Wallet (balance, transactions)

### Phase 3 — Jobseeker Advanced Features
- [ ] **Companies Feed:** Browse by category, search, company detail page with jobs
- [ ] **Academy:** Course list by role, video player, progress tracking, AI interview chat
- [ ] **Gadgets Store:** Product listing, categories, cart, checkout
- [ ] **Auto-Apply:** Campaign list, create campaign modal, realtime progress
- [ ] **Notifications:** Push via Expo, in-app notification center

### Phase 4 — Employer Panel
- [ ] **Dashboard:** Stat cards, engagement chart, job health, top jobs
- [ ] **Post Job:** 4-step wizard (core details, role, AI+filters, preview → publish)
- [ ] **My Jobs:** Job list with stats, applicant pipeline (drag status), edit job, close/reopen/archive
- [ ] **Company Profile:** Info, logo upload, team management, domain verification, SSO config
- [ ] **Subscriptions:** Plan display, quota bar, buy more
- [ ] **Settings:** Profile, notifications, password change, account deletion

---

## Current Theme (Design System)

From `src/theme/index.ts`:
- **Primary:** `#2563EB` (blue-600)
- **Secondary:** `#6366F1` (indigo-500)
- **Background:** `#F8FAFC` (slate-50)
- **Card:** `#FFFFFF`
- **Border:** `#E2E8F0`
- **Text:** `#0F172A` → `#64748B` → `#94A3B8`
- **Spacing:** 4/8/16/24/32/48
- **Border Radius:** 8/12/16/20/9999

---

## Data Flow

```
Mobile App
  │
  ├── Clerk (Jobseeker Auth) ──→ Supabase (users table, RLS via Clerk JWT)
  │
  ├── Supabase (Employer Auth) ──→ users + companies + jobs tables
  │
  ├── Django API (admin.remotehive.in) ──→ Jobs, Applications, Courses, Products, etc.
  │
  ├── RapidAPI ──→ Phone validation
  │
  └── EAS Update ──→ OTA JS bundle delivery
```

---

## Version Tracking

- Public version manifest: `https://raw.githubusercontent.com/remotehive-dev/remotehive-releases/main/version.json`
- App checks this on launch → shows update dialog if newer build available
