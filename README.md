# MedTrack: Clinical Adherence & Patient Hub

**MedTrack** is a high-fidelity, proactive medication management and clinical adherence platform designed to bridge the gap between patients, caregivers, and medical professionals. This repository contains the complete implementation of a production-ready HealthTech system, built with **Next.js 15**, **FastAPI (Python)**, and **Node.js**.

---

## 🚀 Live Implemented Features

### 1. **Clinical Authentication Hub**
*   **Multi-Role Access**: Secure registration and login for **Patients**, **Doctors (Physicians)**, and **Caregivers**.
*   **SSO Integration**: Google OAuth 2.0 implementation for streamlined clinical node registration.
*   **Encrypted Identity**: Client-side AES-256 encryption for session and profile data.

### 2. **Patient Dashboard (The Health Node)**
*   **Adherence Core Scoring**: Real-time percentage tracking of adherence using historical intake data.
*   **Adaptive Condition Engine**: Dynamic Triage/Risk assessment (**Low**, **Medium**, **High**) based on medication logs.
*   **Session Stats**: Daily summaries of successful logs, delayed intakes, and critical misses.
*   **Live Care Network**: Integrated view of authorized clinical nodes (Physicians) currently linked to the patient.

### 3. **Dynamic Regimen Control (Today's Meds)**
*   **Phase-Based Scheduling**: Intakes automatically grouped by **Morning**, **Afternoon**, and **Evening** phases.
*   **Audit-Ready Logging**: One-click dose logging with millisecond-precision synchronization.
*   **Automatic Delay Detection**: Intelligent calculation of medication delay windows (`+X min late`).
*   **Gamified Adherence**: Persistent streak tracking and visual celebration (`Confetti`) for clinical targets.

### 4. **Verified Care Network (Caregiver Support)**
*   **Secure Invitations**: Email-based caregiver/patient linking requests.
*   **Request Management**: Dedicated interface for accepting or declining care connection nodes.
*   **Shared Monitoring**: Real-time visibility into the patient's adherence score and risk level for authorized family members.

### 5. **Physician Command Hub (Doctor View)**
*   **Population Diagnostics**: Searchable portfolio of all linked patients with at-a-glance health metrics.
*   **Prioritization Engine**: Flagging system to prioritize "High Risk" or critical follow-ups.
*   **Data Vault Access**: "View-As" functionality to deep-dive into a patient's historical adherence logs.
*   **Automated Analytics**: Generate and download **Clinical Analysis PDFs** for specific patients.

### 6. **Global Archive (Clinical History)**
*   **Comprehensive Log Explorer**: Full vertical history of all therapeutic events.
*   **Granular Filtering**: Filter records by status (**Successful**, **Delayed**, **Missed**).
*   **Date Navigation**: Chronological navigation across sessions to analyze long-term patterns.

### 7. **Smart Adherence AI (Python RAG Engine)**
*   **Knowledge Integration**: Python-driven **RAG (Retrieval-Augmented Generation)** chatbot for health insights.
*   **Clinical Dataset**: Integrated knowledge base (`medtrack_dataset.csv`) for context-aware medical suggestions.
*   **Real-time Assistance**: Interactive AI chat focused on behavior pattern improvement.

---

## 🎨 Premium Visual Architecture
MedTrack implements a state-of-the-art **"Floating Board"** design system:
*   **Floating Sidebar**: Fixed `3.5rem` rounded sidebar with a high-fidelity shadow (`50px blur`).
*   **Spacious Canvas**: Large `28rem` content margin for maximum structural breathing room.
*   **Clinical Teal Palette**: Modern HealthTech branding using `#008080` and clinical mint tints.
*   **Hydration Maturity**: Fully guarded Next.js 15 client-side rendering to ensure therapeutic data accuracy.

---

## 🛠️ Technical Implementation
*   **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide React Icons.
*   **Backend (Clinical API)**: Node.js/TypeScript with MongoDB persistence.
*   **Backend (AI Node)**: FastAPI (Python), LangChain, RAG implementation.
*   **Synchronization**: Real-time Socket.io listeners for low-latency adherence updates.
*   **Storage**: Segmented clinical records with multi-layer authorization.

---
*MedTrack: Advancing Clinical Precision through Digital Synchronization.*
