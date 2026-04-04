# Security & Access Control - LifeDoc

> Role-based access control matrix with HIPAA-compliant justifications for healthcare data operations

---

## Overview

LifeDoc implements a **Role-Based Access Control (RBAC)** model with **family-based data isolation** to ensure Protected Health Information (PHI) privacy. The system enforces strict authorization rules aligned with HIPAA technical safeguards and patient consent requirements.

---

## User Roles

| Role | Full Name | Access Scope | Description |
|------|-----------|--------------|-------------|
| `USER` | Patient | Own data + authorized family | Primary user with full control over personal health records |
| `DOCTOR` | Healthcare Provider | Consented patients only | Verified medical professionals with clinical access |
| `ADMIN` | System Administrator | All data (audit only) | Platform administrators with oversight authority |
| `FAMILY_ADMIN` | Family Administrator | Family group data | Parent/guardian managing family health records |
| `FAMILY_MEMBER` | Family Member | Consented family data | Adult family member with shared access |
| `DEPENDENT` | Dependent | No independent access | Minor/dependent tracked by family admin |

---

## Access Control Matrix

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Full Access (Create, Read, Update, Delete) |
| 📖 | Read Only |
| ✏️ | Create & Edit (No Delete) |
| ❌ | No Access |
| ⚠️ | Conditional Access (Based on consent/relationship) |
| 🔒 | Immutable After Creation |

---

## Healthcare Records Access

### 🩺 Health Diary Management

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|--------|------|--------|-------|--------------|---------------|-----------|
| Create diary entry (own) | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Create diary entry (family) | ⚠️ | ❌ | ❌ | ✅ | ⚠️ | ❌ |
| View own diary entries | ✅ | ⚠️ | 📖 | ✅ | ✅ | ❌ |
| View family diary entries | ⚠️ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |
| Edit own diary entry | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Edit family diary entry | ⚠️ | ❌ | ❌ | ✅ | ⚠️ | ❌ |
| Delete diary entry | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Generate AI summary | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ |
| Export diary data | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

**Justifications:**
- Diary entries are personal health notes; only patient or guardian can create
- FAMILY_ADMIN can manage dependent diaries (parent for child)
- FAMILY_MEMBER needs explicit consent to view other members' diaries
- DOCTOR access requires active consultation or patient share
- Delete restricted to owner/guardian to prevent unauthorized data loss
- AI summary uses patient's own data (HIPAA-compliant processing)

**Conditional Access Rules:**
```typescript
// DOCTOR can view diary if:
- Active consultation exists with patient
- Patient shared diary explicitly (share link)
- Doctor is treating family member with guardian consent

// FAMILY_MEMBER can view diary if:
- Family relationship confirmed
- Member granted explicit permission
- Emergency settings allow (SOS override)
```

---

### 📊 Vital Measurements

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|--------|------|--------|-------|--------------|---------------|-----------|
| Record measurement (own) | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Record measurement (family) | ⚠️ | ❌ | ❌ | ✅ | ⚠️ | ❌ |
| View own measurements | ✅ | ⚠️ | 📖 | ✅ | ✅ | ❌ |
| View family measurements | ⚠️ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |
| Edit measurement (24h window) | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Edit measurement (after 24h) | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 | 🔒 |
| Delete measurement | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View measurement history | ✅ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |
| Export measurement data | ✅ | ⚠️ | ❌ | ✅ | ❌ | ❌ |
| Receive critical alerts | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ |

**Justifications:**
- Measurements are objective clinical data; immutable after 24h to preserve medical accuracy
- No deletion allowed to maintain complete health record integrity
- Critical alerts (BP >180/120, glucose >400) sent to patient + authorized family
- DOCTOR access for clinical decision-making during consultation
- 24-hour edit window allows correction of input errors

**Immutability Rules:**
```typescript
// Measurements become immutable after:
- 24 hours from creation
- Any doctor has viewed them
- Used in AI analysis/report
- Referenced in consultation
- Exported to external system

// Rationale: Medical record integrity
```

---

### 🧪 Lab Reports

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|--------|------|--------|-------|--------------|---------------|-----------|
| Upload lab report (own) | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Upload lab report (family) | ⚠️ | ❌ | ❌ | ✅ | ⚠️ | ❌ |
| View own lab reports | ✅ | ⚠️ | 📖 | ✅ | ✅ | ❌ |
| View family lab reports | ⚠️ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |
| Edit report metadata | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Edit report file | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete lab report | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Request AI OCR analysis | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ |
| View OCR extracted data | ✅ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |
| Download report file | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ❌ |
| Share report (generate link) | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

**Justifications:**
- Lab reports are official medical documents; original file immutable
- Metadata (test date, lab name, notes) can be updated for accuracy
- AI OCR helps digitize paper reports (Gemini Vision + OpenAI)
- Patients control sharing via time-limited secure links
- DOCTOR access requires patient authorization or active consultation
- Delete allowed pre-finalization (accidental upload correction)

