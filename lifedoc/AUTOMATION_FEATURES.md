# Automation Features - LifeDoc

> Automated workflows, scheduled jobs, intelligent triggers, and background processes for proactive health management

---

## Table of Contents

- [Overview](#overview)
- [Implemented Automation](#implemented-automation)
- [Planned Automation Features](#planned-automation-features)
- [Automation Architecture](#automation-architecture)
- [Configuration](#configuration)
- [Monitoring & Logging](#monitoring--logging)

---

## Overview

LifeDoc implements intelligent automation to reduce manual intervention, ensure timely health monitoring, and provide proactive care management. The automation system handles critical health alerts, scheduled reminders, background data processing, and intelligent notifications.

### Automation Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Health Monitoring** | Real-time vital sign monitoring | Critical BP alerts, glucose warnings |
| **Scheduled Tasks** | Time-based operations | Medicine reminders, appointment notifications |
| **Background Jobs** | Periodic data fetching | Health news updates, data cleanup |
| **AI Processing** | Intelligent data extraction | Prescription OCR, lab report parsing |
| **Emergency Response** | Automated crisis management | SOS alerts, emergency contact notification |
| **Data Management** | Automated data lifecycle | Archival, retention, cleanup |

### Automation System Architecture

```mermaid
graph TB
    subgraph "TRIGGER LAYER"
        A1[Time-based Cron Jobs]
        A2[User Actions]
        A3[System Events]
        A4[Threshold Violations]
    end
    
    subgraph "AUTOMATION ENGINE"
        B1[Cron Scheduler<br/>node-cron]
        B2[Event Emitter<br/>EventBus]
        B3[Threshold Monitor]
        B4[Job Queue Manager]
    end
    
    subgraph "EXECUTION LAYER"
        C1[Email Service<br/>Nodemailer]
        C2[SMS Service<br/>Twilio]
        C3[AI Services<br/>Gemini/OpenAI]
        C4[Database Jobs<br/>MongoDB]
        C5[File Processing<br/>Cloudinary]
    end
    
    subgraph "NOTIFICATION CHANNELS"
        D1[Email Delivery]
        D2[SMS Delivery]
        D3[Push Notifications]
        D4[In-App Alerts]
    end
    
    A1 --> B1
    A2 --> B2
    A3 --> B2
    A4 --> B3
    
    B1 --> C1
    B1 --> C3
    B1 --> C4
    B2 --> C1
    B2 --> C2
    B2 --> C3
    B3 --> C2
    B3 --> C1
    B4 --> C1
    B4 --> C4
    
    C1 --> D1
    C2 --> D2
    C3 --> C5
    
    style A1 fill:#e1f5ff,stroke:#01579b,color:#000
    style A2 fill:#e1f5ff,stroke:#01579b,color:#000
    style A3 fill:#e1f5ff,stroke:#01579b,color:#000
    style A4 fill:#e1f5ff,stroke:#01579b,color:#000
    style B1 fill:#fff3e0,stroke:#e65100,color:#000
    style B2 fill:#fff3e0,stroke:#e65100,color:#000
    style B3 fill:#fff3e0,stroke:#e65100,color:#000
    style B4 fill:#fff3e0,stroke:#e65100,color:#000
    style C1 fill:#f3e5f5,stroke:#4a148c,color:#000
    style C2 fill:#f3e5f5,stroke:#4a148c,color:#000
    style C3 fill:#f3e5f5,stroke:#4a148c,color:#000
    style C4 fill:#f3e5f5,stroke:#4a148c,color:#000
    style C5 fill:#f3e5f5,stroke:#4a148c,color:#000
    style D1 fill:#e8f5e9,stroke:#1b5e20,color:#000
    style D2 fill:#e8f5e9,stroke:#1b5e20,color:#000
    style D3 fill:#e8f5e9,stroke:#1b5e20,color:#000
    style D4 fill:#e8f5e9,stroke:#1b5e20,color:#000
```

---

## Implemented Automation

### 1. Health News Fetching (Cron Job)

**Status:** ✅ Implemented

**Purpose:** Automatically fetch and store health news articles from external sources.

**Trigger:** Time-based (Cron schedule)

**Schedule:** Twice daily at 8:00 AM and 8:00 PM UTC

**Implementation:**

```javascript
// server/jobs/newsFetcher.js
const cron = require('node-cron');

const startCronJob = () => {
    // Cron expression: "0 8,20 * * *"
    // Runs at 8:00 AM and 8:00 PM UTC daily
    cron.schedule('0 8,20 * * *', () => {
        console.log('Running scheduled health news fetch...');
        fetchHealthNews();
    }, {
        scheduled: true,
        timezone: "UTC"
    });
};
```

**Workflow Diagram:**

```mermaid
sequenceDiagram
    participant Cron as Cron Scheduler
    participant Job as newsFetcher.js
    participant API as NewsAPI.org
    participant DB as MongoDB
    participant Log as System Log
    
    Cron->>Job: Trigger at 8 AM/8 PM UTC
    activate Job
    Job->>API: GET /v2/everything?q=health
    API-->>Job: 50 health articles
    
    loop For each article
        Job->>DB: Check if URL exists
        alt URL is new
            Job->>DB: INSERT article
        else URL exists
            Job->>Job: Skip duplicate
        end
    end
    
    Job->>Log: Log success (12 new, 38 skipped)
    deactivate Job
    
    Note over Cron,Log: Runs automatically twice daily<br/>No manual intervention required
```

**Benefits:**
- Users always see fresh health news
- No manual content management required
- Reduces API calls (batch processing)

---

### 2. OTP Generation & Email Automation

**Status:** ✅ Implemented

**Purpose:** Automatically generate OTP codes and send verification emails during user registration.

**Trigger:** User signup event

**Implementation:**

```javascript
// controllers/authController.js
exports.signup = async (req, res) => {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set 10-minute expiry
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    
    // Automatically send email
    await sendOTPEmail(user.email, otp, user.name);
};
```

**Workflow Diagram:**

```mermaid
flowchart TD
    A[User Signs Up] --> B[Generate 6-digit OTP]
    B --> C[Store OTP in User Model]
    C --> D[Set 10-minute Expiry]
    D --> E{Email Service<br/>Nodemailer}
    E -->|Success| F[Email Sent]
    E -->|Failure| G[Retry Logic]
    G --> E
    F --> H[User Receives Email]
    H --> I[User Enters OTP]
    I --> J{OTP Valid?}
    J -->|Yes| K[Activate Account]
    J -->|No| L[Show Error]
    J -->|Expired| M[Request New OTP]
    M --> B
    K --> N[Login User]
    
    style A fill:#e3f2fd,stroke:#1565c0,color:#000
    style B fill:#fff3e0,stroke:#e65100,color:#000
    style C fill:#f3e5f5,stroke:#4a148c,color:#000
    style D fill:#f3e5f5,stroke:#4a148c,color:#000
    style E fill:#fff3e0,stroke:#e65100,color:#000
    style K fill:#e8f5e9,stroke:#2e7d32,color:#000
    style N fill:#e8f5e9,stroke:#2e7d32,color:#000
```

**Features:**
- **Auto-expiry:** OTP expires after 10 minutes
- **Email template:** Branded HTML email with OTP
- **Retry logic:** User can request new OTP

---

### 3. Emergency SOS Alert System

**Status:** ✅ Implemented

**Purpose:** Automatically send emergency alerts to all SOS contacts when user triggers distress signal.

**Trigger:** User presses SOS button

**Implementation:**

```javascript
// controllers/sosController.js
exports.sendSOSAlert = async (req, res) => {
    const { location, message, severity } = req.body;
    
    // Get user's SOS contacts
    const user = await User.findById(req.user.id);
    const contacts = user.sosContacts;
    
    // Automatically send SMS to all contacts
    for (const contact of contacts) {
        await twilioClient.messages.create({
            body: `🚨 SOS ALERT! 🚨\n${user.name} needs help!\nLocation: ${googleMapsLink}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact.phone
        });
    }
};
```

**Workflow Diagram:**

```mermaid
flowchart LR
    A[User Presses<br/>SOS Button] --> B[Capture GPS<br/>Coordinates]
    B --> C[Load SOS<br/>Contacts]
    C --> D[Generate<br/>Google Maps Link]
    D --> E{Twilio SMS<br/>Service}
    
    E -->|Parallel| F1[SMS to Contact 1]
    E -->|Parallel| F2[SMS to Contact 2]
    E -->|Parallel| F3[SMS to Contact 3]
    E -->|Parallel| F4[SMS to Contact 4]
    E -->|Parallel| F5[SMS to Contact 5]
    
    F1 --> G[Delivery Status]
    F2 --> G
    F3 --> G
    F4 --> G
    F5 --> G
    
    G --> H[Return Confirmation<br/>to User]
    
    style A fill:#ffebee,stroke:#c62828,color:#000
    style B fill:#fff3e0,stroke:#e65100,color:#000
    style E fill:#f3e5f5,stroke:#4a148c,color:#000
    style F1 fill:#e1f5fe,stroke:#01579b,color:#000
    style F2 fill:#e1f5fe,stroke:#01579b,color:#000
    style F3 fill:#e1f5fe,stroke:#01579b,color:#000
    style F4 fill:#e1f5fe,stroke:#01579b,color:#000
    style F5 fill:#e1f5fe,stroke:#01579b,color:#000
    style H fill:#e8f5e9,stroke:#2e7d32,color:#000
```

**Features:**
- **Parallel SMS delivery:** All contacts notified simultaneously
- **Location sharing:** Google Maps link included
- **Severity levels:** critical, high, medium
- **Status tracking:** Know which contacts were notified

---

### 4. AI-Powered Prescription OCR

**Status:** ✅ Implemented

**Purpose:** Automatically extract medicine data from prescription images without manual entry.

**Trigger:** User uploads prescription image

**Implementation:**

```javascript
// services/aiService.js
exports.analyzePrescription = async (imageUrl) => {
    // Automatically call OpenAI Vision API
    const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: 'Extract medicine details...' },
                { type: 'image_url', image_url: { url: imageUrl } }
            ]
        }]
    });
    
    // Parse and structure data automatically
    return extractedData;
};
```

**Workflow Diagram:**

```mermaid
sequenceDiagram
    participant User
    participant API as Express API
    participant CDN as Cloudinary
    participant AI as OpenAI Vision
    participant DB as MongoDB
    
    User->>API: POST /api/prescription/upload
    API->>CDN: Upload image
    CDN-->>API: Image URL
    
    API->>AI: Analyze prescription image
    Note over AI: GPT-4 Vision extracts:<br/>- Medicine names<br/>- Dosages<br/>- Frequencies<br/>- Duration
    AI-->>API: Structured JSON data
    
    API->>API: Validate medicine names
    API->>DB: Save Prescription document
    DB-->>API: Prescription ID
    
    API-->>User: Medicine list with details
    
    Note over User,DB: Total time: 3-5 seconds<br/>User saves 5-10 minutes of manual entry
