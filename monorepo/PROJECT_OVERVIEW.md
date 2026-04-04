# MedTrack: Medication Adherence & Monitoring System

MedTrack is a comprehensive HealthTech MVP designed to solve the critical problem of medication non-adherence. It bridges the gap between patients, their treatment plans, and their care networks through real-time tracking and AI-driven analytics.

## 🚀 Core Features & Functionality

### 1. Advanced Patient Dashboard (Overview)
- **Visual Health Metrics**: Real-time adherence scoring based on historical dose compliance.
- **Risk Assessment**: Dynamic classification (Low/Medium/High Risk) based on patterns of missed or delayed doses.
- **Live Adherence Progress**: Circular progress indicators and interactive charts showing daily and weekly trends.

### 2. Smart Medication Management (`/medications`)
- **Flexible Scheduling**: Support for **Daily, Weekly, Monthly, and Custom** medication frequencies.
- **Multi-slot Timing**: Ability to set multiple dose times (e.g., Breakfast, Lunch, Dinner) per medication.
- **Clinical Record Keeping**: Store dosage, units, start dates, and specific patient/doctor notes.
- **Cabinet View**: A unified, premium UI for viewing and managing active vs. inactive treatments.

### 3. Dose Logging & History (`/history`)
- **Real-Time Logging**: One-click "Mark as Taken" functionality that synchronizes with the backend.
- **Historical Analysis**: Date-based navigation to review every dose ever scheduled.
- **Clinical Delay Tracking**: Automatically calculates how many minutes/hours a dose was delayed, aiding in clinical accuracy.
- **Status Classification**: Clear visual distinction between Taken, Delayed, Missed, and Pending doses.

### 4. Adherence AI Intelligence (`/adherence`)
- **Behavioral Pattern Detection**: AI-driven analysis identifying trends like "Weekend Slippage" or "Morning Inconsistency."
- **Trend Visualizations**: Weekly breakdown charts and adherence score progression.
- **Proactive Risk Triage**: Surface-level detection of when a patient is likely to experience a health complication due to missed pills.

### 5. Care Network & Supervision (`/caregiver`)
- **Dual Perspective**: Complete modules for both Patients (managed) and Caregivers (monitoring).
- **Secure Linking**: Patient-initiated caregiver linking via email for end-to-end security.
- **Remote Patient Oversight**: Caregivers can monitor multiple patients, viewing live risk levels and adherence scores from a single hub.
- **Critical Supervision Notifications**: Automated alerts for caregivers if a patient misses consecutive doses.

### 6. Live Notification Center
- **Alert Dispatch**: Real-time popover for dose reminders, risk changes, and network activity.
- **Badge System**: Visual indicators for unread alerts with "Mark All Read" management.

## 🎨 Design & UX
- **Premium Aesthetics**: Built with a sleek, medical-grade color palette and glassmorphism elements.
- **Typography**: Optimized for readability using the **Poppins** and **Plus Jakarta Sans** font families.
- **Responsive Layout**: Designed to work seamlessly across mobile, tablet, and desktop viewports.

## 🛠 Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS v4, Lucide React, Shadcn/UI (Radix Primitives).
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Authentication.
- **Communication**: Polling-based real-time state synchronization.
- **Security**: End-to-end data encryption and Google OAuth integration.