**AI Processing Security:**
```typescript
// OCR processing flow:
1. User uploads lab report (PDF/image)
2. File stored in Cloudinary (encrypted)
3. AI extracts structured data (values, ranges, abnormalities)
4. Extracted data saved to database
5. User reviews and confirms accuracy
6. Once confirmed, data becomes immutable

// Privacy: AI processing via BAA-compliant services (OpenAI, Google)
```

---

### 💊 Prescriptions & Medicines

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|--------|------|--------|-------|--------------|---------------|-----------|
| Create prescription | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View own prescriptions | ✅ | ⚠️ | 📖 | ✅ | ✅ | ❌ |
| View family prescriptions | ⚠️ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |
| Edit prescription | ❌ | 🔒 | ❌ | ❌ | ❌ | ❌ |
| Mark prescription complete | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Add medicine to list | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Edit medicine (own) | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Delete medicine | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Set medicine reminders | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| View medication history | ✅ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |

**Justifications:**
- Prescriptions are legal medical orders; only doctors can create
- Prescriptions are immutable once issued (medical-legal document)
- Patients can mark prescriptions complete (treatment finished)
- Medicine list is patient-managed (OTC drugs, supplements)
- Reminders help medication adherence (patient safety)
- DOCTOR can view current meds during consultation (drug interaction check)

**Digital Signature:**
```typescript
// Prescription integrity:
- Doctor digitally signs prescription (JWT-based signature)
- Signature includes: doctorId, patientId, medicines, timestamp
- Any tampering invalidates signature
- Verification available for pharmacies

// Format:
{
  prescriptionId: "uuid",
  doctorSignature: "RS256_signed_hash",
  issueDate: "ISO_timestamp",
  medicines: [...],
  verified: true
}
```

---

### 🩻 Doctor Reports

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|--------|------|--------|-------|--------------|---------------|-----------|
| Create doctor report | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View own doctor reports | ✅ | ⚠️ | 📖 | ✅ | ✅ | ❌ |
| View family doctor reports | ⚠️ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |
| Edit report (DRAFT) | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit report (PUBLISHED) | ❌ | 🔒 | ❌ | ❌ | ❌ | ❌ |
| Publish report | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Add comments | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Download report PDF | ✅ | ✅ | ❌ | ✅ | ⚠️ | ❌ |
| Share report link | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

**Report Status Flow:**
```
DRAFT → PUBLISHED
  ↑         │
  └─────────┘
(Doctor only, immutable after 7 days)
```

**Justifications:**
- Doctor reports are clinical assessments; doctor-authored only
- DRAFT status allows corrections before patient sees
- PUBLISHED reports are immutable (permanent medical record)
- Patients can comment/ask questions on reports
- 7-day grace period for doctor corrections (typos, clarifications)
- After 7 days, report becomes permanent (audit compliance)

---

### 📅 Appointments

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|--------|------|--------|-------|--------------|---------------|-----------|
| Create appointment (self) | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Create appointment (family) | ⚠️ | ❌ | ❌ | ✅ | ⚠️ | ❌ |
| View own appointments | ✅ | ⚠️ | 📖 | ✅ | ✅ | ❌ |
| View family appointments | ⚠️ | ⚠️ | 📖 | ✅ | ⚠️ | ❌ |
| View doctor schedule | 📖 | ✅ | 📖 | 📖 | 📖 | ❌ |
| Accept appointment | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reject appointment | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reschedule appointment | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Cancel appointment | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Mark appointment complete | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Appointment State Transitions:**

| From State | To State | USER | DOCTOR | FAMILY_ADMIN |
|------------|----------|------|--------|--------------|
| PENDING | CONFIRMED | ❌ | ✅ | ❌ |
| PENDING | REJECTED | ❌ | ✅ | ❌ |
| PENDING | CANCELLED | ✅ | ❌ | ✅ |
| CONFIRMED | RESCHEDULED | ✅ | ✅ | ✅ |
| CONFIRMED | CANCELLED | ✅ | ✅ | ✅ |
| CONFIRMED | COMPLETED | ❌ | ✅ | ❌ |
| RESCHEDULED | CONFIRMED | ❌ | ✅ | ❌ |
| COMPLETED | REVIEWED | ✅ | ❌ | ✅ |

**Justifications:**
- Patients initiate appointments; doctors confirm availability
- Doctors control their schedule (accept/reject/complete)
- Both parties can reschedule/cancel (mutual respect)
- FAMILY_ADMIN can book for dependents (parent for child)
- Completed appointments trigger consultation record creation
- Appointment history preserved for continuity of care

---

### 💬 AI Consultations

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|--------|------|--------|-------|--------------|---------------|-----------|
| Start consultation | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Continue consultation | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| View own consultations | ✅ | ❌ | 📖 | ✅ | ✅ | ❌ |
| View family consultations | ⚠️ | ❌ | 📖 | ✅ | ⚠️ | ❌ |
| Delete consultation | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Export consultation | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Share consultation | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View AI model used | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |

**Justifications:**
- AI consultations are educational only (not medical advice)
- Users control their consultation history (privacy)
- Conversations stored for continuity (context awareness)
- DOCTOR role has no access (AI is patient-facing tool)
- ADMIN can audit AI usage (quality/safety monitoring)
- Deletion allowed (not clinical record; patient preference)

**AI Safety Disclaimers:**
```typescript
// Every AI response includes:
- "This is not medical advice. Consult a licensed doctor."
- Source attribution (model: Gemini/GPT-4)
- Timestamp and conversation ID
- Emergency instruction: "For emergencies, call 911 or visit ER"

// Prohibited AI actions:
- Cannot prescribe medication
- Cannot diagnose conditions
- Cannot recommend skipping doctor visits
- Cannot interpret critical lab values
```

---

## Family & Relationship Management

### 👨‍👩‍👧‍👦 Family Group Management

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|--------|------|--------|-------|--------------|---------------|-----------|
| Create family group | ✅ | ❌ | ❌ | N/A | ❌ | ❌ |
| Invite family member | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Accept invitation | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Reject invitation | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Leave family group | ✅ | ❌ | ❌ | ⚠️ | ✅ | ❌ |
| Remove family member | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View family members | ✅ | ❌ | 📖 | ✅ | ✅ | ❌ |
| Change member role | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Transfer admin role | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Add dependent | ❌ | ❌ | ❌ | ✅ | ⚠️ | ❌ |
| Remove dependent | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

**Family Role Hierarchy:**
```
FAMILY_ADMIN (Creator)
    │
    ├── FAMILY_MEMBER (Adult, consent-based)
    │
    └── DEPENDENT (Minor, no independent access)
```

**Justifications:**
- FAMILY_ADMIN (typically parent/guardian) has oversight responsibility
- FAMILY_MEMBER is voluntary; can leave anytime (adult autonomy)
- DEPENDENT represents minors; admin manages until age of consent
- Role changes tracked in audit log (accountability)
- Invitation-based to prevent unauthorized access
- Transfer admin allows succession planning (divorce, death scenarios)

**Age of Consent Automation:**
```typescript
// When DEPENDENT turns 18:
1. System sends notification to dependent and admin
2. Dependent gets option to:
   - Create independent account
   - Upgrade to FAMILY_MEMBER (continue sharing)
   - Leave family group
3. FAMILY_ADMIN loses automatic access unless consent given
4. All prior data remains with dependent

// HIPAA compliance: Adult children control their records
```

---

### 🔐 Data Sharing Permissions

| Data Type | FAMILY_ADMIN | FAMILY_MEMBER | DEPENDENT |
|-----------|--------------|---------------|-----------|
| **Basic Profile** | ✅ (All family) | ✅ (Self) + ⚠️ (Others) | 📖 (Admin only) |
| **Health Diary** | ✅ (All family) | ✅ (Self) + ⚠️ (Others) | 📖 (Admin only) |
| **Measurements** | ✅ (All family) | ✅ (Self) + ⚠️ (Others) | 📖 (Admin only) |
| **Lab Reports** | ✅ (All family) | ✅ (Self) + ⚠️ (Others) | 📖 (Admin only) |
| **Prescriptions** | ✅ (All family) | ✅ (Self) + ⚠️ (Others) | 📖 (Admin only) |
| **Doctor Reports** | ✅ (All family) | ✅ (Self) + ⚠️ (Others) | 📖 (Admin only) |
| **Appointments** | ✅ (All family) | ✅ (Self) + ⚠️ (Others) | 📖 (Admin only) |
| **Consultations** | ✅ (All family) | ✅ (Self) + ⚠️ (Others) | ❌ (Private) |

**Granular Consent:**
```typescript
// FAMILY_MEMBER can grant/revoke:
{
  sharedWith: [
    {
      memberId: "family_admin_id",
      dataTypes: ["measurements", "appointments"],
      canEdit: false,
      expiresAt: "2026-12-31" // Optional
    },
    {
      memberId: "family_member_2_id",
      dataTypes: ["diary"],
      canEdit: true,
      expiresAt: null // Permanent
    }
  ]
}

// Use case: Adult shares diet diary with spouse (collaborative health)
```

---

## Emergency & SOS Access

### 🚨 Emergency Override

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER | SOS_CONTACT |
|--------|------|--------|-------|--------------|---------------|-------------|
| Configure SOS contacts | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Trigger SOS alert | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| View SOS history | ✅ | ❌ | 📖 | ✅ | 📖 | ❌ |
| Access emergency data | ❌ | ⚠️ | ❌ | ⚠️ | ❌ | ⚠️ |
| Send critical alerts | ❌ | ⚠️ | ❌ | ⚠️ | ❌ | ✅ |

**Emergency Data Package:**
```typescript
// When SOS triggered, contacts receive:
{
  patientName: "John Doe",
  age: 35,
  bloodType: "O+",
  allergies: ["Penicillin", "Peanuts"],
  currentMedications: ["Aspirin 81mg daily"],
  criticalConditions: ["Type 2 Diabetes", "Hypertension"],
  recentVitals: {
    bp: "140/90",
    glucose: "180 mg/dL",
    timestamp: "2026-01-11T10:00:00Z"
  },
  location: { lat: 40.7128, lng: -74.0060 },
  sosContactPhone: "+1234567890"
}

// Sent via: SMS + Email + WhatsApp (if integrated)
```