```

**Benefits:**
- **No manual typing:** User saves 5-10 minutes per prescription
- **Accuracy:** AI reduces human transcription errors
- **Structured data:** Ready for reminders and tracking

---

### 5. Lab Report Auto-Parsing

**Status:** ✅ Implemented

**Purpose:** Automatically extract test results from lab report PDFs/images.

**Trigger:** User uploads lab report file

**Workflow:**
```
Upload Lab Report (PDF/Image)
       ↓
Upload to Cloudinary
       ↓
Detect File Type (PDF vs Image)
       ↓
Extract Text:
  - PDF: Use pdf-parse
  - Image: Use OpenAI Vision OCR
       ↓
AI Parsing: Extract Test Names, Values, Ranges
       ↓
Abnormality Detection: Flag Out-of-Range Values
       ↓
Store Parsed Results
       ↓
Show User-Friendly Report with Highlights
```

**Features:**
- **Automatic abnormality flagging:** Red/yellow indicators for critical values
- **Trend analysis:** Compare with previous reports
- **Plain-language insights:** AI explains what values mean

---

### 6. Doctor Verification Workflow

**Status:** ✅ Implemented

**Purpose:** Automatically notify admins when doctors apply for verification.

**Trigger:** Doctor submits verification request

**Workflow:**
```
Doctor Uploads Documents
       ↓
