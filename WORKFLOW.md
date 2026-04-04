# 🔄 MedTrack — Complete System Workflow

> **Project:** MedTrack — Medication Non-Adherence Monitoring System
> **Competition:** Gujarat Hackathon 2026 (CRAFTATHON GU 2026)
> **Document Type:** System Workflow · User Journeys · Data Flow

---

## 📋 Table of Contents

1. [High-Level System Workflow](#1-high-level-system-workflow)
2. [User Onboarding Workflow](#2-user-onboarding-workflow)
3. [Medication Setup Workflow](#3-medication-setup-workflow)
4. [Daily Dose Tracking Workflow](#4-daily-dose-tracking-workflow)
5. [Alarm & Notification Workflow](#5-alarm--notification-workflow)
6. [Caregiver Alert Workflow](#6-caregiver-alert-workflow)
7. [Drug Conflict Warning Workflow](#7-drug-conflict-warning-workflow)
8. [RAG AI Query Workflow](#8-rag-ai-query-workflow)
9. [Adherence Scoring Workflow](#9-adherence-scoring-workflow)
10. [Health Profile & Doctor Share Workflow](#10-health-profile--doctor-share-workflow)
11. [Population Analytics Workflow](#11-population-analytics-workflow)
12. [Data Flow Across All Services](#12-data-flow-across-all-services)

---

## 1. High-Level System Workflow

This is the master view of how all major components interact:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                                     │
│  Register → Add Medications → Log Doses → View Reports → Share Profile  │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │     NEXT.js FRONTEND         │  ←── Web Browser
              │  (Port 3000/3001)            │
              └──────────────┬──────────────┘
                             │  REST API + Socket.io
              ┌──────────────▼──────────────┐
              │   EXPRESS BACKEND (Node.js)  │  ←── Port 5000
              │  Auth · Meds · Doses ·       │
              │  Adherence · Caregiver ·     │
              │  Notifications · Push        │
              └──┬───────────┬──────────────┘
                 │           │
    ┌────────────▼──┐   ┌────▼─────────────────┐
    │  MongoDB Atlas │   │  PYTHON BACKEND       │
    │  (All data)    │   │  FastAPI (Port 8000)  │
    │                │   │  RAG · Analytics      │
    │  users         │   │  Qdrant · Ollama      │
    │  medications   │   └──────────────────────┘
    │  dose_logs     │
    │  notifications │
    │  caregiver_    │
    │  links         │
    └────────────────┘
              │
    ┌─────────▼──────────┐
    │  ANDROID APP        │  ←── Expo (React Native)
    │  (Port: N/A –       │
    │   connects to :5000)│
    └─────────────────────┘
```

---

## 2. User Onboarding Workflow

### 2.1 New Patient Registration

```
START
  │
  ▼
User opens MedTrack (Web or Android)
  │
  ├──► Option A: Email/Password Registration
  │         │
  │         ▼
  │    Fill form: Name, Email, Password, Phone, Role (PATIENT)
  │         │
  │         ▼
  │    Frontend validates with Zod schema (@hackgu/shared)
  │         │
  │         ▼
  │    POST /api/auth/register
  │         │
  │         ▼
  │    Backend: bcryptjs hashes password → saves User to MongoDB
  │         │
  │         ▼
  │    JWT token issued (7-day expiry)
  │         │
  │         ▼
  │    Token stored in encrypted localStorage (web) / AsyncStorage (Android)
  │
  └──► Option B: Google OAuth
            │
            ▼
       User clicks "Sign in with Google"
            │
            ▼
       Google OAuth consent screen → Google returns ID token
            │
            ▼
       POST /api/auth/google  { credential: <google_id_token> }
            │
            ▼
       Backend: google-auth-library verifies token
            │
            ├── New user → create User record in MongoDB
            └── Existing user → fetch existing record
            │
            ▼
       JWT token issued and returned
            │
            ▼
       Token stored → User lands on Dashboard
  │
  ▼
ONBOARDING COMPLETE → Redirect to /dashboard
```

### 2.2 Role Assignment

```
At registration, user selects role:

PATIENT role
  └── Can: add medications, log doses, link caregivers, view own reports,
           share profile with doctor, use AI assistant

CAREGIVER role
  └── Can: view linked patients' adherence, receive alerts,
           see patient risk scores, access patient history

DOCTOR role
  └── Can: view shared patient profiles, annotate records,
           access full medication + adherence history
```

---

## 3. Medication Setup Workflow

### 3.1 Adding a New Medication

```
Patient navigates to /medications
  │
  ▼
Clicks "Add Medication"
  │
  ▼
Fills medication form:
  ├── Medication Name     (e.g., "Metformin")
  ├── Dosage              (e.g., "500")
  ├── Unit                (mg / ml / tablet)
  ├── Frequency           (DAILY or CUSTOM days)
  ├── Schedule Times      (e.g., ["08:00", "20:00"])
  ├── Start Date          (required)
  ├── End Date            (optional)
  └── Notes               (optional)
  │
  ▼
[DRUG CONFLICT CHECK TRIGGERED]
  │
  ├── Frontend queries: GET /rag/query?q="Does {new_med} interact with {existing_meds}?"
  │
  ├── RAG engine searches Qdrant vector store
  │
  ├── Result:
  │     ├── NO conflict detected → proceed silently
  │     └── CONFLICT detected → show warning banner
  │               │
  │               ▼
  │         Warning: "⚠️ Metformin may interact with [existing drug].
  │                    Consult your doctor before proceeding."
  │               │
  │               ├── User clicks "Proceed Anyway" → saves medication
  │               └── User clicks "Cancel" → returns to form
  │
  ▼
POST /api/medications
  │
  ▼
Backend validates with Zod → saves Medication to MongoDB
  │
  ▼
[CRON JOB TRIGGERS]
Daily stub generator (runs at 23:59) creates PENDING DoseLog
entries for every scheduledTime for the next day
  │
  ▼
Medication appears in patient's medication list ✅
```

---

## 4. Daily Dose Tracking Workflow

### 4.1 Morning Routine — Patient Marks a Dose

```
Patient wakes up, opens MedTrack
  │
  ▼
Navigates to /today  (Today's Dose Timeline)
  │
  ▼
GET /api/dose-logs/today
  │
  ▼
Backend returns all scheduled doses for today with current status:

  ┌─────────────────────────────────────────┐
  │  08:00 → Metformin 500mg    [PENDING]   │
  │  08:00 → Amlodipine 5mg     [PENDING]   │
  │  13:00 → Metformin 500mg    [PENDING]   │
  │  20:00 → Metformin 500mg    [PENDING]   │
  └─────────────────────────────────────────┘
  │
  ▼
Patient taps "Mark Taken" on Metformin 08:00
  │
  ▼
[OPTIMISTIC UI UPDATE] → Shows as TAKEN immediately (no loading delay)
  │
  ▼
POST /api/dose-logs  {
  medicationId: "...",
  scheduledAt: "2026-04-04T08:00:00+05:30",
  takenAt: "2026-04-04T08:07:00+05:30",   ← current time
  status: "TAKEN"
}
  │
  ▼
Backend computes:
  delayMinutes = (takenAt - scheduledAt) = 7 minutes
  │
  ├── delayMinutes ≤ 60 → status stays "TAKEN"
  └── delayMinutes > 60 → status auto-upgraded to "DELAYED"
  │
  ▼
DoseLog saved to MongoDB
  │
  ▼
Socket.io emits event → Dashboard updates in real-time
  │
  ▼
Adherence score recalculated in background
```

### 4.2 Dose Status State Machine

```
                  ┌─────────┐
                  │ PENDING │  ← Created by daily cron stub
                  └────┬────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       TAKEN        MISSED       DELAYED
  (User tapped   (Cron detected  (User tapped
   "Mark Taken"   window passed)  "Mark Taken"
   within 60min)                  after 60+ min)
```

---

## 5. Alarm & Notification Workflow

### 5.1 Reminder Cron Cycle (runs every 5 minutes)

```
[CRON JOB — every 5 minutes]
  │
  ▼
Query medications WHERE scheduledTime is within next 15 minutes
  AND today's date is between startDate and endDate
  AND isActive = true
  │
  ▼
For each matched medication + time slot:
  │
  ├── Check ReminderLog: has reminder already been sent today for this
  │   {userId, medicationId, scheduledTime, dateKey}?
  │
  ├── YES → Skip (deduplication — no duplicate alerts)
  │
  └── NO → Create Notification record in MongoDB
                │
                ▼
           {
             userId:      "...",
             type:        "REMINDER",
             medicationId:"...",
             message:     "Time to take Metformin 500mg",
             isRead:      false,
             scheduledAt: [scheduled datetime],
             sentAt:      [now]
           }
                │
                ▼
           Emit via Socket.io → frontend bell updates instantly
                │
                ▼
           Send Web Push (VAPID) → browser notification even if tab closed
                │
                ▼
           Write to ReminderLog → prevents duplicate for this dose window
```

### 5.2 Snooze Flow

```
Patient receives reminder notification
  │
  ▼
Options presented:
  ├── ✅ "Take Now"   → Marks dose TAKEN immediately
  ├── 💤 "Snooze 15" → Schedules new reminder in 15 min
  ├── 💤 "Snooze 30" → Schedules new reminder in 30 min
  └── ❌ "Dismiss"   → No action (dose stays PENDING until cron detects miss)
  │
  ▼
[If Snooze selected]
  │
  ▼
New Notification record created with scheduledAt = now + snooze_minutes
  │
  ▼
Cron picks it up in next cycle → sends follow-up reminder
  │
  ▼
[If Snooze expires and dose still PENDING]
  │
  ▼
Missed Dose Detector triggers → see Section 6
```

### 5.3 Missed Dose Detection (runs every 10 minutes)

```
[CRON JOB — every 10 minutes]
  │
  ▼
Query DoseLogs WHERE:
  status = "PENDING"
  AND scheduledAt < (now - grace_period)   ← grace period = 60 min
  │
  ▼
For each overdue PENDING log:
  │
  ├── Update DoseLog status → "MISSED"
  │
  └── Create MISSED_DOSE notification for patient
        │
        ▼
  Check: Is this the 3rd consecutive missed dose for this medication?
        │
        ├── YES → Trigger CAREGIVER_ALERT → see Section 6
        └── NO  → Notify patient only
```

---

## 6. Caregiver Alert Workflow

### 6.1 Caregiver Linking Flow

```
Patient navigates to /caregiver
  │
  ▼
Enters caregiver's email + relationship (e.g., "Daughter")
  │
  ▼
POST /api/caregiver/invite
  │
  ▼
System creates CaregiverLink in MongoDB:
  {
    patientId:      "...",
    caregiverEmail: "daughter@email.com",
    relationship:   "Daughter",
    status:         "PENDING",
    permissions:    ["VIEW_ADHERENCE", "RECEIVE_ALERTS"],
    invitedAt:      [now]
  }
  │
  ▼
Caregiver registers/logs in with matching email
  │
  ▼
GET /api/caregiver/invites → Caregiver sees pending invite
  │
  ▼
Caregiver clicks "Accept"
  │
  ▼
POST /api/caregiver/respond  { status: "ACCEPTED" }
  │
  ▼
CaregiverLink updated:
  status: "ACCEPTED"
  caregiverId: [caregiver's user._id]
  respondedAt: [now]
  │
  ▼
Caregiver can now see patient's adherence dashboard ✅
```

### 6.2 Caregiver Escalation Alert Flow

```
[MISSED DOSE DETECTED — 3+ consecutive misses for same medication]
  │
  ▼
Find all accepted CaregiverLinks WHERE patientId = missed patient
  AND permissions includes "RECEIVE_ALERTS"
  │
  ▼
For each linked caregiver:
  │
  ├── Create CAREGIVER_ALERT notification for caregiver
  │     message: "⚠️ [Patient Name] has missed Metformin 3 times in a row"
  │
  ├── Emit via Socket.io to caregiver's active session
  │
  └── Send Web Push to caregiver's subscribed browser
  │
  ▼
Caregiver opens app → sees alert notification
  │
  ▼
Caregiver views patient's full adherence dashboard:
  ├── Current adherence score + risk level
  ├── Recent dose log (last 7 days)
  ├── Pattern cards (night miss / weekend slippage / streak break)
  └── Option to call/message patient (via device contact)
```

---

## 7. Drug Conflict Warning Workflow

```
Patient tries to add new medication "Aspirin 100mg"
  │
  ▼
Before save: system retrieves patient's existing active medications
  existing = ["Warfarin 5mg", "Metformin 500mg", "Amlodipine 5mg"]
  │
  ▼
Query RAG system:
  GET /rag/query?q="Does Aspirin interact with Warfarin, Metformin, or Amlodipine?"
  │
  ▼
RAG Workflow:
  ┌─────────────────────────────────────────────────────┐
  │  1. Embed query using nomic-embed-text (Ollama)     │
  │  2. Cosine similarity search in Qdrant              │
  │  3. Retrieve top-5 most relevant medication records  │
  │  4. Build prompt: context + question                 │
  │  5. Send to qwen2.5:7b at temperature 0.0           │
  │  6. Return factual, dataset-grounded answer          │
  └─────────────────────────────────────────────────────┘
  │
  ▼
RAG returns: "Aspirin combined with Warfarin significantly increases
              bleeding risk. This combination is contraindicated
              without close medical supervision."
  │
  ▼
Frontend displays warning banner:
  ┌────────────────────────────────────────────────────────┐
  │  ⚠️ DRUG INTERACTION WARNING                           │
  │  Aspirin may cause dangerous bleeding when taken with  │
  │  your current medication Warfarin.                     │
  │  Please consult your doctor before adding this.        │
  │                                                        │
  │  [Cancel]                    [Proceed with Caution]    │
  └────────────────────────────────────────────────────────┘
  │
  ├── User clicks Cancel → medication NOT added, returns to list
  │
  └── User clicks "Proceed with Caution"
          │
          ▼
      Conflict warning is LOGGED in user's health profile
          │
          ▼
      Medication is saved with conflict_flag: true
          │
          ▼
      Warning visible in shareable doctor profile ✅
```

---

## 8. RAG AI Query Workflow

### 8.1 Data Ingestion (One-time setup)

```
POST /rag/ingest
  │
  ▼
Load Medicine_Details.csv from pythonBackend/
  │
  ▼
For each CSV row:
  Convert all fields to natural language text:
  "Medicine Name: Metformin\nUses: Type 2 Diabetes\n
   Side Effects: Nausea, Diarrhea\nContraindications: ..."
  │
  ▼
Batch texts in groups of 64
  │
  ▼
For each batch:
  POST to Ollama /api/embed  { model: "nomic-embed-text", input: [texts] }
  │
  ▼
Receive 768-dimensional float vectors for each text
  │
  ▼
Store as PointStructs in Qdrant collection "hackathon"
  { id: row_index, vector: [0.12, -0.45, ...], payload: { text, csv_row } }
  │
  ▼
Qdrant collection ready for cosine similarity search ✅
Total: ~medicine dataset rows indexed
```

### 8.2 Query Flow (every user question)

```
User asks: "What are the side effects of Metformin?"
  │
  ▼
GET /rag/query?q=What+are+the+side+effects+of+Metformin
  │
  ▼
[PYTHON FASTAPI — pythonBackend/rag.py]
  │
  ▼
Step 1: EMBED THE QUERY
  POST ollama /api/embed { model: "nomic-embed-text", input: [query] }
  → Returns: query_vector = [0.23, -0.11, 0.87, ...]
  │
  ▼
Step 2: VECTOR SEARCH
  Qdrant.search(
    collection: "hackathon",
    query_vector: query_vector,
    limit: 5,               ← top-5 most similar drug records
    metric: COSINE
  )
  → Returns: 5 medication records most semantically similar to query
  │
  ▼
Step 3: BUILD PROMPT
  "You are an assistant. Use the following medicine details to answer query.
  
   [Retrieved Record 1 — Metformin full details]
   ---
   [Retrieved Record 2 — Related compound]
   ---
   ...
   
   Question: What are the side effects of Metformin?
   Answer:"
  │
  ▼
Step 4: LLM GENERATION
  POST ollama /api/chat {
    model: "qwen2.5:7b",
    temperature: 0.0,         ← deterministic; same question = same answer
    messages: [system + prompt]
  }
  │
  ▼
Step 5: RETURN RESPONSE
  {
    "query": "What are the side effects of Metformin?",
    "answer": "Common side effects of Metformin include nausea,
               diarrhea, stomach upset, and loss of appetite...",
    "source_count": 5,
    "sources": [...]
  }
  │
  ▼
Frontend displays answer to user ✅
```

---

## 9. Adherence Scoring Workflow

### 9.1 Score Calculation

```
GET /api/adherence/score
  │
  ▼
Backend queries DoseLog for this user, last 30 days:
  {
    userId: req.user._id,
    scheduledAt: { $gte: 30_days_ago, $lte: now }
  }
  │
  ▼
Count:
  total_scheduled = count all logs (TAKEN + MISSED + DELAYED + PENDING)
  doses_taken     = count logs WHERE status IN ["TAKEN", "DELAYED"]
  │
  ▼
Calculate:
  adherence_score = (doses_taken / total_scheduled) × 100

  Example:
    total_scheduled = 60 (30 days × 2 doses/day)
    doses_taken     = 51
    adherence_score = (51/60) × 100 = 85%
  │
  ▼
Assign Risk Level:
  ┌──────────────────────────────────────┐
  │  score ≥ 80%  →  LOW    (🟢 Green)  │
  │  score 50–79% →  MEDIUM (🟡 Yellow) │
  │  score < 50%  →  HIGH   (🔴 Red)    │
  └──────────────────────────────────────┘
  │
  ▼
Return:
  { score: 85, risk: "LOW", totalScheduled: 60, taken: 51, missed: 9 }
  │
  ▼
Frontend displays:
  - Circular progress ring (85%)
  - Risk badge: LOW 🟢
  - Quick stats: 51 taken · 9 missed · avg delay X min
```

### 9.2 Pattern Detection Workflow

```
GET /api/adherence/patterns
  │
  ▼
Query all missed DoseLogs for this user (last 30 days)
  │
  ▼
Run 3 pattern detection rules:

RULE 1: Night Doses Missed
  Filter missed logs WHERE hour(scheduledAt) BETWEEN 20 AND 23
  nightMisses = count of above
  total misses = count of all MISSED logs
  IF (nightMisses / totalMisses) > 0.60:
    → Pattern detected: "You frequently miss your evening doses"
    → Recommendation: "Consider setting an alarm or asking a family
                       member to remind you each night"

RULE 2: Weekend Slippage
  weekdayAdherence = adherence on Mon-Fri
  weekendAdherence = adherence on Sat-Sun
  IF weekendAdherence < (weekdayAdherence - 20):
    → Pattern detected: "Your weekend adherence drops significantly"
    → Recommendation: "Set Saturday and Sunday reminders separately"

RULE 3: Streak Break
  For each medication, check consecutive missed doses:
  IF any medication has 3+ consecutive MISSED logs:
    → Pattern detected: "You've missed [MedName] 3+ times in a row"
    → Recommendation: "Please contact your doctor or caregiver"
  │
  ▼
Return detected patterns + recommendations to frontend
  │
  ▼
Frontend renders Pattern Cards with icon + description + action
```

---

## 10. Health Profile & Doctor Share Workflow

### 10.1 Patient Generates Shareable Profile

```
Patient navigates to /profile
  │
  ▼
Clicks "Share with Doctor"
  │
  ▼
System generates secure, time-limited share token (UUID + expiry)
  │
  ▼
Share link created:
  https://medtrack.app/doctor/profile?token=abc123&expires=24h
  │
  ▼
Patient sends link to doctor (via WhatsApp, email, etc.)
  │
  ▼
Alternatively: clicks "Download PDF"
  │
  ▼
POST /api/doctor/export-pdf
  │
  ▼
Backend (PDFKit) generates PDF containing:
  ┌──────────────────────────────────────────────────┐
  │  PATIENT HEALTH PROFILE                          │
  │  Name: Ramesh Patel   DOB: 15/03/1958            │
  │  Phone: +91 9876543210                           │
  │                                                  │
  │  CURRENT MEDICATIONS                             │
  │  • Metformin 500mg — twice daily (since Mar '25) │
  │  • Amlodipine 5mg  — once daily  (since Jan '25) │
  │                                                  │
  │  30-DAY ADHERENCE SCORE: 85% (LOW RISK)          │
  │                                                  │
  │  DETECTED PATTERNS                               │
  │  • Night doses missed (62% of all misses)        │
  │                                                  │
  │  DOSE LOG (last 30 days)                         │
  │  [table: date, medication, status, delay]        │
  └──────────────────────────────────────────────────┘
  │
  ▼
PDF downloaded to patient's device → shared with doctor ✅
```

### 10.2 Doctor Views Patient Profile

```
Doctor receives share link from patient
  │
  ▼
Opens: /doctor/profile?token=abc123
  │
  ▼
Backend validates token (not expired, valid signature)
  │
  ▼
GET /api/doctor/patient/:patientId
  │
  ▼
Doctor sees:
  ├── Patient's full medication history
  ├── Adherence score + risk level
  ├── Dose-by-dose log with timestamps
  ├── Detected behavioral patterns
  ├── Drug conflict warnings flagged
  └── Option to add clinical notes (future)
  │
  ▼
Doctor can advise schedule changes, detect compliance issues,
and make data-driven prescriptions ✅
```

---

## 11. Population Analytics Workflow

### 11.1 Dataset Generation (Python FastAPI)

```
GET /generate-dataset?start=2026-01-01&end=2026-04-04
  │
  ▼
[PYTHON FastAPI — pythonBackend/services.py]
  │
  ▼
Motor (async MongoDB driver) runs aggregation pipeline:

  Stage 1: $match  → filter by date range (scheduledAt)
  Stage 2: $lookup → join dose_logs ← users
  Stage 3: $unwind → flatten user array
  Stage 4: $match  → keep only PATIENT role users
  Stage 5: $lookup → join ← medications
  Stage 6: $unwind → flatten medication array
  Stage 7: $addFields → compute effective_date in user's timezone
  Stage 8: $group  → group by (user, medication, date)
             compute: total_scheduled, doses_taken, doses_missed,
                      delay_sum, delay_count
  Stage 9: $project → compute adherence_percentage, avg_delay_minutes
  Stage 10: $sort  → by user_id, medication_id, date
  │
  ▼
Convert to Pydantic DatasetRowSchema objects
  │
  ▼
Load into Pandas DataFrame
  │
  ▼
Compute per-user summaries:
  group by (user_id, user_name, email, timezone)
  → total doses, taken, missed, adherence %
  │
  ▼
Compute overall dataset summary:
  → total unique users, total doses, global adherence %
  │
  ▼
Export DataFrame to medtrack_dataset.csv
  │
  ▼
Return JSON:
  {
    rows: [...],            ← per (user, medication, date) records
    per_user_summary: [...],← per-user aggregates
    overall_summary: {      ← dataset-level stats
      total_users: N,
      total_scheduled_doses: M,
      doses_taken: X,
      adherence_percentage: Y%
    },
    csv_path: "./medtrack_dataset.csv"
  }
```

### 11.2 Research Export Workflow

```
GET /export-csv?start=2026-01-01&end=2026-04-04
  │
  ▼
Runs same aggregation pipeline as above
  │
  ▼
Returns medtrack_dataset.csv as downloadable file
  │
  ▼
Medical researcher / data scientist downloads CSV
  │
  ▼
CSV Schema (one row per user+medication+date):
  user_id, user_name, email, timezone,
  medication_id, medication_name, dosage, frequency,
  date, total_scheduled_doses, doses_taken, doses_missed,
  adherence_percentage, avg_delay_minutes
  │
  ▼
Researcher uses CSV for:
  ├── Age-group adherence analysis
  ├── Time-of-day miss pattern heatmaps
  ├── Medication-specific adherence rates
  ├── Caregiver impact studies
  └── Predictive ML model training
```

---

## 12. Data Flow Across All Services

### 12.1 Complete Request Lifecycle (Example: Mark Dose as Taken)

```
ANDROID APP                    EXPRESS BACKEND                  MONGODB
    │                               │                               │
    │─── POST /api/dose-logs ──────►│                               │
    │    { medicationId, status,    │                               │
    │      scheduledAt, takenAt }   │                               │
    │                               │── validate JWT token ────────►│
    │                               │   (auth.middleware.ts)        │
    │                               │                               │
    │                               │── validate body with Zod ─────│
    │                               │   (LogDoseSchema)             │
    │                               │                               │
    │                               │── compute delayMinutes ───────│
    │                               │   (takenAt - scheduledAt)     │
    │                               │                               │
    │                               │── DoseLog.create({...}) ─────►│
    │                               │                               │◄─ saved
    │                               │                               │
    │                               │── emit socket event ──────────│────► NEXT.js
    │                               │   "dose_updated"              │      (real-time)
    │                               │                               │
    │◄── 201 Created ───────────────│                               │
    │    { success: true,           │                               │
    │      doseLog: {...} }         │                               │
    │                               │                               │
[UI updates immediately]        [Cron picks up]                [Data persisted]
```

### 12.2 Real-Time Notification Data Flow

```
CRON JOB (every 5 min)
  │
  ├── Finds medications due in 15 min
  │
  ├── Creates Notification in MongoDB
  │         │
  │         ▼
  │    Socket.io broadcasts to user's connected client
  │         │
  │         ├──► NEXT.js frontend: bell icon count updates
  │         └──► Android: expo-notifications shows device alert
  │
  └── Sends Web Push via VAPID
            │
            ▼
      Browser shows push notification
      (even when app tab is not open)
```

### 12.3 Full RAG to Response Data Flow

```
USER (Web/Android)
  │ asks: "What is the dose of Aspirin for heart patients?"
  ▼
NEXT.js / Android
  │ GET http://localhost:8000/rag/query?q=...
  ▼
PYTHON FASTAPI (main.py)
  │
  ▼
rag.py → _ollama_embed([query])
  │ POST http://localhost:11434/api/embed
  ▼
OLLAMA (nomic-embed-text)
  │ returns: [768-dim float vector]
  ▼
rag.py → qdrant_client.search(query_vector, limit=5)
  │
  ▼
QDRANT (http://localhost:6333)
  │ returns: 5 most similar medication records
  ▼
rag.py → builds prompt with context + question
  │ POST http://localhost:11434/api/chat
  ▼
OLLAMA (qwen2.5:7b, temperature=0.0)
  │ returns: factual answer grounded in retrieved data
  ▼
FastAPI returns JSON response
  │
  ▼
Frontend displays answer to user ✅
```

---

## Summary: End-to-End Workflow in One View

```
NEW USER
  └──► Register (email or Google)
          └──► Add medications
                  └──► Drug conflict check (RAG)
                          └──► Conflict? → Warn user
                          └──► No conflict → Save medication
                                  └──► Cron creates daily PENDING dose stubs
                                          └──► Reminder notification (15 min before)
                                                  └──► User marks dose TAKEN/MISSED/DELAYED
                                                          │
                                          ┌───────────────┴────────────────┐
                                          │                                │
                                    TAKEN/DELAYED                       MISSED
                                          │                                │
                                   Adherence score               Caregiver alerted
                                   updated (up ↑)                (after 3 misses)
                                          │                                │
                                   Pattern analysis              Doctor can view
                                   runs in background            via shared profile
                                          │
                              Analytics pipeline exports
                              anonymized data for research
```

---

*This workflow document covers every major user journey, data flow, and system interaction in MedTrack.*
*Each workflow is implemented and functional in the current codebase — Gujarat Hackathon 2026.*