**Justifications:**
- SOS provides life-saving information to emergency responders
- Patient pre-authorizes data sharing (consent given during setup)
- Only critical medical data shared (HIPAA minimum necessary)
- Access logged for audit trail (who accessed, when, why)
- Revoked automatically after 24 hours (emergency resolved)

**SOS Access Restrictions:**
```typescript
// SOS_CONTACT can access:
- Emergency medical information ONLY
- For 24 hours after SOS trigger
- No historical data beyond current episode
- No edit/delete capabilities
- All access logged and notified to patient

// Prevents misuse while enabling emergency response
```

---

## Doctor Verification & Clinical Access

### 👨‍⚕️ Doctor Verification Process

| Action | USER | DOCTOR | ADMIN | Verification Status |
|--------|------|--------|-------|---------------------|
| Submit verification | ❌ | ✅ | ❌ | PENDING |
| View verification status | ❌ | ✅ | ✅ | All |
| Approve verification | ❌ | ❌ | ✅ | PENDING → APPROVED |
| Reject verification | ❌ | ❌ | ✅ | PENDING → REJECTED |
| Request re-verification | ❌ | ✅ | ❌ | REJECTED → PENDING |
| View verification docs | ❌ | ✅ | ✅ | Own |
| Suspend doctor account | ❌ | ❌ | ✅ | APPROVED → SUSPENDED |

**Verification Requirements:**
```typescript
// Doctor must provide:
- Medical license number
- License issuing authority
- License expiry date
- Upload license document (PDF/image)
- Professional degree certificate
- Hospital/clinic affiliation (optional)
- Specialization details

// Admin verifies:
1. Document authenticity
2. License validity (check with medical council API)
3. No malpractice history (manual check)
4. Professional credentials

// Verification states:
PENDING → APPROVED → ACTIVE
    ↓         ↓
 REJECTED  SUSPENDED
    ↓         ↓
 PENDING → REVOKED
```

**Clinical Access Controls:**
```typescript
// DOCTOR with APPROVED status can:
if (doctor.verificationStatus === 'APPROVED') {
  - Create prescriptions
  - Write doctor reports
  - Accept appointments
  - View patient data (with consent)
  - Access AI medical assistant
}

// DOCTOR with PENDING/REJECTED cannot:
- No clinical functions
- Profile visible but inactive
- Can update verification documents
- Notified of status changes
```

**Justifications:**
- Medical licenses ensure only qualified professionals provide care
- Verification prevents impersonation and malpractice
- HIPAA requires provider authentication
- Annual re-verification ensures current licensing
- Suspension for reported misconduct (patient safety)

---

## Meeting & Video Consultation

### 📹 Meeting Requests

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER |
|--------|------|--------|-------|--------------|---------------|
| Create meeting request | ✅ | ✅ | ❌ | ✅ | ✅ |
| View own requests | ✅ | ✅ | 📖 | ✅ | ✅ |
| Accept meeting | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ |
| Reject meeting | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ |
| Reschedule meeting | ✅ | ✅ | ❌ | ✅ | ✅ |
| Cancel meeting | ✅ | ✅ | ❌ | ✅ | ✅ |
| Generate meeting link | ✅ | ✅ | ❌ | ✅ | ✅ |
| Join meeting | ⚠️ | ⚠️ | ❌ | ⚠️ | ⚠️ |
| End meeting | ✅ | ✅ | ❌ | ✅ | ✅ |
| View meeting history | ✅ | ✅ | 📖 | ✅ | ✅ |

**Meeting Request Flow:**
```
USER/DOCTOR → CREATE_REQUEST → PENDING
                                  │
                    ┌─────────────┼─────────────┐
                    │                           │
              ACCEPTED (both)             REJECTED (either)
                    │                           │
              SCHEDULED                    CANCELLED
                    │
              COMPLETED
```

**Justifications:**
- Mutual consent required (both parties must accept)
- Either party can initiate (doctor or patient)
- Video consultation is real-time telemedicine
- Meeting links are time-limited (security)
- History preserved for continuity of care
- FAMILY_ADMIN can request on behalf of dependents

**Video Conference Security:**
```typescript
// Meeting link generation:
{
  meetingId: "uuid-v4",
  meetingLink: "https://lifedoc.com/meet/encrypted-token",
  expiresAt: meetingStartTime + 2 hours,
  participants: [patientId, doctorId],
  encryption: "end-to-end", // WebRTC DTLS-SRTP
  recordingAllowed: false // Default (HIPAA: consent required)
}

// Access control:
- Only authenticated participants can join
- Link invalid after expiration
- No guest access (PHI discussion)
- Optional recording with explicit consent
```

---

## Content & Knowledge Management