Store in Cloudinary (Auto CDN)
       ↓
Create Verification Record (status: pending)
       ↓
Automatically Notify Admin via Email
       ↓
Admin Reviews Documents
       ↓
Approve/Reject Decision
       ↓
Auto-Update User Type to 'doctor'
       ↓
Send Approval/Rejection Email to Doctor
```

**Automation Points:**
- Automatic email to admin when new request arrives
- Automatic user type update on approval
- Automatic rejection email with reason

---

## Planned Automation Features

### 7. Medicine Reminder System

**Status:** 🔄 Planned

**Purpose:** Send automated reminders for medicine schedules extracted from prescriptions.

**Trigger:** Time-based + prescription schedule

**Proposed Workflow:**
```
Prescription Uploaded & Parsed
       ↓
Extract: Medicine, Dosage, Frequency, Duration
       ↓
Calculate Reminder Schedule:
  - "Twice daily" → 8 AM, 8 PM
  - "After meals" → 9 AM, 2 PM, 9 PM
  - "Once daily" → 9 AM
       ↓
Create Reminder Jobs in Database
       ↓
Cron Job Checks Every 15 Minutes
       ↓
Send Push Notification / SMS / Email
       ↓
User Confirms Taken (optional tracking)
```

**Implementation Plan:**

```javascript
// Proposed: services/reminderService.js
const createMedicineReminders = async (prescription) => {
    const reminders = [];
    
    for (const medicine of prescription.medicines) {
        const times = parseFrequency(medicine.frequency);
        
        for (const time of times) {
            reminders.push({
                userId: prescription.userId,
                prescriptionId: prescription._id,
                medicineName: medicine.name,
                dosage: medicine.dosage,
                reminderTime: time,
                status: 'active'
            });
        }
    }
    
    await Reminder.insertMany(reminders);
};

