# 🏥 Problem Statement — Medication Non-Adherence Monitoring System

> **Competition:** Gujarat Hackathon 2026 (CRAFTATHON GU 2026)  
> **Domain:** HealthTech · Digital Health · Patient Safety  
> **Team Project:** `hackgu-monorepo`

---

## 📌 Problem Title

**Real-Time Medication Non-Adherence Detection and Caregiver Alert System for Chronic Disease Management**

---

## 🔍 Background & Context

Medication adherence — the degree to which a patient correctly follows prescribed medication schedules — is one of the most critical yet consistently underperformed aspects of modern healthcare. Despite being the simplest intervention point, **non-adherence** to prescribed medication regimens remains a leading driver of preventable hospitalizations, disease escalation, and avoidable patient mortality worldwide.

### 📊 The Scale of the Problem

- The **World Health Organization (WHO)** estimates that only **50% of patients** with chronic illnesses adhere to their prescribed medication plans.
- In India, studies show medication adherence rates among chronic disease patients (hypertension, diabetes, tuberculosis) are as **low as 30–40%** in certain populations.
- **Non-adherence costs the global healthcare system over $500 billion annually** in avoidable complications, repeated hospitalizations, and emergency care.
- In India specifically, diseases like **Type 2 Diabetes, Hypertension, and Tuberculosis** — all requiring strict long-term medication schedules — continue to rise at an alarming rate, with non-adherence being a primary contributor to treatment failure.

### 🇮🇳 The Indian Healthcare Context

India faces a unique challenge:

| Factor | Impact |
|--------|--------|
| 77+ million diabetic patients | Second largest diabetic population in the world |
| 220+ million hypertensive patients | Majority poorly controlled due to missed medications |
| 2.8 million active TB cases annually | Non-adherence leads to drug-resistant TB (MDR-TB) |
| Overburdened healthcare infrastructure | Doctors cannot manually track individual patient adherence |
| Large elderly population | Cognitive decline makes self-management nearly impossible |
| Low digital literacy in rural areas | Existing solutions don't reach the most at-risk populations |

---

## ❌ Core Problem Statement

> **Patients managing chronic conditions lack an effective, real-time system to track and maintain their medication schedules. Caregivers and healthcare providers have no visibility into patient adherence, and no automated mechanism exists to detect, alert, and intervene when patients miss critical doses.**

### Root Causes

1. **No Centralized Tracking** — Patients rely on paper prescriptions, verbal reminders, or memory, with no digital record of what was taken and when.

2. **No Real-Time Visibility for Caregivers** — Family members and caregivers who actively support patients have no way to monitor adherence remotely without physically being present.

3. **Reactive, Not Proactive Care** — Healthcare systems only discover non-adherence when complications arise (hospitalization, disease escalation), by which point significant harm has already occurred.

4. **No Pattern Intelligence** — Even if dose events are recorded somewhere, no system proactively identifies *why* patients are missing doses (night-time fatigue, weekend routine disruption, multi-medication complexity).

5. **Generic Reminder Systems Are Insufficient** — Basic phone alarms or calendar reminders do not distinguish between medications, can't verify whether the dose was actually taken, and don't escalate when doses are consistently missed.

6. **Fragmented Data** — Patient medication history is scattered across pharmacy receipts, handwritten logs, and multiple app siloes, making it impossible for a doctor to assess adherence at a glance.

---

## 😟 Who Is Affected?

### 1. Patients (Primary Victims)
- **Elderly patients** managing multiple chronic conditions (polypharmacy) with complex schedules.
- **Working adults** with hypertension, diabetes, or mental health conditions who forget doses during busy workdays.
- **Post-surgery patients** on temporary but critical medication plans where adherence determines recovery outcomes.
- **Rural patients** with limited access to hospitals who need self-management tools.

### 2. Caregivers (Secondary Victims)
- **Family members** who are jointly responsible for a patient's health but are geographically separated.
- **Home nurses and care workers** managing multiple patients simultaneously with no centralized tool.
- **NGO health workers** in rural areas tracking TB or diabetes patients across large geographic areas.

### 3. Healthcare Providers (Systemic Victims)
- **Doctors** who prescribe medications but have zero insight into whether their patients actually take them.
- **Hospitals** that repeatedly admit the same chronic disease patients due to preventable medication failure.
- **Health insurance companies** paying for complications that could have been avoided with better adherence monitoring.

---

## 🎯 What the Ideal Solution Must Do

An effective solution to this problem must address **three core dimensions**:

### Dimension 1 — Real-Time Dose Tracking
- Allow patients to log dose intake with a single action (taken / missed / delayed).
- Track *when* doses should be taken vs. *when* they were actually taken.
- Compute delay metrics and flag doses that were taken too late to be therapeutically effective.

### Dimension 2 — Intelligent Adherence Scoring & Pattern Detection
- Calculate an **adherence score** based on the ratio of doses taken to doses scheduled over a rolling time window.
- Classify patients into **risk levels** (LOW / MEDIUM / HIGH) based on adherence scores.
- Detect **non-adherence patterns** automatically:
  - Consistently missing night-time doses (20:00–23:59)
  - Weekend adherence slippage (Saturday/Sunday drop-offs)
  - Consecutive streak breaks (3+ missed doses in a row for one medication)

### Dimension 3 — Proactive Caregiver & Alert System
- Send automated **reminders** to patients before a scheduled dose window.
- Escalate to **caregiver alerts** when doses are consistently missed.
- Provide caregivers with a **real-time adherence dashboard** showing each patient's status, risk level, and dose history.