### 📰 Health News & Articles

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN | FAMILY_MEMBER |
|--------|------|--------|-------|--------------|---------------|
| View news feed | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search articles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Save article | ✅ | ✅ | ❌ | ✅ | ✅ |
| Unsave article | ✅ | ✅ | ❌ | ✅ | ✅ |
| View saved articles | ✅ | ✅ | ❌ | ✅ | ✅ |
| Share article | ✅ | ✅ | ❌ | ✅ | ✅ |
| Create article | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Edit article | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| Delete article | ❌ | ❌ | ✅ | ❌ | ❌ |
| Publish article | ❌ | ❌ | ✅ | ❌ | ❌ |

**Content Moderation:**
```typescript
// Article creation workflow:
DOCTOR → DRAFT → ADMIN_REVIEW → PUBLISHED
                       ↓
                   REJECTED

// Admin review criteria:
- Medical accuracy (fact-checked)
- Source credibility
- No promotional content
- HIPAA-compliant (no patient cases)
- Accessible language (health literacy)
- References cited

// Automated news fetching:
- NewsAPI integration (cron job)
- Category filtering (health, medical, wellness)
- Deduplication logic
- Auto-publish from trusted sources
```

**Justifications:**
- Public health information available to all users
- DOCTOR can contribute (expert content)
- ADMIN moderates for quality and safety
- Saved articles are personal bookmarks (no PHI)
- Prevents misinformation (medical accuracy critical)

---

## Administrative Functions

### 🛡️ Admin Oversight

| Action | USER | DOCTOR | ADMIN | Justification |
|--------|------|--------|-------|---------------|
| View all users | ❌ | ❌ | ✅ | User management |
| View user details | ❌ | ❌ | ✅ | Support/compliance |
| Suspend user account | ❌ | ❌ | ✅ | Terms violation |
| Delete user account | ❌ | ❌ | ✅ | Right to erasure |
| View all health records | ❌ | ❌ | 📖 | Audit only (logged) |
| Edit health records | ❌ | ❌ | ❌ | Never allowed |
| View audit logs | ❌ | ❌ | ✅ | Compliance |
| Export audit logs | ❌ | ❌ | ✅ | Regulatory reporting |
| Manage doctor verifications | ❌ | ❌ | ✅ | License validation |
| Configure AI settings | ❌ | ❌ | ✅ | Model management |
| View system analytics | ❌ | ❌ | ✅ | Platform health |
| Manage news articles | ❌ | ❌ | ✅ | Content moderation |
| Handle reported content | ❌ | ❌ | ✅ | Safety & abuse |

**Admin Access Restrictions:**
```typescript
// ADMIN can view PHI for:
- Technical support (patient-initiated ticket)
- Security investigation (breach response)
- Compliance audit (HIPAA requirement)
- Legal obligation (subpoena)

// Every ADMIN access to PHI triggers:
- Audit log entry with reason
- Timestamp and IP address
- User notification (transparency)
- Manager review (for sensitive access)

// ADMIN CANNOT:
- Edit patient health records
- Create prescriptions
- Impersonate users
- Delete audit logs
- Access without documented reason
```

**Justifications:**
- ADMIN is platform operator, not healthcare provider
- Read-only access prevents tampering
- All access logged for accountability (HIPAA requirement)
- Users notified of admin access (transparency)
- "Break glass" access for emergencies (logged and justified)

---

### 🗄️ Data Management

| Action | USER | DOCTOR | ADMIN | FAMILY_ADMIN |
|--------|------|--------|-------|--------------|
| Export own data (JSON) | ✅ | ✅ | ❌ | ✅ |
| Export own data (PDF) | ✅ | ✅ | ❌ | ✅ |
| Export family data | ⚠️ | ❌ | ❌ | ✅ |
| Request data deletion | ✅ | ✅ | ❌ | ✅ |
| Confirm data deletion | ✅ | ✅ | ✅ | ✅ |
| View data retention | ✅ | ✅ | ✅ | ✅ |
| Anonymize historical data | ❌ | ❌ | ✅ | ❌ |

**Data Export Format:**
```json
{
  "exportDate": "2026-01-11T10:00:00Z",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "healthRecords": {
    "diary": [ /* all diary entries */ ],
    "measurements": [ /* all vital measurements */ ],
    "labReports": [ /* all lab reports */ ],
    "prescriptions": [ /* all prescriptions */ ],
    "doctorReports": [ /* all doctor reports */ ],
    "appointments": [ /* all appointments */ ],
    "consultations": [ /* all AI consultations */ ]
  },
  "familyData": { /* if family admin */ },
  "metadata": {
    "recordCount": 1234,
    "dateRange": "2025-01-01 to 2026-01-11"
  }
}
```

**Data Deletion Policy:**
```typescript
// Deletion types:
1. SOFT_DELETE (default)
   - Records marked as deleted
   - Not visible to user
   - Retained for 30 days (recovery window)
   - Admin can restore within 30 days

2. HARD_DELETE (after 30 days or explicit request)
   - Personal identifiers removed
   - Health data anonymized
   - Audit logs preserved (regulatory requirement)
   - Irreversible

// GDPR Right to Erasure:
- User requests deletion
- System confirms (prevent accidental loss)
- 30-day grace period
- Deletion completed
- Confirmation email sent
- Audit log: "User X deleted on YYYY-MM-DD"

// Exceptions (cannot delete):
- Active prescriptions (medical-legal)
- Pending appointments
- Ongoing doctor reports
- Legal hold (litigation)
```