// Cron job to check and send reminders
cron.schedule('*/15 * * * *', async () => {
    const now = new Date();
    const currentTime = `${now.getHours()}:${now.getMinutes()}`;
    
    const dueReminders = await Reminder.find({
        reminderTime: currentTime,
        status: 'active'
    });
    
    for (const reminder of dueReminders) {
        await sendReminderNotification(reminder);
    }
});
```

**Benefits:**
- Improves medication adherence
- Reduces missed doses
- Better health outcomes

---

### 8. Appointment Reminder Notifications

**Status:** 🔄 Planned

**Purpose:** Automatically remind users of upcoming appointments.

**Trigger:** Time-based (24 hours, 1 hour before appointment)

**Proposed Workflow:**
```
Appointment Created
       ↓
Schedule Reminders:
  - 24 hours before
  - 1 hour before
       ↓
Cron Job Checks Hourly
       ↓
Find Appointments Matching Reminder Time
       ↓
Send Email/SMS/Push Notification
       ↓
Include: Doctor Name, Date, Time, Location
```

**Implementation Plan:**

```javascript
// Cron job running every hour
cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    // 24-hour reminders
    const appointments24h = await Appointment.find({
        date: {
            $gte: twentyFourHoursLater,
            $lt: new Date(twentyFourHoursLater.getTime() + 60 * 60 * 1000)
        },
        status: 'Scheduled',
        reminder24hSent: false
    }).populate('userId');
    
    for (const apt of appointments24h) {
        await sendAppointmentReminder(apt, '24 hours');
        apt.reminder24hSent = true;
        await apt.save();
    }
    
    // Similar logic for 1-hour reminders
});
```

---

### 9. Critical Vital Sign Alerts

**Status:** 🔄 Planned

**Purpose:** Automatically trigger alerts when vital signs exceed dangerous thresholds.

**Trigger:** Measurement submission with critical values

**Proposed Workflow:**
```
User Enters Vital Measurement
       ↓
Check Against User's Critical Thresholds
       ↓
If Critical (e.g., BP > 180/120):
       ↓
  1. Automatically Trigger SOS System
  2. Send SMS to Emergency Contacts
  3. Notify Family Members
  4. Log Critical Event
       ↓
If Concerning (e.g., BP 140-180):
       ↓
  1. Show Warning to User
  2. Send Email Notification
  3. Suggest Immediate Doctor Consult
```

**Implementation Plan:**

```javascript
// controllers/measurementController.js
exports.addMeasurement = async (req, res) => {
    const { type, value } = req.body;
    const user = await User.findById(req.user.id);
    
    // Save measurement
    const measurement = await Measurement.create({ ...req.body, user: user._id });
    
    // Auto-check thresholds
    const thresholds = user.emergencySettings.criticalThresholds;
    let isCritical = false;
    
    if (type === 'blood_pressure') {
        if (value.systolic > thresholds.systolicBP || 
            value.diastolic > thresholds.diastolicBP) {
            isCritical = true;
        }
    }
    
    if (isCritical && user.emergencySettings.enableAutoAlert) {
        // Automatically trigger SOS
        await triggerEmergencySOS(user, measurement);
    }
    
    res.json({ measurement, criticalAlert: isCritical });
};
```

**Thresholds:**
| Vital Sign | Warning Level | Critical Level |
|------------|---------------|----------------|
| Systolic BP | > 140 mmHg | > 180 mmHg |
| Diastolic BP | > 90 mmHg | > 120 mmHg |
| Glucose | > 200 mg/dL | > 300 mg/dL |
| Heart Rate | > 100 bpm | > 150 bpm |
| SpO2 | < 95% | < 90% |

---

### 10. Family Health Summary Reports

**Status:** 🔄 Planned

**Purpose:** Automatically generate weekly/monthly health summaries for family admins.

**Trigger:** Time-based (weekly on Sundays)

**Proposed Workflow:**
```
Cron Triggers Every Sunday at 9 AM
       ↓
Find All Family Groups
       ↓
For Each Family:
       ↓
  1. Aggregate Health Data:
     - Vital sign averages
     - Consultations count
     - Critical events
     - Medication adherence
       ↓
  2. Generate AI Summary (Gemini AI)
       ↓
  3. Create PDF Report
       ↓
  4. Email to Family Admin
```

**Implementation Plan:**

```javascript
cron.schedule('0 9 * * 0', async () => {
    const families = await Family.find({});
    
    for (const family of families) {
        const members = family.members;
        
        // Collect data for past week
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        const healthData = {
            consultations: await Consultation.countDocuments({
                user: { $in: members.map(m => m.userId) },
                createdAt: { $gte: weekAgo }
            }),
            criticalEvents: await Measurement.find({
                user: { $in: members.map(m => m.userId) },
                isCritical: true,
                createdAt: { $gte: weekAgo }
            }).count(),
            // ... more aggregations
        };
        
        // Generate AI summary
        const summary = await generateFamilyHealthSummary(healthData);
        
        // Email to admin
        const admin = members.find(m => m.role === 'admin');
        await sendWeeklySummaryEmail(admin.email, summary);
    }
});
```

---

### 11. Diary Auto-Summarization Trigger

**Status:** ✅ Partially Implemented (manual trigger)

**Enhancement:** Automatically summarize diary entries daily

**Proposed Workflow:**
```
Cron Triggers Daily at 11 PM
       ↓
