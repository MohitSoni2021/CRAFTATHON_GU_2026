# 🏥 MedTrack — Comprehensive Project Documentation

> **Competition:** Gujarat Hackathon 2026 (CRAFTATHON GU 2026)
> **Domain:** HealthTech · Digital Health · Patient Safety · AI/RAG
> **Monorepo:** `hackgu-monorepo`
> **Last Updated:** 2026-04-04

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution Architecture](#3-solution-architecture)
4. [Key Features & Innovation Points](#4-key-features--innovation-points)
5. [Tech Stack](#5-tech-stack)
6. [Monorepo Structure](#6-monorepo-structure)
7. [Backend — Node.js/Express](#7-backend--nodejsexpress)
8. [Frontend — Next.js Web App](#8-frontend--nextjs-web-app)
9. [Android App — React Native (Expo)](#9-android-app--react-native-expo)
10. [Python AI/Analytics Backend](#10-python-aianalytics-backend)
11. [Database Design](#11-database-design)
12. [API Reference](#12-api-reference)
13. [RAG System & AI Pipeline](#13-rag-system--ai-pipeline)
14. [Zero UI Design for Elderly Users](#14-zero-ui-design-for-elderly-users)
15. [Notification & Alarm System](#15-notification--alarm-system)
16. [Medical Safety & Drug Conflict Warning](#16-medical-safety--drug-conflict-warning)
17. [User Profile & Shareable Medical History](#17-user-profile--shareable-medical-history)
18. [Data Analytics & Population Health](#18-data-analytics--population-health)
19. [Caregiver System](#19-caregiver-system)
20. [Environment Setup & Running Locally](#20-environment-setup--running-locally)
21. [Social Impact & Differentiation](#21-social-impact--differentiation)

---

## 1. Project Overview

**MedTrack** is a full-stack, AI-powered, real-time medication adherence monitoring platform designed for patients, caregivers, healthcare providers, and the broader medical research community. Built for **Gujarat Hackathon 2026**, MedTrack targets one of the most critical yet underserved gaps in modern healthcare — medication non-adherence in chronic disease patients.

### The Core Mission

> _Ensure every patient takes the right medicine, at the right time, every time — and alert the right person when they don't._

MedTrack goes beyond a simple pill reminder app. It is a **health intelligence platform** that:

- Monitors medication adherence in real-time
- Detects dangerous drug conflicts before a patient starts a new medication
- Builds a shareable digital health profile for every user
- Uses a RAG-powered AI assistant to answer medication queries with clinical precision
- Aggregates anonymized population-level adherence data for medical research
- Is purpose-built for **elderly users** with a Zero UI philosophy

---

## 2. Problem Statement

### 2.1 Background

Medication adherence — the degree to which a patient correctly follows prescribed medication schedules — is one of the most critical yet consistently underperformed aspects of modern healthcare.

| Statistic                                                                  | Source |
| -------------------------------------------------------------------------- | ------ |
| Only **50% of chronic illness patients** adhere to medication plans        | WHO    |
| India's adherence rates for Diabetes/TB patients: **30–40%**               | ICMR   |
| Non-adherence costs the global healthcare system **$500 billion annually** | Lancet |
| **21% of preventable deaths** in India linked to medication non-adherence  | Lancet |

### 2.2 The Indian Healthcare Context

| Factor                              | Impact                                                      |
| ----------------------------------- | ----------------------------------------------------------- |
| 77+ million diabetic patients       | 2nd largest diabetic population in the world                |
| 220+ million hypertensive patients  | Majority poorly controlled due to missed medications        |
| 2.8 million active TB cases/year    | Non-adherence → drug-resistant TB (MDR-TB)                  |
| Overburdened hospitals              | Doctors cannot track individual patient adherence           |
| Large elderly population            | Cognitive decline makes self-management nearly impossible   |
| Low digital literacy in rural areas | Existing solutions don't reach the most at-risk populations |

### 2.3 Root Causes of Non-Adherence

1. **No Centralized Tracking** — Patients rely on paper prescriptions, verbal reminders, or memory
2. **No Real-Time Visibility for Caregivers** — Family members have no remote monitoring capability
3. **Reactive, Not Proactive Care** — Non-adherence only detected when complications arise
4. **No Pattern Intelligence** — No system identifies _why_ patients miss doses
5. **Generic Reminder Systems Are Insufficient** — Alarms can't verify if a dose was actually taken
6. **Fragmented Data** — Medical history is scattered across pharmacy receipts, handwritten logs, and app silos
7. **Drug Conflict Blindspots** — Doctors are often unaware of patient allergies or conflicting medications
8. **No Shareable Health Profile** — Patients restart from scratch every time they visit a new doctor

### 2.4 Who Is Affected?

**Primary — Patients:**

- Elderly patients managing polypharmacy (multiple chronic conditions)
- Working adults with hypertension, diabetes, or mental health conditions
- Post-surgery patients on temporary but critical medication plans
- Rural patients with limited hospital access who need self-management tools

**Secondary — Caregivers:**

- Family members who are geographically separated from the patient
- Home nurses managing multiple patients simultaneously
- NGO health workers tracking TB/diabetes patients across large areas

**Systemic — Healthcare Providers:**

- Doctors who prescribe medications but have zero insight into compliance
- Hospitals repeatedly admitting the same chronic disease patients
- Health insurance companies paying for preventable complications

---

## 3. Solution Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                                    │
│  ┌─────────────────┐          ┌──────────────────────────────┐   │
│  │  Next.js 15     │          │  React Native (Expo)         │   │
│  │  Web Dashboard  │          │  Android Mobile App          │   │
│  └────────┬────────┘          └──────────────┬───────────────┘   │
└───────────┼───────────────────────────────────┼───────────────────┘
            │ REST API + Socket.io               │ REST API
┌───────────▼───────────────────────────────────▼───────────────────┐
│                   BACKEND LAYER (Express + TypeScript)             │
│  Modules: Auth · Medications · DoseLog · Adherence ·              │
│           Caregiver · Notifications · Push · Doctor               │
│  Jobs: Reminder Cron · Missed Dose Detector · Daily Stub Generator│
└───────────────────────────────┬────────────────────────────────────┘
                                │ Mongoose ODM
┌───────────────────────────────▼────────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                          │
│  Collections: users · medications · dose_logs ·                    │
│               caregiver_links · notifications ·                    │
│               push_subscriptions · reminder_logs                   │
└───────────────────────────────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                   AI/ANALYTICS LAYER (Python + FastAPI)            │
│  ┌──────────────────────┐   ┌──────────────────────────────────┐  │
│  │  RAG Engine          │   │  Analytics Pipeline              │  │
│  │  Qdrant Vector DB    │   │  Pandas + MongoDB Aggregation    │  │
│  │  Ollama LLM          │   │  CSV Dataset Export              │  │
│  │  nomic-embed-text    │   │  Population Health Metrics       │  │
│  │  qwen2.5:7b          │   │                                  │  │
│  └──────────────────────┘   └──────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Features & Innovation Points

### 4.1 ✅ Implemented Features

| Feature             | Description                                            | Status  |
| ------------------- | ------------------------------------------------------ | ------- |
| User Authentication | Email/Password + Google OAuth, JWT-based               | ✅ Done |
| Medication CRUD     | Full create/read/update/delete with scheduling         | ✅ Done |
| Dose Logging        | Mark doses as Taken / Missed / Delayed with timestamps | ✅ Done |
| Adherence Scoring   | Rolling 30-day score with risk classification          | ✅ Done |
| Pattern Detection   | Identifies night-miss, weekend slippage, streak breaks | ✅ Done |
| Caregiver Linking   | Invite-based patient–caregiver relationship            | ✅ Done |
| Caregiver Dashboard | Multi-patient adherence overview                       | ✅ Done |
| Notification System | In-app reminder inbox with read/unread state           | ✅ Done |
| Push Notifications  | Web Push API (VAPID) for browser notifications         | ✅ Done |
| Real-time Updates   | Socket.io for live dashboard refresh                   | ✅ Done |
| Android App         | Expo React Native app with full feature parity         | ✅ Done |
| RAG AI Assistant    | Ollama + Qdrant for medication Q&A                     | ✅ Done |
| Analytics Pipeline  | FastAPI + Pandas for population-level data export      | ✅ Done |
| Doctor Portal       | Doctor-facing view for patient history                 | ✅ Done |
| Swagger API Docs    | Full OpenAPI 3.0 documentation                         | ✅ Done |
| PDF Export          | Patient profile/report export via PDFKit               | ✅ Done |

### 4.2 🚀 Unique Innovation Points

1. **Zero UI for Elderly** — Minimal cognitive load interface, large tap targets, voice-friendly design
2. **Alarm-Theme Notification with Snooze** — Familiar alarm UX with snooze for future reminders
3. **Drug Conflict Warning Engine** — Warns users before adding a potentially conflicting medication
4. **RAG-Powered Medication AI** — LLM grounded in real medication dataset; not just generic GPT
5. **Shareable Digital Health Profile** — Patient can generate a link/PDF to share full history with any doctor
6. **Population-Level Analytics** — Aggregated (anonymized) adherence data useful for medical research
7. **Multi-Role Platform** — One platform serves Patient, Caregiver, and Doctor roles

---

## 5. Tech Stack

### 5.1 Node.js Backend (`@hackgu/backend`)

| Technology                     | Version | Purpose                                |
| ------------------------------ | ------- | -------------------------------------- |
| Express.js                     | ^4.19   | REST API framework                     |
| TypeScript                     | ^5.4    | Type safety                            |
| Mongoose                       | ^8.3    | MongoDB ODM                            |
| Zod                            | ^3.23   | Input validation                       |
| JSON Web Token                 | ^9.0    | Stateless authentication               |
| bcryptjs                       | ^3.0    | Password hashing                       |
| node-cron                      | ^4.2    | Reminder & missed-dose cron jobs       |
| Socket.io                      | ^4.8    | Real-time push to web clients          |
| web-push                       | ^3.6    | VAPID Web Push notifications           |
| google-auth-library            | ^10.6   | Google OAuth token verification        |
| swagger-ui-express             | ^5.0    | API documentation UI                   |
| @asteasolutions/zod-to-openapi | ^7.0    | Auto-generate OpenAPI from Zod schemas |
| PDFKit                         | ^0.18   | PDF report generation                  |
| morgan                         | ^1.10   | HTTP request logging                   |

### 5.2 Next.js Frontend (`@hackgu/frontend`)

| Technology             | Version | Purpose                                  |
| ---------------------- | ------- | ---------------------------------------- |
| Next.js                | 15.1.0  | SSR, App Router, React Server Components |
| React                  | ^19.0   | UI framework                             |
| TypeScript             | ^5.0    | Type safety                              |
| Tailwind CSS           | latest  | Utility-first styling                    |
| Axios                  | ^1.7    | HTTP client with interceptors            |
| Socket.io-client       | ^4.8    | Real-time updates                        |
| Lucide React           | ^0.400  | Icon library                             |
| crypto-js              | ^4.2    | Encrypted localStorage for sessions      |
| date-fns               | ^4.1    | Date manipulation                        |
| @react-oauth/google    | ^0.13   | Google Sign-In button                    |
| @radix-ui/react-dialog | ^1.1    | Accessible modal dialogs                 |
| Zod                    | ^3.23   | Shared schema validation                 |

### 5.3 Android App (`expo-auth-frontend`)

| Technology                             | Version | Purpose                           |
| -------------------------------------- | ------- | --------------------------------- |
| Expo                                   | ~54.0   | React Native development platform |
| React Native                           | 0.81.5  | Mobile UI framework               |
| React Navigation                       | ^7.0    | Stack + Bottom Tab navigation     |
| Zustand                                | ^5.0    | Lightweight state management      |
| NativeWind                             | ^4.1    | Tailwind CSS for React Native     |
| Axios                                  | ^1.7    | API communication                 |
| expo-notifications                     | ~0.18   | Local push notifications          |
| expo-auth-session                      | ~7.0    | OAuth 2.0 for Expo Go             |
| @react-native-async-storage            | 2.2.0   | Persistent local storage          |
| @react-native-community/datetimepicker | ^8.4    | Native date/time picker           |
| date-fns                               | ^4.1    | Date utilities                    |

### 5.4 Python AI Backend (`pythonBackend`)

| Technology    | Version | Purpose                         |
| ------------- | ------- | ------------------------------- |
| FastAPI       | 0.111.1 | Async API framework             |
| Uvicorn       | 0.24.0  | ASGI server                     |
| Motor         | 3.7.1   | Async MongoDB driver            |
| Pydantic      | 2.8.0   | Data validation/serialization   |
| Pandas        | 2.3.2   | Data aggregation and CSV export |
| LangChain     | 0.1.0   | LLM orchestration framework     |
| Qdrant Client | 1.8.0   | Vector database for RAG         |
| Requests      | 2.31.0  | HTTP calls to Ollama            |

### 5.5 Shared Package (`@hackgu/shared`)

| Technology | Purpose                                                     |
| ---------- | ----------------------------------------------------------- |
| TypeScript | Type-safe shared contracts                                  |
| Zod        | Shared validation schemas used by both frontend and backend |

### 5.6 External Services

| Service          | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| MongoDB Atlas    | Cloud-hosted NoSQL database                           |
| Qdrant           | Self-hosted vector database for RAG embeddings        |
| Ollama           | Local LLM runtime (`qwen2.5:7b` + `nomic-embed-text`) |
| Google OAuth     | Social login for web and mobile                       |
| Web Push (VAPID) | Browser push notification delivery                    |

---

## 6. Monorepo Structure

```
GUJARAT HACKATHON/                      ← Monorepo Root
├── package.json                        ← pnpm workspace config
├── pnpm-workspace.yaml                 ← Workspace definitions
├── .env / .env.example                 ← Root environment variables
├── medtrack_dataset.csv                ← Sample analytics output
│
├── shared/                             ← @hackgu/shared
│   └── src/
│       ├── index.ts                    ← Re-exports all schemas & enums
│       ├── enums.ts                    ← UserRole, DoseStatus, etc.
│       ├── auth.schema.ts              ← Login/Register Zod schemas
│       ├── medication.schema.ts        ← Medication Zod schemas
│       ├── dose-log.schema.ts          ← Dose log Zod schemas
│       ├── caregiver.schema.ts         ← Caregiver link schemas
│       ├── adherence.schema.ts         ← Adherence stats schemas
│       └── notification.schema.ts      ← Notification schemas
│
├── backend/                            ← @hackgu/backend (Express API)
│   └── src/
│       ├── app.ts                      ← Express app setup
│       ├── index.ts                    ← Server entry + cron init
│       ├── lib/swagger.ts              ← OpenAPI spec generator
│       ├── middlewares/
│       │   └── auth.middleware.ts      ← JWT verification middleware
│       ├── jobs/
│       │   └── reminder.job.ts         ← Cron: reminders + missed doses
│       └── modules/
│           ├── auth/                   ← Login, Register, Google OAuth
│           ├── medications/            ← Medication CRUD
│           ├── dose-log/               ← Dose tracking
│           ├── adherence/              ← Score, patterns, risk
│           ├── caregiver/              ← Patient–caregiver linking
│           ├── notifications/          ← In-app notifications
│           ├── push/                   ← Web Push (VAPID)
│           └── doctor/                 ← Doctor-facing APIs
│
├── frontend/                           ← @hackgu/frontend (Next.js 15)
│   └── src/
│       ├── app/
│       │   ├── layout.tsx              ← Root layout
│       │   ├── page.tsx                ← Landing / redirect
│       │   ├── login/                  ← Login page
│       │   ├── signup/                 ← Registration page
│       │   ├── dashboard/              ← Main adherence dashboard
│       │   ├── medications/            ← Medication management
│       │   ├── today/                  ← Today's dose timeline
│       │   ├── adherence/              ← Reports & charts
│       │   ├── history/                ← Historical dose log
│       │   ├── caregiver/              ← Caregiver management
│       │   ├── doctor/                 ← Doctor portal
│       │   └── profile/                ← User profile & settings
│       ├── components/                 ← Reusable UI components
│       ├── context/                    ← React Contexts (Socket, Auth)
│       ├── constants/                  ← API base URLs, etc.
│       └── lib/                        ← API client, crypto, hooks
│
├── androidVersion/                     ← Expo React Native App
│   └── src/
│       ├── screens/
│       │   ├── auth/                   ← LoginScreen, SignupScreen
│       │   └── home/                   ← Home, TodayMeds, Caregiver,
│       │                                  Insights, MedicationCabinet
│       ├── components/                 ← Input, Button, Card, etc.
│       ├── navigation/                 ← Stack + Tab navigators
│       ├── services/                   ← API service functions
│       ├── store/                      ← Zustand auth store
│       └── constants/                  ← API_URL, colors
│
└── pythonBackend/                      ← FastAPI AI/Analytics
    ├── main.py                         ← FastAPI app entry
    ├── rag.py                          ← RAG: embed + vector search + LLM
    ├── chat.py                         ← LangChain chat interface
    ├── services.py                     ← Analytics dataset aggregation
    ├── models.py                       ← Pydantic response models
    ├── db.py                           ← Motor async MongoDB connection
    └── requirements.txt                ← Python dependencies
```

---

## 7. Backend — Node.js/Express

### 7.1 Authentication Module (`/api/auth`)

- **Email/Password Registration** with bcryptjs password hashing (never stores plain text)
- **Login** with JWT token issuance (7-day expiry)
- **Google OAuth** via `google-auth-library` — verifies Google ID token and issues app JWT
- **Profile endpoints** (`GET /auth/me`, `PATCH /auth/me`) for profile updates
- JWT middleware (`auth.middleware.ts`) validates Bearer tokens on all protected routes

### 7.2 Medications Module (`/api/medications`)

- Full CRUD: Create, List, Get by ID, Update, Soft-delete (`isActive = false`)
- Fields: name, dosage, unit, frequency (DAILY/CUSTOM), scheduleTimes (array), startDate, endDate, notes
- All operations are user-scoped — a user can only see/edit their own medications

### 7.3 Dose Log Module (`/api/dose-logs`)

- **Log a dose**: Mark as TAKEN, MISSED, or DELAYED with timestamp
- **Auto-compute delay**: If `takenAt - scheduledAt > 60 minutes` → status auto-upgrades to DELAYED
- **Today's doses** endpoint: Returns the full schedule for the current day with real-time status
- **Filter support**: Query by date range, status, or medication ID

### 7.4 Adherence Module (`/api/adherence`)

**Scoring Formula:**

```
adherence_score = (doses_taken / total_scheduled_doses) × 100

Risk Thresholds:
  ≥ 80%  → LOW   (green)
  50–79% → MEDIUM (yellow)
  < 50%  → HIGH  (red)
```

**Pattern Detection (3 rules):**

1. **Night Doses Missed** — >60% of missed doses fall between 20:00–23:59
2. **Weekend Slippage** — Weekend adherence < (Weekday adherence − 20%)
3. **Streak Break** — 3+ consecutive missed doses for the same medication

Endpoints: `/score`, `/daily`, `/weekly`, `/patterns`, `/risk`

### 7.5 Caregiver Module (`/api/caregiver`)

- **Invite-based linking**: Patient sends caregiver invite by email
- **Status flow**: PENDING → ACCEPTED / REJECTED
- **Permissions**: `VIEW_ADHERENCE`, `RECEIVE_ALERTS`
- Caregiver can view all linked patients' adherence data and risk levels
- Patient can unlink any caregiver at any time

### 7.6 Cron Jobs (`reminder.job.ts`)

| Job                  | Schedule         | Action                                                           |
| -------------------- | ---------------- | ---------------------------------------------------------------- |
| Reminder sender      | Every 5 min      | Check medications due in next 15 min → create notification       |
| Missed dose detector | Every 10 min     | Find overdue PENDING doses → mark MISSED → alert caregiver       |
| Daily stub generator | Daily at 23:59   | Pre-generate PENDING dose log entries for next day               |
| ReminderLog dedup    | Before each send | Prevent duplicate reminder notifications per dose window per day |

### 7.7 Notifications Module (`/api/notifications`)

- In-app notification inbox (REMINDER, MISSED_DOSE, CAREGIVER_ALERT types)
- Fetch unread notifications, mark individual or all as read
- Color-coded by type in frontend: blue (reminder) / red (missed) / amber (caregiver alert)

### 7.8 Push Notifications (`/api/push`)

- Full Web Push API using VAPID keys and `web-push` library
- Users subscribe via browser → subscription saved in `PushSubscription` collection
- Backend sends push payloads to subscribed browsers on missed dose events
- Endpoints: `/subscribe`, `/unsubscribe`, `/status`, `/test`

### 7.9 Doctor Module (`/api/doctor`)

- Doctor-facing endpoint to view a patient's complete adherence history
- Supports shareable patient profile generation
- PDF report generation via PDFKit

---

## 8. Frontend — Next.js Web App

### 8.1 Pages

| Route              | Page           | Description                                             |
| ------------------ | -------------- | ------------------------------------------------------- |
| `/`                | Landing        | Redirect to dashboard or login                          |
| `/login`           | Login          | Email/password + Google OAuth                           |
| `/signup`          | Register       | Multi-field registration form                           |
| `/dashboard`       | Dashboard      | Adherence ring + risk badge + today's doses + quick log |
| `/medications`     | Medications    | List all medications with search/filter/toggle          |
| `/medications/new` | Add Medication | Form to create a new medication schedule                |
| `/today`           | Today's Doses  | Timeline view of all scheduled doses for today          |
| `/adherence`       | Reports        | Line charts, bar charts, pie chart (Recharts)           |
| `/history`         | Dose History   | Historical log with filters by date, status, medication |
| `/caregiver`       | Caregiver      | Link caregivers, view patient list (role-based)         |
| `/doctor`          | Doctor Portal  | Doctor view of patient adherence                        |
| `/profile`         | User Profile   | Edit profile, view adherence stats, logout              |

### 8.2 Key Components

- **Dashboard Adherence Ring** — Circular progress showing 30-day adherence %
- **Risk Level Badge** — Color-coded LOW/MEDIUM/HIGH badge
- **Dose Timeline Card** — Per-medication dose status with single-click mark actions
- **Notification Bell** — Unread count badge, dropdown inbox
- **Sidebar Navigation** — Icon + label nav with active route highlighting
- **Pattern Cards** — Each detected non-adherence pattern with recommendation

### 8.3 State & Data Layer

- **Axios API client** (`lib/api.ts`) with:
  - Request interceptor: attaches JWT from encrypted localStorage
  - Response interceptor: handles 401 → redirect to login
- **Socket.io context** for real-time notification delivery
- **Encrypted localStorage** via `crypto-js` for storing user session tokens

---

## 9. Android App — React Native (Expo)

### 9.1 Screens

| Screen                    | Description                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `LoginScreen`             | Email/password login + Google OAuth via expo-auth-session               |
| `SignupScreen`            | Full registration form                                                  |
| `HomeScreen`              | Quick overview: pending dose count, healthy streak, sign-out            |
| `TodayMedsScreen`         | Today's schedule with real-time status, tap-to-mark, pull-to-refresh    |
| `MedicationCabinetScreen` | Full medication list with add/edit/delete and frequency selection       |
| `CaregiverScreen`         | Role-based: patients see caregiver connections; caregivers see patients |
| `InsightsScreen`          | Adherence score, risk card, weekly trend, pattern-based guidance        |

### 9.2 Services Layer

```
src/services/
├── medicationService.js    → getTodayDosesService, markDoseAsTakenService
├── adherenceService.js     → getAdherenceScoreService, getAdherenceRiskService,
│                             getAdherenceWeeklyService, getAdherencePatternsService,
│                             getDailyAdherenceService
└── caregiverService.js     → getPatientsService, getMyCaregiversService,
                              linkCaregiverService, unlinkCaregiverService
```

### 9.3 State Management

- **Zustand** (`store/authStore.js`) for global auth state (token, user object)
- **AsyncStorage** for persistent token storage across app restarts
- **Optimistic UI** for dose marking — instant visual feedback before API confirmation

### 9.4 Navigation Structure

```
App
└── RootNavigator (Stack)
    ├── AuthStack
    │   ├── LoginScreen
    │   └── SignupScreen
    └── MainTabs (Bottom Tab Navigator)
        ├── Home
        ├── Today's Meds
        ├── Medication Cabinet
        ├── Caregiver
        └── Insights
```

---

## 10. Python AI/Analytics Backend

### 10.1 FastAPI Application (`main.py`)

Runs on port **8000** with Uvicorn. Endpoints:

| Endpoint            | Method | Description                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `/generate-dataset` | GET    | Run full analytics aggregation → returns JSON rows + summaries |
| `/export-csv`       | GET    | Generate dataset and return as downloadable CSV                |
| `/rag/query`        | GET    | Query the RAG system with a natural language question          |

All endpoints support optional `start` / `end` date filters (YYYY-MM-DD format).

### 10.2 Analytics Service (`services.py`)

Uses **Motor** (async MongoDB driver) + **Pandas** to:

1. Run a MongoDB aggregation pipeline over the `dose_logs` collection
2. Join with `users` and `medications` collections
3. Compute per-document adherence metrics (doses taken, missed, delay)
4. Group by `(user, medication, date)` for granular tracking
5. Aggregate further to **per-user summaries** and **overall dataset summary**
6. Export result to `medtrack_dataset.csv` for ML pipeline input

**Output Schemas (Pydantic):**

- `DatasetRowSchema` — One row per (user, medication, date)
- `PerUserSummarySchema` — Aggregated totals per user
- `OverallSummarySchema` — Dataset-wide stats (total users, doses, adherence %)

---

## 11. Database Design

All collections reside in **MongoDB Atlas**. Mongoose ODM is used in the Node.js backend. Motor is used in the Python backend.

### 11.1 Users Collection

| Field            | Type   | Notes                                                       |
| ---------------- | ------ | ----------------------------------------------------------- |
| `name`           | String | Required                                                    |
| `email`          | String | Unique, required                                            |
| `password`       | String | bcrypt hash, optional (Google OAuth users may not have one) |
| `role`           | Enum   | `PATIENT` / `CAREGIVER` / `DOCTOR`                          |
| `phone`          | String | Optional                                                    |
| `timezone`       | String | Default: `Asia/Kolkata`                                     |
| `adherenceScore` | Number | Cached score, optional                                      |

### 11.2 Medications Collection

| Field           | Type            | Notes                     |
| --------------- | --------------- | ------------------------- |
| `userId`        | ObjectId → User | Indexed                   |
| `name`          | String          | Medication name           |
| `dosage`        | String          | e.g., "500mg"             |
| `unit`          | String          | mg / ml / tablet          |
| `frequency`     | Enum            | DAILY / CUSTOM            |
| `scheduleTimes` | [String]        | Array of "HH:MM" strings  |
| `startDate`     | Date            | Required                  |
| `endDate`       | Date            | Optional                  |
| `isActive`      | Boolean         | Soft-delete flag, indexed |
| `notes`         | String          | Optional                  |

### 11.3 Dose Logs Collection

| Field          | Type                  | Notes                              |
| -------------- | --------------------- | ---------------------------------- |
| `userId`       | ObjectId → User       | Required                           |
| `medicationId` | ObjectId → Medication | Indexed                            |
| `scheduledAt`  | Date                  | When this dose was due             |
| `takenAt`      | Date                  | When user actually took it         |
| `status`       | Enum                  | PENDING / TAKEN / MISSED / DELAYED |
| `delayMinutes` | Number                | Auto-computed if delayed           |
| `notes`        | String                | Optional                           |

**Indexes:** Compound `{ userId, scheduledAt }` for efficient date-range queries.

### 11.4 Caregiver Links Collection

| Field            | Type            | Notes                               |
| ---------------- | --------------- | ----------------------------------- |
| `patientId`      | ObjectId → User | Indexed                             |
| `caregiverId`    | ObjectId → User | Optional (filled on acceptance)     |
| `caregiverEmail` | String          | Required (used for invite matching) |
| `relationship`   | String          | e.g., "Spouse", "Child"             |
| `status`         | Enum            | PENDING / ACCEPTED / REJECTED       |
| `permissions`    | [String]        | `VIEW_ADHERENCE`, `RECEIVE_ALERTS`  |
| `invitedAt`      | Date            | Timestamp of invite                 |
| `respondedAt`    | Date            | Timestamp of response               |

**Unique Index:** `{ patientId, caregiverEmail }` — prevents duplicate invites.

### 11.5 Notifications Collection

| Field          | Type                  | Notes                                    |
| -------------- | --------------------- | ---------------------------------------- |
| `userId`       | ObjectId → User       | Required                                 |
| `type`         | Enum                  | REMINDER / MISSED_DOSE / CAREGIVER_ALERT |
| `medicationId` | ObjectId → Medication | Optional                                 |
| `message`      | String                | Notification text                        |
| `isRead`       | Boolean               | Default: false                           |
| `scheduledAt`  | Date                  | Indexed                                  |
| `sentAt`       | Date                  | When actually delivered                  |

### 11.6 Push Subscriptions Collection

| Field         | Type            | Notes                 |
| ------------- | --------------- | --------------------- |
| `userId`      | ObjectId → User | Unique                |
| `endpoint`    | String          | Browser push endpoint |
| `keys.p256dh` | String          | Encryption key        |
| `keys.auth`   | String          | Auth secret           |

### 11.7 Reminder Logs Collection

Prevents duplicate reminders from being sent within the same dose window.

| Field           | Type     | Notes                  |
| --------------- | -------- | ---------------------- |
| `userId`        | ObjectId | Required               |
| `medicationId`  | ObjectId | Required               |
| `scheduledTime` | String   | "HH:MM"                |
| `dateKey`       | String   | "YYYY-MM-DD"           |
| `sentAt`        | Date     | When reminder was sent |

**Unique Index:** `{ userId, medicationId, scheduledTime, dateKey }`

### 11.8 Shared Enums (`@hackgu/shared`)

```typescript
export enum UserRole {
  PATIENT = "PATIENT",
  CAREGIVER = "CAREGIVER",
  DOCTOR = "DOCTOR",
}
export enum DoseStatus {
  TAKEN = "TAKEN",
  MISSED = "MISSED",
  DELAYED = "DELAYED",
  PENDING = "PENDING",
}
export enum FrequencyType {
  DAILY = "DAILY",
  CUSTOM = "CUSTOM",
}
export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}
export enum NotifType {
  REMINDER = "reminder",
  MISSED_DOSE = "missed_dose",
  CAREGIVER_ALERT = "caregiver_alert",
}
```

---

## 12. API Reference

Full Swagger UI available at: `http://localhost:5000/api-docs`

### Auth Endpoints

| Method | Route                | Auth | Description              |
| ------ | -------------------- | ---- | ------------------------ |
| POST   | `/api/auth/register` | ❌   | Register new user        |
| POST   | `/api/auth/login`    | ❌   | Login, returns JWT       |
| POST   | `/api/auth/google`   | ❌   | Google OAuth login       |
| GET    | `/api/auth/me`       | ✅   | Get current user profile |
| PATCH  | `/api/auth/me`       | ✅   | Update user profile      |

### Medications Endpoints

| Method | Route                  | Auth | Description            |
| ------ | ---------------------- | ---- | ---------------------- |
| POST   | `/api/medications`     | ✅   | Create medication      |
| GET    | `/api/medications`     | ✅   | List all medications   |
| GET    | `/api/medications/:id` | ✅   | Get medication by ID   |
| PUT    | `/api/medications/:id` | ✅   | Update medication      |
| DELETE | `/api/medications/:id` | ✅   | Soft-delete medication |

### Dose Log Endpoints

| Method | Route                  | Auth | Description             |
| ------ | ---------------------- | ---- | ----------------------- |
| POST   | `/api/dose-logs`       | ✅   | Log a dose              |
| GET    | `/api/dose-logs`       | ✅   | Get logs with filters   |
| GET    | `/api/dose-logs/today` | ✅   | Today's scheduled doses |
| PUT    | `/api/dose-logs/:id`   | ✅   | Update a dose log       |

### Adherence Endpoints

| Method | Route                     | Auth | Description                  |
| ------ | ------------------------- | ---- | ---------------------------- |
| GET    | `/api/adherence/score`    | ✅   | Overall score (30-day)       |
| GET    | `/api/adherence/daily`    | ✅   | Day-by-day breakdown         |
| GET    | `/api/adherence/weekly`   | ✅   | Week-by-week trend           |
| GET    | `/api/adherence/patterns` | ✅   | Detected patterns            |
| GET    | `/api/adherence/risk`     | ✅   | Risk level (LOW/MEDIUM/HIGH) |

### Caregiver Endpoints

| Method | Route                          | Auth | Description               |
| ------ | ------------------------------ | ---- | ------------------------- |
| POST   | `/api/caregiver/invite`        | ✅   | Send caregiver invite     |
| POST   | `/api/caregiver/respond`       | ✅   | Accept or reject invite   |
| GET    | `/api/caregiver/invites`       | ✅   | List pending invites      |
| GET    | `/api/caregiver/my-caregivers` | ✅   | List my caregivers        |
| GET    | `/api/caregiver/patients`      | ✅   | List caregiver's patients |
| DELETE | `/api/caregiver/link/:id`      | ✅   | Unlink caregiver          |

### Notifications Endpoints

| Method | Route                         | Auth | Description              |
| ------ | ----------------------------- | ---- | ------------------------ |
| GET    | `/api/notifications`          | ✅   | Get unread notifications |
| PUT    | `/api/notifications/:id/read` | ✅   | Mark one as read         |
| PUT    | `/api/notifications/read-all` | ✅   | Mark all as read         |

### Push Notification Endpoints

| Method | Route                   | Auth | Description                    |
| ------ | ----------------------- | ---- | ------------------------------ |
| POST   | `/api/push/subscribe`   | ✅   | Save browser push subscription |
| POST   | `/api/push/unsubscribe` | ✅   | Remove push subscription       |
| GET    | `/api/push/status`      | ✅   | Check subscription status      |
| POST   | `/api/push/test`        | ✅   | Send a test push notification  |

### Python Analytics Endpoints (Port 8000)

| Method | Route               | Auth | Description                 |
| ------ | ------------------- | ---- | --------------------------- |
| GET    | `/generate-dataset` | ❌   | Full adherence dataset JSON |
| GET    | `/export-csv`       | ❌   | Download dataset as CSV     |
| GET    | `/rag/query?q=...`  | ❌   | Query the RAG AI assistant  |

---

## 13. RAG System & AI Pipeline

### 13.1 Overview

The RAG (Retrieval-Augmented Generation) system powers MedTrack's AI-assisted medication intelligence. Instead of relying on a generic LLM, **all answers are grounded in a real medication dataset**, making responses clinically relevant and factually anchored.

### 13.2 Architecture

```
User Query
    │
    ▼
[nomic-embed-text (Ollama)]  ← Embed query into vector
    │
    ▼
[Qdrant Vector DB]  ← cosine similarity search → Top-K relevant drug records
    │
    ▼
[Prompt Construction]  ← Query + retrieved context passages
    │
    ▼
[qwen2.5:7b (Ollama)]  ← Generate contextual answer
    │
    ▼
Answer returned to user
```

### 13.3 Data Ingestion

- **Source:** `Medicine_Details.csv` — comprehensive drug information dataset
- Each CSV row is converted to a natural-language paragraph
- Rows are embedded in **batches of 64** via `nomic-embed-text`
- Vectors are stored in **Qdrant** collection named `hackathon`
- **Cosine similarity** is used for retrieval
- Ingestion endpoint: `POST /rag/ingest`

### 13.4 LLM Configuration

| Parameter       | Value                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| Embedding Model | `nomic-embed-text:latest`                                                   |
| Chat Model      | `qwen2.5:7b`                                                                |
| LLM Temperature | `0.0` (deterministic, factual)                                              |
| Top-K retrieval | 5 passages                                                                  |
| Context window  | Retrieved CSV row texts                                                     |
| System Prompt   | "Answer medicine and drug information questions using the provided context" |

### 13.5 Use Cases

- "What are the side effects of Metformin?"
- "Can I take Ibuprofen with Aspirin?"
- "What is the typical dosage for Amlodipine?"
- "Does this medication interact with alcohol?"

### 13.6 Drug Conflict Warning (Planned Extension)

The RAG system is the foundation for the **drug conflict warning feature**:

1. User uploads prescription/medical report → system extracts current medications
2. When user attempts to add a new medication, RAG is queried for interactions
3. If conflict/allergy risk is detected → user is warned **before adding the medication**
4. This is a safety net since doctors may not have full visibility of all drugs a patient is taking

---

## 14. Zero UI Design for Elderly Users

### 14.1 Philosophy

**Zero UI** means reducing the interface to absolute essentials so that elderly users — who may have low digital literacy, vision impairment, or cognitive decline — can accomplish critical health tasks without confusion.

### 14.2 Implementation Principles

| Principle                  | Implementation                                                                  |
| -------------------------- | ------------------------------------------------------------------------------- |
| **Minimal decisions**      | Critical actions (Mark Taken) are primary buttons; everything else is secondary |
| **Large tap targets**      | All interactive elements ≥ 48×48dp (Android minimum accessibility standard)     |
| **High contrast**          | Dark background with bright accent colors; WCAG AA compliant                    |
| **Clear iconography**      | Lucide icons paired with text labels — never icon-only                          |
| **Progressive disclosure** | Show only what matters now; hide advanced settings behind settings screens      |
| **No jargon**              | "Take your medicine" not "Log a dose event for medication ID..."                |
| **Error prevention**       | Confirmation dialogs before destructive actions (delete, unlink)                |
| **Pull-to-refresh**        | No complex state management for users — just pull down to refresh               |

### 14.3 Mobile-First for Elderly

- Bottom tab navigation (thumb-friendly)
- Large font sizes as default
- Optimistic UI — instant visual feedback on tap (no confusing loading delays)
- Streak encouragement text (gamification for motivation)
- Simple yes/no confirmation dialogs

---

## 15. Notification & Alarm System

### 15.1 Multi-Channel Notification Architecture

MedTrack uses **three parallel notification channels** to ensure medication reminders reach users:

| Channel              | Technology               | Target                                       |
| -------------------- | ------------------------ | -------------------------------------------- |
| In-app Notifications | MongoDB + React State    | Web and Mobile                               |
| Web Push             | VAPID + Browser Push API | Web browsers (even when app closed)          |
| Local Notifications  | expo-notifications       | Android device (even when app in background) |
| Real-time updates    | Socket.io                | Instant delivery when app is open            |

### 15.2 Alarm-Theme Reminders with Snooze

The notification UX follows an **alarm-like pattern** familiar to elderly users:

1. **15 minutes before** scheduled dose → pre-reminder notification sent
2. **At scheduled dose time** → primary alarm-style reminder delivered
3. **Snooze option** — user can defer the reminder by a configurable interval (e.g., 15 min, 30 min) for a "future reminder"
4. **If no action after X minutes** → dose is marked MISSED, caregiver alert triggered
5. **Caregiver Escalation** → if patient misses 3+ consecutive doses, the linked caregiver receives a priority alert

### 15.3 Notification Types

| Type            | Color    | Trigger                                   |
| --------------- | -------- | ----------------------------------------- |
| REMINDER        | 🔵 Blue  | 15 min before scheduled dose              |
| MISSED_DOSE     | 🔴 Red   | Dose window passed without logging        |
| CAREGIVER_ALERT | 🟡 Amber | Escalated to caregiver on repeated misses |

### 15.4 Deduplication

`ReminderLog` collection prevents the same reminder from being sent multiple times within the same dose window. Compound unique index on `{ userId, medicationId, scheduledTime, dateKey }`.

---

## 16. Medical Safety & Drug Conflict Warning

### 16.1 The Problem

Doctors are often unaware of all the medications a patient is currently taking — especially when a patient visits multiple specialists. Drug interactions and allergy conflicts are a leading cause of preventable hospital admissions.

### 16.2 How MedTrack Solves This

1. **User uploads medical reports / doctor prescriptions** (PDF or image)
2. System parses and extracts current medication list
3. When user adds a **new medication**, the system:
   - Queries the RAG engine for known drug interactions
   - Checks user's existing medication list for conflicts
   - Cross-references with any uploaded allergy information
4. If a conflict is detected → **Warning banner shown before save** with specific interaction details
5. User can proceed with informed consent, or cancel and consult their doctor

### 16.3 Safety First Design

- Warnings are shown **proactively** (before adding), not reactively
- Conflict alerts include severity level and recommended action
- All warnings are logged for the patient's shareable health profile

---

## 17. User Profile & Shareable Medical History

### 17.1 The Problem

Every time a patient visits a new doctor, they start from scratch. There is no portable, structured medical history that a patient can hand to a healthcare provider in real-time.

### 17.2 MedTrack's Digital Health Profile

Each user has a **structured health profile** containing:

- Personal information (name, DOB, contact, timezone)
- Complete medication history (current + past medications with dosages)
- Dose adherence records (timestamps, delay metrics, status history)
- Uploaded documents (prescriptions, medical reports, lab results)
- Detected allergy/conflict flags
- 30-day adherence score and risk level

### 17.3 Sharing Mechanisms

| Method                | How                                                         |
| --------------------- | ----------------------------------------------------------- |
| **Direct share link** | Patient generates a time-limited URL that a doctor can open |
| **PDF export**        | Generate a formatted PDF via PDFKit and download/email it   |
| **Doctor Portal**     | Doctor with an account can access shared patient profiles   |
| **QR code** (planned) | Patient shows QR at clinic; doctor scans to pull up profile |

### 17.4 Privacy & Access Control

- Patients explicitly grant access to specific doctors/caregivers
- Caregiver permissions are granular (`VIEW_ADHERENCE`, `RECEIVE_ALERTS`)
- Share links can be revoked at any time
- All data is user-scoped at the database level

---

## 18. Data Analytics & Population Health

### 18.1 Beyond Individual Monitoring

MedTrack is not just a personal health app — it is a **population health intelligence platform**. The aggregated (anonymized) data from all users provides insights that are invaluable to the medical industry.

### 18.2 Analytics Pipeline

```
MongoDB Atlas (raw dose logs)
    │
    ▼
Python FastAPI service (Motor async aggregation)
    │
    ▼
MongoDB Aggregation Pipeline
    ├── Join: dose_logs + users + medications
    ├── Filter: PATIENT role only
    ├── Group by: (user, medication, date)
    └── Compute: adherence %, avg delay, doses taken/missed
    │
    ▼
Pandas DataFrame
    ├── Per-user summaries
    ├── Overall dataset summary
    └── Export to medtrack_dataset.csv
    │
    ▼
ML/Research Pipeline Input
```

### 18.3 Dataset Output Schema

Each row in the exported dataset represents one (user, medication, date) combination:

| Column                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `user_id`               | Anonymized user identifier               |
| `user_name`             | Patient name                             |
| `email`                 | Contact email                            |
| `timezone`              | Patient's timezone                       |
| `medication_id`         | Medication identifier                    |
| `medication_name`       | Drug name                                |
| `dosage`                | Dosage amount                            |
| `frequency`             | DAILY / CUSTOM                           |
| `date`                  | Calendar date (patient's local timezone) |
| `total_scheduled_doses` | How many doses were scheduled            |
| `doses_taken`           | How many were actually taken             |
| `doses_missed`          | How many were missed                     |
| `adherence_percentage`  | (taken/scheduled) × 100                  |
| `avg_delay_minutes`     | Average delay for taken doses            |

### 18.4 Research Value

This dataset enables:

- **Age-group analysis** — How does adherence vary across age groups for specific medications?
- **Medication efficacy correlation** — Which medications have the highest adherence rates?
- **Time-of-day analysis** — When are patients most likely to miss doses?
- **Disease-type adherence** — Compare diabetes vs. hypertension medication adherence
- **Caregiver impact study** — Do patients with linked caregivers have better adherence?
- **Drug interaction research** — Identify combinations that real-world patients find hard to maintain

---

## 19. Caregiver System

### 19.1 Invite Flow

```
Patient → Enters caregiver email + relationship
    │
    ▼
System creates CaregiverLink (status: PENDING)
    │
    ▼
Caregiver registers/logs in with matching email
    │
    ▼
Caregiver sees pending invite → Accepts or Rejects
    │
    ▼
Status → ACCEPTED
    │
    ▼
Caregiver can now view patient's adherence data
```

### 19.2 Caregiver Dashboard Features

- Multi-patient overview: one card per linked patient
- Each card shows: adherence score, risk badge, last activity timestamp
- Click-through to full patient adherence report
- Receive alerts when patient misses critical doses

### 19.3 Role-Based UI

Both web and mobile apps detect the user's role (`PATIENT` or `CAREGIVER`) and show different UI:

- **Patient view**: Manage their own medications, see their own caregivers list
- **Caregiver view**: See all linked patients and their adherence metrics

---

## 20. Environment Setup & Running Locally

### 20.1 Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8
- Python ≥ 3.11
- MongoDB Atlas account (or local MongoDB)
- Ollama installed locally with `qwen2.5:7b` and `nomic-embed-text` pulled
- Qdrant running locally on port 6333

### 20.2 Environment Variables (`.env`)

```env
# Backend
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/medtrack
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your-google-client-id
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=mailto:you@example.com

# Frontend (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Python Backend
QDRANT_URL=http://localhost:6333
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_EMBED_MODEL=nomic-embed-text:latest
OLLAMA_CHAT_MODEL=qwen2.5:7b
```

### 20.3 Install & Run

```bash
# Install all workspace dependencies
pnpm install

# Start backend (port 5000)
pnpm --filter @hackgu/backend dev

# Start frontend (port 3000)
pnpm --filter @hackgu/frontend dev

# Start Python backend (port 8000)
cd pythonBackend
pip install -r requirements.txt
uvicorn pythonBackend.main:app --reload --port 8000

# Start Android Expo app
cd androidVersion
npx expo start
```

### 20.4 Ollama Setup (for RAG)

```bash
# Install Ollama (Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull required models
ollama pull qwen2.5:7b
ollama pull nomic-embed-text

# Ingest medicine dataset into Qdrant
curl -X POST http://localhost:8000/rag/ingest
```

---

## 21. Social Impact & Differentiation

### 21.1 Differentiation from Existing Solutions

| Existing Solution      | Limitation                                     | MedTrack's Advantage                                  |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| Medisafe / MyTherapy   | No caregiver dashboard, no AI, no analytics    | Full caregiver system + RAG AI + population analytics |
| Hospital EMR systems   | Doctor-facing only, no patient self-management | Patient-first UI with caregiver and doctor bridges    |
| Generic alarm apps     | Can't verify dose taken, no data logging       | Active confirmation + missed dose detection           |
| WhatsApp family groups | Unstructured, manual, no history               | Structured real-time alerts with historical context   |
| Pharmacy apps          | Focus on ordering, not adherence               | Focused on dose compliance and health outcomes        |

### 21.2 Social Impact

1. **Reduce preventable hospitalizations** — Early intervention before non-adherence escalates
2. **Support India's TB elimination goal** — Field health workers can monitor patient adherence remotely
3. **Empower eldercare** — Family members get a reliable monitoring tool for elderly parents
4. **Reduce healthcare costs** — Fewer complications for patients, fewer hospitalizations for state
5. **Enable data-driven prescriptions** — Adherence data shared with doctors enables real-world-based prescription adjustments
6. **Medical research acceleration** — Population adherence dataset provides researchers with real behavioral data

### 21.3 Success Metrics

| Metric                     | Target                                |
| -------------------------- | ------------------------------------- |
| Dose logging response time | < 2 seconds end-to-end                |
| Adherence score accuracy   | 100% match against manual calculation |
| Reminder delivery latency  | Within 5 minutes of scheduled time    |
| Caregiver alert trigger    | < 10 minutes after dose miss          |
| Dashboard data freshness   | Real-time (< 30 second lag)           |
| Mobile usability           | Fully functional on screens ≥ 320px   |

---

_This document is the complete single source of truth for MedTrack — Gujarat Hackathon 2026._
_Built with ❤️ for better healthcare accessibility in India._