---

## Audit & Compliance

### 📋 Audit Log Requirements

| Event Type | Logged For | Retention | Immutable |
|------------|------------|-----------|-----------|
| User authentication | All roles | 6 years | ✅ |
| PHI access | All roles | 6 years | ✅ |
| PHI modification | All roles | 6 years | ✅ |
| PHI deletion | All roles | 6 years | ✅ |
| Permission changes | ADMIN | 6 years | ✅ |
| Doctor verification | ADMIN, DOCTOR | 6 years | ✅ |
| SOS alerts | USER, FAMILY | 6 years | ✅ |
| Failed login attempts | All roles | 1 year | ✅ |
| Admin PHI access | ADMIN | 6 years | ✅ |
| Data export | USER, FAMILY_ADMIN | 6 years | ✅ |

**Audit Log Schema:**
```typescript
{
  id: "uuid",
  timestamp: "2026-01-11T10:00:00.000Z",
  userId: "user-uuid",
  userRole: "USER",
  action: "PHI_ACCESS", // CREATE, READ, UPDATE, DELETE, EXPORT
  entityType: "LAB_REPORT",
  entityId: "report-uuid",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  metadata: {
    reason: "Patient support ticket #1234",
    requestId: "req-uuid",
    dataAccessed: ["testResults", "abnormalities"]
  },
  result: "SUCCESS", // or FAILURE
  errorMessage: null // if failure
}
```

**Justifications:**
- HIPAA requires 6-year audit log retention
- Immutable logs prevent tampering
- Comprehensive logging for breach investigation
- User activity transparency (trust building)
- Regulatory compliance (GDPR, HIPAA)

---

### 🔍 Access Monitoring

| Alert Type | Threshold | Notified | Action |
|------------|-----------|----------|--------|
| Multiple failed logins | 3 in 5 min | USER, ADMIN | Account lock |
| Unusual access pattern | ML model | ADMIN | Investigation |
| PHI bulk access | >50 records/hour | ADMIN | Auto-flag |
| SOS trigger | Immediate | SOS_CONTACTS | SMS alert |
| Critical vitals | BP >180, Glucose >400 | USER, FAMILY | App notification |
| Doctor suspended | Immediate | DOCTOR, Patients | Access revoked |
| Admin PHI access | Any | USER, Compliance Officer | Transparency log |
| Data export | Any | USER | Confirmation email |

**Anomaly Detection:**
```typescript
// ML-based access monitoring:
- Baseline: User typically accesses 2-5 records/day
- Alert: User accesses 100 records in 1 hour (unusual)
- Investigation: Admin reviews audit logs
- Action: Contact user or suspend account if malicious

// Suspicious patterns:
- Access from new location (geolocation change)
- Unusual time (3 AM access when normally 9 AM-5 PM)
- Bulk data export (potential breach)
- Rapid sequential access (scraping attempt)
```

---

## Data Isolation & Multi-Tenancy

### 🏥 Organization-Based Access

| User Role | Data Scope | Query Filter |
|-----------|------------|--------------|
| **USER** | Own data only | `WHERE userId = currentUser.id` |
| **DOCTOR** | Consented patients | `WHERE patientConsent.includes(currentDoctor.id)` |
| **FAMILY_ADMIN** | Family group data | `WHERE familyId = currentUser.familyId` |
| **FAMILY_MEMBER** | Consented family data | `WHERE familyId = currentUser.familyId AND consent = true` |
| **DEPENDENT** | No independent access | N/A (managed by FAMILY_ADMIN) |
| **ADMIN** | All data (read-only) | No filter (audit logged) |

**Query Security Implementation:**
```typescript
// Automatic row-level security:
async function getDiary(userId, diaryId) {
  const user = await getCurrentUser();
  
  let query = db.diary.findUnique({
    where: { id: diaryId }
  });
  
  // Apply role-based filters:
  if (user.role === 'USER') {
    // Own data only
    if (diary.userId !== user.id) {
      throw new ForbiddenError("Cannot access other users' diaries");
    }
  } else if (user.role === 'FAMILY_ADMIN') {
    // Family data only
    const familyMemberIds = await getFamilyMemberIds(user.familyId);
    if (!familyMemberIds.includes(diary.userId)) {
      throw new ForbiddenError("Cannot access non-family diaries");
    }
  } else if (user.role === 'FAMILY_MEMBER') {
    // Consented family data
    const consent = await checkFamilyConsent(diary.userId, user.id);
    if (!consent) {
      throw new ForbiddenError("Family member has not shared this data");
    }
  } else if (user.role === 'DOCTOR') {
    // Patient consent required
    const consent = await checkPatientConsent(diary.userId, user.id);
    if (!consent) {
      throw new ForbiddenError("Patient has not authorized access");
    }
  } else if (user.role === 'ADMIN') {
    // Audit log admin access
    await auditLog.create({
      action: 'PHI_ACCESS',
      adminId: user.id,
      reason: 'Support ticket #1234',
      dataAccessed: { diaryId }
    });
  }
  
  return diary;
}
```