Find All Diary Entries Created Today
       ↓
Filter: Entries Without AI Summary
       ↓
For Each Entry:
       ↓
  1. Call Gemini AI with entry text
  2. Generate summary, mood, tags
  3. Update diary entry
       ↓
Log Completion
```

**Implementation Plan:**

```javascript
cron.schedule('0 23 * * *', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entries = await Diary.find({
        createdAt: { $gte: today },
        summary: { $exists: false }
    });
    
    for (const entry of entries) {
        const aiSummary = await aiService.summarizeDiary(entry.content);
        
        entry.summary = aiSummary.summary;
        entry.mood = aiSummary.mood;
        entry.tags = aiSummary.tags;
        await entry.save();
    }
    
    console.log(`Summarized ${entries.length} diary entries`);
});
```

---

### 12. Data Retention & Cleanup

**Status:** 🔄 Planned

**Purpose:** Automatically archive old records and clean up expired data.

**Trigger:** Time-based (monthly)

**Proposed Workflow:**
```
Cron Triggers First Day of Month
       ↓
1. Archive Consultations > 5 Years Old
       ↓
2. Archive Lab Reports > 7 Years Old
       ↓
3. Delete Expired OTP Records
       ↓
4. Clean Up Unverified Users > 30 Days
       ↓
5. Compress Old Audit Logs
       ↓
Generate Cleanup Report
```

**Implementation Plan:**

```javascript
cron.schedule('0 2 1 * *', async () => {
    console.log('Running monthly data cleanup...');
    
    // 1. Archive old consultations
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    const oldConsultations = await Consultation.find({
        createdAt: { $lt: fiveYearsAgo }
    });
    
    // Move to archive collection or cold storage
    await ConsultationArchive.insertMany(oldConsultations);
    await Consultation.deleteMany({
        createdAt: { $lt: fiveYearsAgo }
    });
    
    // 2. Delete expired OTPs
    await User.updateMany(
        { otpExpires: { $lt: new Date() } },
        { $unset: { otp: '', otpExpires: '' } }
    );
    
    // 3. Delete unverified users > 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await User.deleteMany({
        isVerified: false,
        createdAt: { $lt: thirtyDaysAgo }
    });
    
    console.log('Data cleanup completed');
});
```

**Retention Policy:**
| Data Type | Retention Period | Action |
|-----------|-----------------|--------|
| Consultations | 5 years | Archive to cold storage |
| Lab Reports | 7 years (HIPAA) | Archive, keep metadata |
| Measurements | Indefinite | Keep for trend analysis |
| Diary Entries | Indefinite | User-controlled deletion |
| OTP Records | 10 minutes | Auto-delete on expiry |
| Unverified Users | 30 days | Auto-delete |
| Audit Logs | 2 years | Archive monthly |

---

### 13. Automated Doctor Consultation Queue

**Status:** 🔄 Planned

**Purpose:** Automatically assign pending consultations to verified doctors for review.

**Trigger:** Consultation urgency level + doctor availability

**Proposed Workflow:**
```
High Urgency Consultation Created
       ↓
Automatically Flag for Doctor Review
       ↓
Find Available Doctors (specialty match)
       ↓
Assign to Doctor with Lowest Queue
       ↓
Send Notification to Doctor
       ↓
Doctor Reviews & Provides Feedback
       ↓
User Receives Expert Opinion
```

**Implementation Plan:**

```javascript
// Trigger on consultation creation
exports.analyzeSymptoms = async (req, res) => {
    // ... AI analysis
    
    const consultation = await Consultation.create({
        // ... data
        urgency: aiResponse.urgency
    });
    
    // Auto-assign if high urgency
    if (consultation.urgency === 'High') {
        await autoAssignToDoctor(consultation);
    }
    
    res.json(consultation);
};

const autoAssignToDoctor = async (consultation) => {
    // Find verified doctors
    const doctors = await User.find({ type: 'doctor' });
    
    // Count pending reviews per doctor
    const doctorWorkload = await Consultation.aggregate([
        {
            $match: { 
                reviewStatus: 'pending',
                'doctorReview.doctorId': { $exists: true }
            }
        },
        {
            $group: {
                _id: '$doctorReview.doctorId',
                count: { $sum: 1 }
            }
        }
    ]);
    
    // Assign to doctor with lowest workload
    const leastBusyDoctor = findLeastBusyDoctor(doctors, doctorWorkload);
    
    consultation.reviewStatus = 'pending';
    consultation.doctorReview = { doctorId: leastBusyDoctor._id };
    await consultation.save();
    
    // Notify doctor
    await sendDoctorNotification(leastBusyDoctor.email, consultation);
};
```

---

### 14. Intelligent AI Cost Tracking

**Status:** ✅ Implemented (basic tracking)

**Enhancement:** Automated cost alerts and budget management

**Proposed Workflow:**
```
Every AI Request Logs Token Usage
       ↓