---

## 💡 Proposed Solution

**MedTrack** — a full-stack, real-time medication adherence monitoring platform designed for patients, caregivers, and health workers in the Indian healthcare context.

### Solution Overview

```
Patient logs doses → System computes adherence → Alerts sent to caregiver
       ↓                        ↓                          ↓
  Mobile-first UI        Pattern Detection         Real-time Dashboard
  (dose timeline)        (AI-like rules)           (caregiver view)
```

### Key Features

| Feature | Description |
|---------|-------------|
| **Medication Scheduler** | Create and manage medication plans with flexible frequency (daily / custom days) and multiple daily doses |
| **Dose Logging** | One-tap logging of doses as Taken, Missed, or Delayed with timestamp capture |
| **Adherence Score Engine** | Rolling 30-day adherence score with daily/weekly breakdown charts |
| **Risk Classification** | Automated LOW / MEDIUM / HIGH risk assignment with thresholds |
| **Pattern Detection** | Rule-based detection of night-time misses, weekend slippage, streak breaks |
| **Automated Reminders** | Cron-driven notifications scheduled 15 minutes before each dose window |
| **Caregiver Linking** | Secure patient-to-caregiver relationship with role-based access |
| **Caregiver Dashboard** | Multi-patient overview with adherence scores, risk badges, and alert history |
| **Notification Inbox** | In-app notification center for reminders, missed dose alerts, caregiver escalations |

### Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 15 (App Router) | SSR, file-based routing, React Server Components |
| Backend | Express.js + TypeScript | Type-safe, modular, production-proven REST API |
| Database | MongoDB Atlas + Mongoose | Flexible schema for evolving health data models |
| Validation | Zod (shared schema monorepo) | Single source of truth for data contracts |
| Auth | JWT + bcryptjs + Google OAuth | Stateless auth with social login support |
| Scheduling | node-cron | Lightweight in-process job scheduling for reminders |
| Charts | Recharts | Composable, TypeScript-first adherence visualizations |
| Monorepo | pnpm Workspaces | Shared types/schemas between frontend and backend |

---

## 📐 System Boundaries & Scope

### ✅ In Scope (MVP — Gujarat Hackathon 2026)
- User registration, login (email + Google OAuth), and role assignment (patient / caregiver)
- Full medication CRUD with flexible scheduling
- Dose logging with taken/missed/delayed status
- Adherence score calculation and risk classification
- Non-adherence pattern detection (3 patterns)
- In-app reminder and alert notifications
- Caregiver linking and monitoring dashboard
- 30-day adherence trend charts and reports

### ❌ Out of Scope (Post-MVP / Future)
- Integration with wearables or smart pill dispensers
- Doctor portal or clinical prescriptions management
- Pharmacy stock/refill reminders
- Real SMS/push notifications (replaced by in-app for MVP)
- Machine learning-based adherence prediction
- EHR (Electronic Health Record) system integration
- Offline-first PWA with full sync

---

## 📏 Success Metrics

| Metric | Target |
|--------|--------|
| Dose logging response time | < 2 seconds end-to-end |
| Adherence score calculation accuracy | 100% match against manual calculation for test datasets |
| Reminder delivery latency | Within 5 minutes of scheduled time |
| Caregiver alert trigger on missed dose | < 10 minutes post-miss |
| Dashboard data freshness | Real-time (< 30 second lag for any status update) |
| Mobile usability | Fully functional on screens ≥ 320px width |

---

## 🆚 Differentiation from Existing Solutions

| Existing Solution | Limitation | Our Differentiation |
|------------------|------------|---------------------|
| **Basic pill reminder apps** (Medisafe, MyTherapy) | No caregiver integration, no adherence analytics | Full caregiver dashboard + adherence scoring |
| **Hospital EMR systems** | Doctor-facing only, no patient self-management | Patient-first UI with caregiver bridge |
| **Generic calendar/alarm reminders** | Cannot verify dose was taken, no data logging | Active dose confirmation + missed dose detection |
| **WhatsApp caregiver groups** | Unstructured, manual, no history or analytics | Structured real-time alerts with historical context |
| **Pharmacy apps** | Focus on ordering/inventory, not adherence | Focused on dose compliance and health outcomes |

---

## 🌍 Social Impact

Successful deployment of this system could:

1. **Reduce preventable hospitalizations** by enabling early intervention before non-adherence escalates to a health crisis.
2. **Support India's tuberculosis elimination goal** by enabling field health workers to monitor patient adherence remotely.
3. **Empower eldercare** by giving family members a reliable monitoring tool for elderly parents managing complex medication regimens.
4. **Reduce healthcare costs** for both patients (fewer complications) and the state (fewer hospitalizations).
5. **Enable data-driven prescriptions** — if adherence data can be shared with doctors, prescriptions can be adjusted based on real-world patient behavior, not just clinical assumptions.

---

## 🔗 References & Supporting Data

- WHO — *Adherence to Long-Term Therapies: Evidence for Action* (2003) — estimated 50% adherence rate for chronic illness
- ICMR — *India Diabetes Report 2023* — 77 million diabetic patients, poor medication adherence cited as compounding factor
- Lancet — *Non-communicable disease burden in India* — medication non-adherence linked to 21% of preventable deaths
- Ministry of Health & Family Welfare — *National TB Elimination Programme* — patient non-adherence is primary driver of drug resistance

---

*This problem statement defines the scope, motivation, and evaluation criteria for the MedTrack system built during Gujarat Hackathon 2026.*