**Justifications:**
- Database-level isolation prevents accidental data leaks
- No user can access data outside their scope
- Programmatic enforcement (not relying on UI hiding)
- Multiple layers of security (defense in depth)

---

## Security Implementation

### 🔐 Middleware Stack

```typescript
// Standard route protection:
router.post(
  '/api/lab-reports',
  authenticate,                      // JWT verification
  authorize(['USER', 'FAMILY_ADMIN']), // Role check
  validateOwnership,                 // Resource ownership
  rateLimit({ max: 20, window: '1h' }), // Abuse prevention
  validate(labReportSchema),         // Input validation
  auditLog('LAB_REPORT_CREATE'),     // Audit logging
  labReportController.create         // Controller
);

// Family data access:
router.get(
  '/api/diary/:userId',
  authenticate,
  authorize(['USER', 'FAMILY_ADMIN', 'FAMILY_MEMBER']),
  checkFamilyRelationship,           // Family membership
  checkFamilyConsent,                // Data sharing consent
  auditLog('DIARY_ACCESS'),
  diaryController.getByUser
);

// Doctor access to patient data:
router.get(
  '/api/patients/:patientId/records',
  authenticate,
  authorize(['DOCTOR']),
  checkDoctorVerification,           // License verified
  checkPatientConsent,               // Patient authorized
  checkActiveConsultation,           // Ongoing treatment
  auditLog('PHI_ACCESS_DOCTOR'),
  patientController.getRecords
);

// Admin oversight:
router.get(
  '/api/admin/users/:userId/health-records',
  authenticate,
  authorize(['ADMIN']),
  requireJustification,              // Must provide reason
  notifyUser,                        // Transparency notification
  auditLog('ADMIN_PHI_ACCESS'),
  adminController.viewHealthRecords
);
```

### 🚨 Error Responses

| Scenario | HTTP Status | Error Code | Response |
|----------|-------------|------------|----------|
| No JWT token | 401 | AUTH_TOKEN_MISSING | `{ "error": "Authentication required" }` |
| Invalid JWT | 401 | AUTH_TOKEN_INVALID | `{ "error": "Invalid authentication token" }` |
| Expired JWT | 401 | AUTH_TOKEN_EXPIRED | `{ "error": "Session expired, please login" }` |
| Insufficient role | 403 | FORBIDDEN_ROLE | `{ "error": "You don't have permission" }` |
| Not family member | 403 | FORBIDDEN_NOT_FAMILY | `{ "error": "Not authorized to access family data" }` |
| No family consent | 403 | FORBIDDEN_NO_CONSENT | `{ "error": "Family member hasn't shared this data" }` |
| No patient consent | 403 | FORBIDDEN_NO_PATIENT_CONSENT | `{ "error": "Patient hasn't authorized access" }` |
| Doctor not verified | 403 | DOCTOR_NOT_VERIFIED | `{ "error": "Medical license not verified" }` |
| Resource not found | 404 | NOT_FOUND | `{ "error": "Resource not found" }` |
| Rate limit exceeded | 429 | RATE_LIMIT_EXCEEDED | `{ "error": "Too many requests, try again later" }` |

---

## Consent Management

### ✅ Patient Consent Types

| Consent Type | Required For | Granted By | Revocable | Audit Logged |
|--------------|--------------|------------|-----------|--------------|
| **Family Data Sharing** | FAMILY_MEMBER access | USER | ✅ | ✅ |
| **Doctor Access** | Clinical consultation | USER | ✅ | ✅ |
| **SOS Emergency** | Emergency responder access | USER | ✅ | ✅ |
| **AI Processing** | OCR, analysis | USER | ❌ | ✅ |
| **Data Export** | Third-party sharing | USER | N/A | ✅ |
| **Research Use** | Anonymized analytics | USER | ✅ | ✅ |

**Consent Management UI:**
```typescript
// User consent dashboard:
{
  familySharing: {
    enabled: true,
    sharedWith: [
      {
        memberId: "spouse-id",
        memberName: "Jane Doe",
        dataTypes: ["diary", "measurements", "appointments"],
        canEdit: false,
        grantedAt: "2025-06-15",
        expiresAt: null // Permanent until revoked
      }
    ]
  },
  doctorAccess: {
    enabled: true,
    authorizedDoctors: [
      {
        doctorId: "dr-smith-id",
        doctorName: "Dr. John Smith",
        specialty: "Cardiology",
        accessLevel: "FULL", // FULL, LIMITED, EMERGENCY_ONLY
        grantedAt: "2025-12-01",
        expiresAt: "2026-12-01" // Auto-expire after 1 year
      }
    ]
  },
  sosAccess: {
    enabled: true,
    emergencyContacts: [
      {
        name: "Emergency Contact",
        phone: "+1234567890",
        dataShared: "CRITICAL_ONLY" // CRITICAL_ONLY, FULL
      }
    ]
  }
}
```