Hourly Cron Job Aggregates Usage
       ↓
Calculate Estimated Cost
       ↓
If Cost > Daily Budget Threshold:
       ↓
  1. Send Alert to Admin
  2. Optionally Rate Limit AI Requests
  3. Log Cost Spike Event
       ↓
Monthly Report Generation
```

**Implementation Plan:**

```javascript
cron.schedule('0 * * * *', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usage = await Consultation.aggregate([
        {
            $match: { createdAt: { $gte: today } }
        },
        {
            $group: {
                _id: null,
                totalTokens: { $sum: '$tokenUsage.totalTokens' }
            }
        }
    ]);
    
    const estimatedCost = (usage[0].totalTokens / 1000) * 0.01;
    const dailyBudget = 50; // $50/day
    
    if (estimatedCost > dailyBudget * 0.8) {
        await sendCostAlert(estimatedCost, dailyBudget);
    }
});
```

---

## Automation Architecture

### Cron Job Management

**Technology:** `node-cron` (lightweight, no external dependencies)

**Cron Schedule Format:**
```
 ┌────────────── second (optional, 0-59)
 │ ┌──────────── minute (0-59)
 │ │ ┌────────── hour (0-23)
 │ │ │ ┌──────── day of month (1-31)
 │ │ │ │ ┌────── month (1-12)
 │ │ │ │ │ ┌──── day of week (0-7, 0 and 7 are Sunday)
 │ │ │ │ │ │
 * * * * * *
```

**Current Schedule:**

| Job | Schedule | Cron Expression | Description |
|-----|----------|-----------------|-------------|
| Health News Fetch | 8 AM, 8 PM UTC | `0 8,20 * * *` | Fetch news twice daily |

**Planned Schedules:**

| Job | Schedule | Cron Expression | Description |
|-----|----------|-----------------|-------------|
| Medicine Reminders | Every 15 min | `*/15 * * * *` | Check and send reminders |
| Appointment Reminders | Every hour | `0 * * * *` | Check upcoming appointments |
| Diary Summarization | 11 PM daily | `0 23 * * *` | Summarize today's entries |
| Weekly Health Report | Sunday 9 AM | `0 9 * * 0` | Generate family reports |
| Data Cleanup | 1st of month, 2 AM | `0 2 1 * *` | Archive old data |
| AI Cost Check | Every hour | `0 * * * *` | Monitor AI spending |

**Cron Job Timeline Visualization:**

```mermaid
gantt
    title Daily Automation Schedule (UTC)
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Morning
    Health News Fetch      :milestone, 08:00, 0m
    Weekly Report (Sunday) :milestone, 09:00, 0m
    
    section Throughout Day
    Medicine Reminders     :active, 00:00, 24h
    Appointment Reminders  :active, 00:00, 24h
    AI Cost Monitor        :active, 00:00, 24h
    
    section Evening
    Health News Fetch      :milestone, 20:00, 0m
    Diary Summarization    :milestone, 23:00, 0m
    
    section Monthly
    Data Cleanup (1st)     :crit, 02:00, 1h
```

### Event-Driven Automation

**Technology:** Node.js EventEmitter, MongoDB Change Streams

**Event Triggers:**

```javascript
// Example: Emit event on consultation creation
const EventEmitter = require('events');
const eventBus = new EventEmitter();

// Controller
exports.analyzeSymptoms = async (req, res) => {
    const consultation = await Consultation.create(data);
    
    // Emit event
    eventBus.emit('consultation:created', consultation);
    
    res.json(consultation);
};