**Revocation Workflow:**
```typescript
// User revokes family consent:
1. User clicks "Revoke access" for family member
2. System confirms: "This will immediately stop sharing your health data"
3. User confirms
4. Access revoked in database (immediate effect)
5. Family member notified via email/notification
6. Audit log created: "User X revoked consent for Family Member Y"
7. API returns 403 on next access attempt

// Automatic expiration:
- Consent can have expiration date
- System checks expiration on every access
- Expired consent treated as revoked
- User notified 7 days before expiration
```

---

## Mobile App & API Security

### 📱 Mobile-Specific Access Control

| Feature | Requires | Biometric | Pin Code | Session Timeout |
|---------|----------|-----------|----------|-----------------|
| View health records | Auth | Optional | Optional | 15 minutes |
| Create diary entry | Auth | No | No | 15 minutes |
| Upload lab report | Auth | No | No | 15 minutes |
| View prescriptions | Auth | ⚠️ | ⚠️ | 5 minutes |
| SOS trigger | No auth | No | No | Immediate |
| AI consultation | Auth | No | No | 15 minutes |
| Payment/billing | Auth | ✅ | ✅ | 1 minute |
| Settings change | Auth | ⚠️ | ⚠️ | 5 minutes |

**Mobile Security Features:**
```typescript
// App-level security:
- Biometric authentication (Face ID, Touch ID, fingerprint)
- PIN code protection (6-digit)
- Auto-lock after inactivity (configurable)
- Secure storage (iOS Keychain, Android Keystore)
- Certificate pinning (prevent MITM attacks)
- Jailbreak/root detection (warn user)
- Screen capture prevention (PHI screens)
- Secure clipboard (auto-clear after 30s)

// Session management:
- JWT stored in secure storage (not AsyncStorage)
- Refresh token for seamless experience
- Device fingerprinting for anomaly detection
- Logout on app uninstall
- Remote logout capability (stolen device)
```

---

## Future Enhancements

### 🚀 Planned Access Control Features

**Q2 2026:**
- [ ] Blockchain-based consent log (immutable)
- [ ] Granular data field-level permissions
- [ ] Time-based access (doctor access expires automatically)
- [ ] Geofencing (restrict access by location)
- [ ] Device-level access control (trusted devices only)

**Q3 2026:**
- [ ] Federated identity (SSO with healthcare providers)
- [ ] Smart contract-based data sharing (Ethereum)
- [ ] Differential privacy for analytics
- [ ] Homomorphic encryption (compute on encrypted data)
- [ ] Zero-knowledge proofs (prove without revealing)

**Q4 2026:**
- [ ] Attribute-based access control (ABAC)
- [ ] Policy-based automation (XACML)
- [ ] Real-time access anomaly detection (AI)
- [ ] Decentralized identity (DID)
- [ ] FHIR-compliant access control

---

## Compliance Matrix

| Requirement | HIPAA | GDPR | Status |
|-------------|-------|------|--------|
| User authentication | ✅ | ✅ | Implemented |
| Access control lists | ✅ | ✅ | Implemented |
| Audit logging (6 years) | ✅ | ✅ | Implemented |
| Data encryption | ✅ | ✅ | Implemented |
| Consent management | ✅ | ✅ | Implemented |
| Right to access | ✅ | ✅ | Implemented |
| Right to erasure | ⚠️ | ✅ | Implemented (GDPR) |
| Right to portability | ✅ | ✅ | Implemented |
| Breach notification | ✅ | ✅ | Implemented |
| Minimum necessary | ✅ | N/A | Implemented |
| Business associate agreements | ✅ | N/A | In place (Cloudinary, Twilio, OpenAI) |
| Privacy by design | ✅ | ✅ | Implemented |

---

## Conclusion

LifeDoc's access control model ensures:

1. **Patient Autonomy** - Users control their health data
2. **Family Privacy** - Consent-based sharing with family members
3. **Clinical Access** - Doctors access only authorized patient data
4. **Emergency Override** - Life-saving information available during SOS
5. **Data Integrity** - Immutable medical records and audit logs
6. **Regulatory Compliance** - HIPAA and GDPR requirements met
7. **Transparency** - All access logged and users notified
8. **Least Privilege** - Minimum necessary access for each role

**Every access decision is logged. Every patient is informed. Every record is protected.** 🔒🏥

---

**Document Version**: 1.0  
**Last Updated**: January 11, 2026  
**Next Review**: July 11, 2026  
**Maintained By**: LifeDoc Security Team

---

## Contact

For access control questions or security concerns:
- **Email**: security@lifedoc.example.com
- **Documentation**: See [SECURITY.md](SECURITY.md) for general security policy
- **Support**: support@lifedoc.example.com

---

*This access control policy is a living document aligned with our commitment to patient privacy and data security.*