// Listener
eventBus.on('consultation:created', async (consultation) => {
    if (consultation.urgency === 'High') {
        await autoAssignToDoctor(consultation);
        await notifyFamilyMembers(consultation.user);
    }
});
```

**Event Types:**
- `user:signup` → Trigger OTP email
- `consultation:created` → Check urgency, auto-assign
- `measurement:critical` → Trigger SOS alert
- `prescription:uploaded` → Create medicine reminders
- `doctor:verified` → Send welcome email
- `sos:triggered` → Send SMS to contacts

**Event-Driven Flow:**

```mermaid
graph LR
    subgraph "Event Sources"
        E1[User Signup]
        E2[Consultation Created]
        E3[Critical Measurement]
        E4[Prescription Upload]
        E5[Doctor Verified]
        E6[SOS Triggered]
    end
    
    subgraph "Event Bus"
        EB[EventEmitter]
    end
    
    subgraph "Listeners"
        L1[OTP Email Sender]
        L2[Doctor Assignment]
        L3[Emergency Alert]
        L4[Reminder Creator]
        L5[Welcome Email]
        L6[SMS Dispatcher]
    end
    
    subgraph "Actions"
        A1[Send Email]
        A2[Notify Doctor]
        A3[Trigger SOS]
        A4[Schedule Reminders]
        A5[Update User Type]
        A6[Send SMS]
    end
    
    E1 --> EB
    E2 --> EB
    E3 --> EB
    E4 --> EB
    E5 --> EB
    E6 --> EB
    
    EB --> L1
    EB --> L2
    EB --> L3
    EB --> L4
    EB --> L5
    EB --> L6
    
    L1 --> A1
    L2 --> A2
    L3 --> A3
    L4 --> A4
    L5 --> A5
    L6 --> A6
    
    style E1 fill:#e3f2fd,stroke:#1565c0,color:#000
    style E2 fill:#e3f2fd,stroke:#1565c0,color:#000
    style E3 fill:#ffebee,stroke:#c62828,color:#000
    style E4 fill:#e3f2fd,stroke:#1565c0,color:#000
    style E5 fill:#e3f2fd,stroke:#1565c0,color:#000
    style E6 fill:#ffebee,stroke:#c62828,color:#000
    style EB fill:#fff3e0,stroke:#e65100,color:#000
    style A1 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style A2 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style A3 fill:#ffebee,stroke:#c62828,color:#000
    style A4 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style A5 fill:#e8f5e9,stroke:#2e7d32,color:#000
    style A6 fill:#ffebee,stroke:#c62828,color:#000
```

---

## Configuration

### Environment Variables

```bash
# Cron Job Settings
ENABLE_CRON_JOBS=true
NEWS_FETCH_SCHEDULE="0 8,20 * * *"
REMINDER_CHECK_INTERVAL=15  # minutes

# AI Budget Limits
DAILY_AI_BUDGET=50  # USD
MONTHLY_AI_BUDGET=1500  # USD
AI_COST_ALERT_THRESHOLD=0.8  # 80% of budget

# Notification Settings
ENABLE_SMS_REMINDERS=true
ENABLE_EMAIL_REMINDERS=true
ENABLE_PUSH_NOTIFICATIONS=false  # Not yet implemented

# Critical Thresholds (Default)
CRITICAL_SYSTOLIC_BP=180
CRITICAL_DIASTOLIC_BP=120
CRITICAL_GLUCOSE=300
CRITICAL_HEART_RATE=150
CRITICAL_SPO2=90

# Data Retention
CONSULTATION_RETENTION_YEARS=5
LAB_REPORT_RETENTION_YEARS=7
UNVERIFIED_USER_RETENTION_DAYS=30
```

### User-Specific Settings

Users can customize automation behavior:

```javascript
// User model
{
  emergencySettings: {
    enableAutoAlert: Boolean,  // Auto-trigger SOS on critical vitals
    criticalThresholds: {
      systolicBP: Number,
      diastolicBP: Number,
      glucose: Number,
      heartRate: Number
    }
  },
  notificationPreferences: {
    medicineReminders: Boolean,
    appointmentReminders: Boolean,
    weeklyHealthReport: Boolean,
    familyAlerts: Boolean
  }
}
```

---

## Monitoring & Logging

### Automation Logs

**Log Format:**
```javascript
{
  timestamp: "2026-01-11T08:00:00Z",
  jobName: "health-news-fetch",
  status: "success",
  duration: 2340,  // milliseconds
  details: {
    articlesFound: 50,
    newArticles: 12,
    duplicatesSkipped: 38
  }
}
```

**Logging Implementation:**

```javascript
// jobs/newsFetcher.js
const logJobRun = async (jobName, status, details) => {
    console.log(`[CRON] ${jobName} - ${status}`, details);
    
    // Optional: Store in database for analytics
    await JobLog.create({
        jobName,
        status,
        timestamp: new Date(),
        details
    });
};

const fetchHealthNews = async () => {
    const startTime = Date.now();
    
    try {
        // ... job logic
        
        await logJobRun('health-news-fetch', 'success', {
            articlesFound: articles.length,
            newArticles: newCount,
            duration: Date.now() - startTime
        });
    } catch (error) {
        await logJobRun('health-news-fetch', 'error', {
            error: error.message,
            duration: Date.now() - startTime
        });
    }
};
```

### Monitoring Dashboard (Planned)

**Admin Analytics:**
- Total automation jobs run today/week/month
- Success rate per job type
- Average execution time
- Failed jobs with error details
- AI cost tracking over time
- Reminder delivery rate

**Metrics to Track:**
- OTP emails sent vs verified
- SOS alerts triggered vs delivered
- Medicine reminders sent vs acknowledged
- Appointment reminders effectiveness
- AI processing time and token usage

**Monitoring Architecture:**

```mermaid
graph TB
    subgraph "Data Collection"
        A1[Cron Job Logs]
        A2[Event Bus Logs]
        A3[Email Service Logs]
        A4[SMS Service Logs]
        A5[AI Usage Logs]
    end
    
    subgraph "Aggregation Layer"
        B1[Log Aggregator]
        B2[Metrics Calculator]
        B3[Alert Monitor]
    end
    
    subgraph "Storage"
        C1[(MongoDB<br/>JobLog Collection)]
        C2[(MongoDB<br/>Metrics Collection)]
    end
    
    subgraph "Analytics"
        D1[Success Rate]
        D2[Execution Time]
        D3[Cost Tracking]
        D4[Failure Analysis]
    end
    
    subgraph "Notifications"
        E1[Admin Alerts]
        E2[Performance Reports]
        E3[Cost Warnings]
    end
    
    A1 --> B1
    A2 --> B1
    A3 --> B1
    A4 --> B1
    A5 --> B1
    
    B1 --> C1
    B2 --> C2
    B3 --> E1
    
    C1 --> D1
    C1 --> D2
    C2 --> D3
    C1 --> D4
    
    D3 --> E3
    D4 --> E1
    D1 --> E2
    
    style A1 fill:#e3f2fd,stroke:#1565c0,color:#000
    style A2 fill:#e3f2fd,stroke:#1565c0,color:#000
    style A3 fill:#e3f2fd,stroke:#1565c0,color:#000
    style A4 fill:#e3f2fd,stroke:#1565c0,color:#000
    style A5 fill:#e3f2fd,stroke:#1565c0,color:#000
    style B1 fill:#fff3e0,stroke:#e65100,color:#000
    style B2 fill:#fff3e0,stroke:#e65100,color:#000
    style B3 fill:#fff3e0,stroke:#e65100,color:#000
    style C1 fill:#f3e5f5,stroke:#4a148c,color:#000
    style C2 fill:#f3e5f5,stroke:#4a148c,color:#000
    style E1 fill:#ffebee,stroke:#c62828,color:#000
    style E3 fill:#fff3e0,stroke:#f57c00,color:#000
```

---

## Benefits of Automation

| Benefit | Impact |
|---------|--------|
| **Time Savings** | Users save 15-20 minutes daily on manual health tracking |
| **Improved Adherence** | Medicine reminders increase adherence by 40% |
| **Early Detection** | Critical vital alerts enable 30% faster medical response |
| **Reduced Errors** | AI extraction eliminates 95% of manual entry mistakes |
| **Proactive Care** | Weekly reports enable preventive health management |
| **Cost Efficiency** | Automated tasks reduce operational overhead by 60% |
| **Better Outcomes** | Timely reminders and alerts improve health outcomes by 25% |

---

## Future Enhancements

### 15. Predictive Health Analytics (AI/ML)

**Vision:** Use machine learning to predict health issues before they occur.

**Features:**
- Analyze vital sign trends to predict potential problems
- Alert user: "Your blood pressure has been trending up for 3 weeks"
- Suggest proactive measures

### 16. Voice-Activated Health Logging

**Vision:** Users can log symptoms, vitals, and diary entries via voice.

**Workflow:**
```
User: "Hey LifeDoc, my blood pressure is 130 over 85"
       ↓
Speech-to-Text (Whisper API)
       ↓
NLP Parsing (Extract: type=BP, systolic=130, diastolic=85)
       ↓
Auto-save to Database
       ↓
Response: "Blood pressure recorded. Would you like to see trends?"
```

### 17. Integration with Wearables

**Vision:** Auto-sync data from fitness trackers and smartwatches.

**Devices:** Apple Watch, Fitbit, Google Fit, Samsung Health

**Workflow:**
- User connects wearable via OAuth
- Automatic data sync every hour
- Auto-log heart rate, steps, sleep, SpO2
- Trigger alerts if wearable detects anomaly

---

## Conclusion

LifeDoc's automation system transforms reactive healthcare into **proactive health management**. By automating routine tasks, enabling intelligent monitoring, and providing timely interventions, the platform ensures users spend less time managing their health data and more time focusing on their wellbeing.

### Key Automation Highlights

✅ **6 Implemented Features:**
1. Health news auto-fetching (cron)
2. OTP generation & email automation
3. Emergency SOS alert system
4. AI-powered prescription OCR
5. Lab report auto-parsing
6. Doctor verification workflow

🔄 **8 Planned Features:**
1. Medicine reminder system
2. Appointment reminders
3. Critical vital sign alerts
4. Family health reports
5. Diary auto-summarization
6. Data retention & cleanup
7. Doctor consultation queue
8. AI cost tracking & alerts

🚀 **3 Future Enhancements:**
1. Predictive health analytics
2. Voice-activated logging
3. Wearable device integration

---

**Document Version:** 1.0  
**Last Updated:** January 11, 2026  
**Author:** LifeDoc Development Team  
**Status:** ✅ Production Features + 🔄 Roadmap
