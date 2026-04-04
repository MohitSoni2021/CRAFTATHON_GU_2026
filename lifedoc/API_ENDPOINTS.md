# 📡 LifeDoc API Documentation

Complete reference for all API endpoints, authentication, request/response formats, and error handling.

---

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [AI Services](#ai-services-endpoints)
  - [Measurements](#measurements-endpoints)
  - [Lab Reports](#lab-reports-endpoints)
  - [Doctor Reports](#doctor-reports-endpoints)
  - [Appointments](#appointments-endpoints)
  - [Diary](#diary-endpoints)
  - [Family Management](#family-management-endpoints)
  - [Medicine Reference](#medicine-reference-endpoints)
  - [Emergency SOS](#emergency-sos-endpoints)
  - [Doctor Verification](#doctor-verification-endpoints)
  - [Admin](#admin-endpoints)
  - [News](#news-endpoints)

---

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.lifedoc.app/api
```

---

## Authentication

### JWT Token Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

### Token Details

- **Token Expiry**: 24 hours
- **Token Format**: JWT (JSON Web Token)
- **Token Payload**: `{ id: userId, type: userType, iat: timestamp, exp: expiry }`

### Getting a Token

1. Sign up using `/api/auth/signup`
2. Verify OTP using `/api/auth/verify-otp`
3. Login using `/api/auth/login` (returns JWT token)
4. Include token in all subsequent requests

---

## Rate Limiting

Rate limits are applied per IP address and per user to prevent abuse.

| Endpoint Type | Limit | Window | Scope |
|---------------|-------|--------|-------|
| **Default** | 100 requests | 15 minutes | Per IP |
| **AI Endpoints** | 20 requests | 15 minutes | Per User |
| **File Upload** | 10 requests | 15 minutes | Per User |
| **Authentication** | 5 requests | 15 minutes | Per IP |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641024000
```

---

## Error Handling

All API errors follow a consistent JSON format:

### Error Response Format

```json
{
  "message": "User-friendly error description",
  "error": "Detailed technical error message",
  "statusCode": 400
}
```

### HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| **200** | OK | Successful GET/PUT/DELETE request |
| **201** | Created | Successful POST request |
| **400** | Bad Request | Invalid request body, missing required fields |
| **401** | Unauthorized | Missing or invalid JWT token |
| **403** | Forbidden | Valid token but insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server-side error |

### Common Error Examples

#### Invalid Token
```json
{
  "message": "Invalid or expired token",
  "error": "JsonWebTokenError: invalid signature",
  "statusCode": 401
}
```

#### Missing Required Field
```json
{
  "message": "Validation failed",
  "error": "Name is required",
  "statusCode": 400
}
```

#### Rate Limit Exceeded
```json
{
  "message": "Too many requests, please try again later",
  "statusCode": 429
}
```

---

## Endpoints

---

## Authentication Endpoints

Base path: `/api/auth`

### 1. Sign Up

Create a new user account and send OTP for verification.

**Endpoint:** `POST /api/auth/signup`  
**Authentication:** ❌ Not Required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "age": 35
}
```

**Validation Rules:**
- `name`: Required, 2-50 characters
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `age`: Optional, 1-120

**Success Response:** `200 OK`
```json
{
  "message": "OTP sent to email",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Error Responses:**
```json
// Email already exists
{
  "message": "Email already registered",
  "statusCode": 400
}

// Invalid email format
{
  "message": "Invalid email format",
  "statusCode": 400
}
```

---

### 2. Verify OTP

Verify the OTP sent during signup and activate the account.

**Endpoint:** `POST /api/auth/verify-otp`  
**Authentication:** ❌ Not Required

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "otp": "123456"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Account verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "type": "user",
    "isVerified": true
  }
}
```

**Error Responses:**
```json
// Invalid or expired OTP
{
  "message": "Invalid or expired OTP",
  "statusCode": 400
}
```

---

### 3. Login

Authenticate user with email and password.

**Endpoint:** `POST /api/auth/login`  
**Authentication:** ❌ Not Required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "type": "user",
    "isVerified": true,
    "age": 35
  }
}
```

**Error Responses:**
```json
// Invalid credentials
{
  "message": "Invalid email or password",
  "statusCode": 401
}

// Account not verified
{
  "message": "Please verify your email first",
  "statusCode": 401
}
```

---

### 4. Get Profile

Retrieve current user's profile information.

**Endpoint:** `GET /api/auth/profile`  
**Authentication:** ✅ Required

**Success Response:** `200 OK`
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 35,
  "type": "user",
  "isVerified": true,
  "profile": {
    "gender": "male",
    "height": 175,
    "weight": 75,
    "bloodGroup": "O+",
    "chronicConditions": ["Diabetes Type 2", "Hypertension"]
  },
  "sosContacts": [
    {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "email": "jane@example.com",
      "relationship": "Spouse"
    }
  ]
}
```

---

### 5. Update Profile

Update user profile information.

**Endpoint:** `PUT /api/auth/profile`  
**Authentication:** ✅ Required

**Request Body:**
```json
{
  "name": "John Smith",
  "age": 36,
  "profile": {
    "gender": "male",
    "height": 175,
    "weight": 73,
    "bloodGroup": "O+",
    "chronicConditions": ["Diabetes Type 2"]
  }
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "age": 36,
    "profile": {
      "gender": "male",
      "height": 175,
      "weight": 73,
      "bloodGroup": "O+",
      "chronicConditions": ["Diabetes Type 2"]
    }
  }
}
```

---

### 6. Update SOS Contacts

Manage emergency contacts for SOS alerts.

**Endpoint:** `PUT /api/auth/sos-contacts`  
**Authentication:** ✅ Required

**Request Body:**
```json
{
  "sosContacts": [
    {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "email": "jane@example.com",
      "relationship": "Spouse"
    },
    {
      "name": "Mike Johnson",
      "phone": "+0987654321",
      "email": "mike@example.com",
      "relationship": "Brother"
    }
  ]
}
```

**Validation Rules:**
- Maximum 5 contacts
- `name`: Required
- `phone`: Required, valid phone format
- `email`: Optional, valid email format
- `relationship`: Optional

**Success Response:** `200 OK`
```json
{
  "message": "SOS contacts updated successfully",
  "sosContacts": [...]
}
```

---

## AI Services Endpoints

Base path: `/api/ai`

### 1. Symptom Analysis

Get AI-powered symptom analysis with recommendations.

**Endpoint:** `POST /api/ai/analyze`  
**Authentication:** ✅ Required  
**Rate Limit:** 20 requests per 15 minutes

**Request Body:**
```json
{
  "text": "I have been experiencing severe headaches for 3 days, along with dizziness and nausea",
  "language": "en"
}
```

**Parameters:**
- `text`: Required, symptom description (10-2000 characters)
- `language`: Optional, default "en" (options: "en", "hi", "gu")

**Success Response:** `200 OK`
```json
{
  "summary": "Based on your symptoms, you may be experiencing tension headaches or migraines. The combination of headaches, dizziness, and nausea suggests you should seek medical attention.",
  "urgency": "Medium",
  "actions": [
    "Stay hydrated - drink at least 8 glasses of water today",
    "Rest in a dark, quiet room",
    "Monitor symptoms for 24 hours",
    "Consult a doctor if symptoms worsen",
    "Avoid bright screens and loud noises"
  ],
  "lifestyleAdvice": [
    "Maintain regular sleep schedule (7-8 hours)",
    "Reduce screen time before bed",
    "Practice stress management techniques",
    "Avoid skipping meals"
  ],
  "suggestedMedicines": [
    "Paracetamol 500mg (consult doctor first)",
    "Ibuprofen 200mg for pain relief"
  ],
  "tokenUsage": {
    "promptTokens": 150,
    "completionTokens": 280,
    "totalTokens": 430
  },
  "consultationId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Urgency Levels:**
- **Low**: Minor symptoms, self-care possible
- **Medium**: Moderate symptoms, consult doctor within 24-48 hours
- **High**: Severe symptoms, seek immediate medical attention

---

### 2. Analyze Prescription

Extract structured data from prescription images using Vision AI.

**Endpoint:** `POST /api/ai/analyze-prescription`  
**Authentication:** ✅ Required  
**Rate Limit:** 10 requests per 15 minutes

**Request Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/.../prescription.jpg"
}
```

**Alternative (Base64):**
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Success Response:** `200 OK`
```json
{
  "medicines": [
    {
      "name": "Metformin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "30 days",
      "instructions": "Take after meals"
    },
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "30 days",
      "instructions": "Take in the morning"
    }
  ],
  "doctorName": "Dr. Sarah Johnson",
  "prescriptionDate": "2026-01-05",
  "hospitalName": "City General Hospital",
  "notes": "Follow-up appointment in 4 weeks"
}
```

**Error Responses:**
```json
// No text detected
{
  "message": "Could not extract text from image",
  "statusCode": 400
}

// Invalid image format
{
  "message": "Only JPEG and PNG images are supported",
  "statusCode": 400
}
```

---

### 3. Analyze Lab Report

Parse lab reports and extract test results.

**Endpoint:** `POST /api/ai/analyze-lab-report`  
**Authentication:** ✅ Required  
**Rate Limit:** 10 requests per 15 minutes

**Request Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/.../lab-report.pdf",
  "reportType": "blood_test"
}
```

**Success Response:** `200 OK`
```json
{
  "testName": "Complete Blood Count (CBC)",
  "reportDate": "2026-01-08",
  "labName": "MediLab Diagnostics",
  "results": [
    {
      "testName": "Hemoglobin",
      "value": "13.5",
      "unit": "g/dL",
      "referenceRange": "13.0 - 17.0",
      "status": "normal"
    },
    {
      "testName": "WBC Count",
      "value": "11.2",
      "unit": "10^3/μL",
      "referenceRange": "4.0 - 10.0",
      "status": "high",
      "flag": "H"
    },
    {
      "testName": "Platelet Count",
      "value": "250",
      "unit": "10^3/μL",
      "referenceRange": "150 - 400",
      "status": "normal"
    }
  ],
  "summary": "Your CBC results show slightly elevated white blood cells, which may indicate an infection or inflammation. Other values are within normal range.",
  "abnormalFlags": [
    {
      "test": "WBC Count",
      "value": "11.2",
      "concern": "Mild elevation - consult doctor"
    }
  ]
}
```

---

### 4. Summarize Diary Entry

Generate AI summary of health diary entry.

**Endpoint:** `POST /api/ai/summerizer`  
**Authentication:** ✅ Required

**Request Body:**
```json
{
  "text": "Today I woke up feeling refreshed after 8 hours of sleep. Had a healthy breakfast with oats and fruits. Went for a 30-minute walk in the morning. Blood pressure was 120/80. Took my diabetes medication on time. Felt a bit tired in the afternoon but recovered after a short nap. Overall, a good day with no health issues.",
  "date": "2026-01-10"
}
```

**Success Response:** `200 OK`
```json
{
  "summary": "Good health day with 8 hours sleep, healthy diet, 30-min exercise. BP normal (120/80). Medication adherence maintained. Afternoon fatigue resolved with rest.",
  "mood": "positive",
  "highlights": [
    "8 hours quality sleep",
    "Regular exercise",
    "Normal blood pressure",
    "Medication adherence"
  ],
  "concerns": [
    "Mild afternoon fatigue (resolved)"
  ],
  "suggestedTags": ["good_sleep", "exercise", "medication", "healthy_diet"]
}
```

---

## Measurements Endpoints

Base path: `/api/measurements`

### 1. Add Measurement

Record a new vital sign measurement.

**Endpoint:** `POST /api/measurements`  
**Authentication:** ✅ Required

**Request Body (Blood Pressure):**
```json
{
  "type": "blood_pressure",
  "value": {
    "systolic": 120,
    "diastolic": 80
  },
  "unit": "mmHg",
  "timestamp": "2026-01-10T08:30:00Z",
  "notes": "Morning reading before breakfast"
}
```

**Request Body (Blood Glucose):**
```json
{
  "type": "glucose",
  "value": 95,
  "unit": "mg/dL",
  "timestamp": "2026-01-10T09:00:00Z",
  "context": "fasting"
}
```

**Request Body (Weight):**
```json
{
  "type": "weight",
  "value": 75.5,
  "unit": "kg",
  "timestamp": "2026-01-10T07:00:00Z"
}
```

**Supported Types:**
- `blood_pressure`: Systolic/Diastolic (mmHg)
- `glucose`: Blood sugar (mg/dL)
- `heart_rate`: BPM
- `weight`: kg or lbs
- `temperature`: °C or °F
- `spo2`: Oxygen saturation (%)

**Success Response:** `201 Created`
```json
{
  "message": "Measurement added successfully",
  "measurement": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "507f1f77bcf86cd799439011",
    "type": "blood_pressure",
    "value": {
      "systolic": 120,
      "diastolic": 80
    },
    "unit": "mmHg",
    "timestamp": "2026-01-10T08:30:00Z",
    "notes": "Morning reading before breakfast"
  }
}
```

---

### 2. Get Measurements

Retrieve measurement history with filtering.

**Endpoint:** `GET /api/measurements`  
**Authentication:** ✅ Required

**Query Parameters:**
- `type`: Filter by measurement type (e.g., `blood_pressure`)
- `startDate`: ISO date (e.g., `2026-01-01`)
- `endDate`: ISO date (e.g., `2026-01-10`)
- `limit`: Number of results (default: 50, max: 100)
- `sort`: Sort order (`asc` or `desc`, default: `desc`)

**Example Request:**
```
GET /api/measurements?type=blood_pressure&startDate=2026-01-01&limit=10
```

**Success Response:** `200 OK`
```json
{
  "measurements": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "type": "blood_pressure",
      "value": {
        "systolic": 120,
        "diastolic": 80
      },
      "unit": "mmHg",
      "timestamp": "2026-01-10T08:30:00Z",
      "notes": "Morning reading"
    },
    // ... more measurements
  ],
  "count": 10,
  "total": 45
}
```

---

### 3. Update Measurement

Update an existing measurement.

**Endpoint:** `PUT /api/measurements/:id`  
**Authentication:** ✅ Required

**Request Body:**
```json
{
  "value": {
    "systolic": 118,
    "diastolic": 78
  },
  "notes": "Corrected reading - morning before breakfast"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Measurement updated successfully",
  "measurement": { ... }
}
```

---

### 4. Delete Measurement

Delete a measurement record.

**Endpoint:** `DELETE /api/measurements/:id`  
**Authentication:** ✅ Required

**Success Response:** `200 OK`
```json
{
  "message": "Measurement deleted successfully"
}
```

---

## Lab Reports Endpoints

Base path: `/api/lab-reports`

### 1. Upload Lab Report

Upload and parse a lab report document.

**Endpoint:** `POST /api/lab-reports`  
**Authentication:** ✅ Required  
**Content-Type:** `multipart/form-data`

**Form Data:**
```
file: <PDF or Image file>
reportDate: "2026-01-08"
testType: "Complete Blood Count"
notes: "Annual checkup"
```

**Success Response:** `201 Created`
```json
{
  "message": "Lab report uploaded successfully",
  "report": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "507f1f77bcf86cd799439011",
    "reportDate": "2026-01-08",
    "testType": "Complete Blood Count",
    "fileUrl": "https://res.cloudinary.com/.../lab_report.pdf",
    "parsedResults": { ... },
    "notes": "Annual checkup",
    "uploadedAt": "2026-01-10T10:00:00Z"
  }
}
```

---

### 2. Get Lab Reports

Retrieve lab report history.

**Endpoint:** `GET /api/lab-reports`  
**Authentication:** ✅ Required

**Query Parameters:**
- `startDate`: Filter from date
- `endDate`: Filter to date
- `testType`: Filter by test type
- `limit`: Results per page (default: 20)

**Success Response:** `200 OK`
```json
{
  "reports": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "reportDate": "2026-01-08",
      "testType": "Complete Blood Count",
      "fileUrl": "https://...",
      "parsedResults": { ... }
    }
  ],
  "count": 10
}
```

---

### 3. Get Single Lab Report

Retrieve detailed lab report.

**Endpoint:** `GET /api/lab-reports/:id`  
**Authentication:** ✅ Required

**Success Response:** `200 OK`
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "userId": "507f1f77bcf86cd799439011",
  "reportDate": "2026-01-08",
  "testType": "Complete Blood Count",
  "fileUrl": "https://res.cloudinary.com/.../lab_report.pdf",
  "parsedResults": {
    "results": [ ... ],
    "summary": "...",
    "abnormalFlags": [ ... ]
  },
  "notes": "Annual checkup",
  "uploadedAt": "2026-01-10T10:00:00Z"
}
```

---

### 4. Delete Lab Report

Delete a lab report.

**Endpoint:** `DELETE /api/lab-reports/:id`  
**Authentication:** ✅ Required

**Success Response:** `200 OK`
```json
{
  "message": "Lab report deleted successfully"
}
```

---

## Doctor Reports Endpoints

Base path: `/api/doctor-reports`

### 1. Create Doctor Report

Record a doctor visit with prescriptions.

**Endpoint:** `POST /api/doctor-reports`  
**Authentication:** ✅ Required

**Request Body:**
```json
{
  "visitDate": "2026-01-09",
  "doctorName": "Dr. Sarah Johnson",
  "specialty": "Endocrinologist",
  "hospitalName": "City General Hospital",
  "diagnosis": ["Type 2 Diabetes", "Hypertension"],
  "prescriptions": [
    {
      "medicine": "Metformin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "30 days"
    }
  ],
  "notes": "Follow-up in 4 weeks",
  "fileUrl": "https://..." // Optional prescription image
}
```

**Success Response:** `201 Created`
```json
{
  "message": "Doctor report created successfully",
  "report": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "visitDate": "2026-01-09",
    "doctorName": "Dr. Sarah Johnson",
    "diagnosis": ["Type 2 Diabetes", "Hypertension"],
    "prescriptions": [ ... ]
  }
}
```

---

### 2. Get Doctor Reports

Retrieve doctor visit history.

**Endpoint:** `GET /api/doctor-reports`  
**Authentication:** ✅ Required

**Success Response:** `200 OK`
```json
{
  "reports": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "visitDate": "2026-01-09",
      "doctorName": "Dr. Sarah Johnson",
      "diagnosis": ["Type 2 Diabetes"],
      "prescriptions": [ ... ]
    }
  ]
}
```

---

## Emergency SOS Endpoints

Base path: `/api/sos`

### 1. Send SOS Alert

Send emergency alert to all SOS contacts.

**Endpoint:** `POST /api/sos/alert`  
**Authentication:** ✅ Required

**Request Body:**
```json
{
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Main St, San Francisco, CA"
  },
  "message": "Emergency! Please help immediately.",
  "severity": "critical"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "SOS alert sent successfully",
  "alertsSent": 3,
  "contacts": [
    {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "status": "sent"
    }
  ],
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "googleMapsUrl": "https://maps.google.com/?q=37.7749,-122.4194"
  }
}
```

---

## Family Management Endpoints

Base path: `/api/family`

### 1. Create Family Group

Create a new family group (user becomes admin).

**Endpoint:** `POST /api/family`  
**Authentication:** ✅ Required

**Request Body:**
```json
{
  "familyName": "The Smiths"
}
```

**Success Response:** `201 Created`
```json
{
  "message": "Family group created successfully",
  "family": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "adminId": "507f1f77bcf86cd799439011",
    "familyName": "The Smiths",
    "members": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "role": "admin",
        "joinedAt": "2026-01-10T10:00:00Z"
      }
    ]
  }
}
```

---

### 2. Add Family Member

Invite or add a member to family group.

**Endpoint:** `POST /api/family/members`  
**Authentication:** ✅ Required (Admin only)

**Request Body:**
```json
{
  "email": "member@example.com",
  "role": "caregiver",
  "relationship": "spouse"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Invitation sent successfully",
  "member": {
    "email": "member@example.com",
    "role": "caregiver",
    "status": "pending"
  }
}
```

---

### 3. Get Family Members

View all family members and their health summaries.

**Endpoint:** `GET /api/family/members`  
**Authentication:** ✅ Required

**Success Response:** `200 OK`
```json
{
  "family": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "familyName": "The Smiths",
    "members": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "role": "admin",
        "healthSummary": {
          "lastCheckup": "2026-01-05",
          "chronicConditions": ["Diabetes"],
          "recentMeasurements": { ... }
        }
      }
    ]
  }
}
```

---

### 4. Analyze Family Health

Get AI-powered family health insights.

**Endpoint:** `POST /api/family/analyze`  
**Authentication:** ✅ Required

**Success Response:** `200 OK`
```json
{
  "summary": "Overall family health is good. John needs to monitor blood sugar levels more regularly. All members are up-to-date with medications.",
  "insights": [
    {
      "member": "John Doe",
      "concerns": ["Irregular blood sugar monitoring"],
      "recommendations": ["Check glucose daily", "Schedule endocrinologist visit"]
    }
  ],
  "familyTrends": {
    "commonConditions": ["Diabetes", "Hypertension"],
    "medicationAdherence": "85%"
  }
}
```

---

## Admin Endpoints

Base path: `/api/admin`  
**Authentication:** ✅ Required (Admin role only)

### 1. Get All Users

**Endpoint:** `GET /api/admin/users`

**Success Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "type": "user",
      "isVerified": true,
      "createdAt": "2025-12-01T00:00:00Z"
    }
  ],
  "total": 150
}
```

---

### 2. Get Doctor Verifications

**Endpoint:** `GET /api/admin/doctor-verifications`

**Query Parameters:**
- `status`: Filter by status (`pending`, `approved`, `rejected`)

**Success Response:** `200 OK`
```json
{
  "verifications": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "userId": "507f1f77bcf86cd799439011",
      "userName": "Dr. Sarah Johnson",
      "email": "sarah@example.com",
      "documents": [
        "https://cloudinary.com/.../license.pdf",
        "https://cloudinary.com/.../id.pdf",
        "https://cloudinary.com/.../degree.pdf"
      ],
      "status": "pending",
      "submittedAt": "2026-01-08T10:00:00Z"
    }
  ]
}
```

---

### 3. Approve/Reject Doctor Verification

**Endpoint:** `PUT /api/admin/doctor-verifications/:id`

**Request Body:**
```json
{
  "status": "approved",
  "notes": "All documents verified successfully"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Doctor verification updated successfully",
  "verification": {
    "status": "approved",
    "reviewedAt": "2026-01-10T10:00:00Z"
  }
}
```

---

### 4. Get AI Usage Statistics

**Endpoint:** `GET /api/admin/ai-stats`

**Success Response:** `200 OK`
```json
{
  "totalConsultations": 1250,
  "totalTokensUsed": 450000,
  "averageTokensPerConsultation": 360,
  "estimatedCost": "$4.50",
  "consultationsByUrgency": {
    "Low": 500,
    "Medium": 600,
    "High": 150
  },
  "dateRange": {
    "from": "2025-12-01",
    "to": "2026-01-10"
  }
}
```

---

## Doctor Endpoints

Base path: `/api/doctor`  
**Authentication:** ✅ Required (Doctor role)

### 1. Get Pending Consultations

**Endpoint:** `GET /api/doctor/consultations/pending`

**Success Response:** `200 OK`
```json
{
  "consultations": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "userId": "507f1f77bcf86cd799439011",
      "userName": "John Doe",
      "symptoms": "Severe headache for 3 days",
      "aiSummary": "...",
      "urgency": "Medium",
      "date": "2026-01-09T10:00:00Z"
    }
  ]
}
```

---

### 2. Review Consultation

**Endpoint:** `POST /api/doctor/consultations/:id/review`

**Request Body:**
```json
{
  "feedback": "AI assessment is accurate. Patient should monitor symptoms and follow up if they persist.",
  "recommendations": ["Schedule appointment if symptoms worsen", "Try relaxation techniques"],
  "status": "reviewed"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Consultation reviewed successfully"
}
```

---

## Medicine Reference Endpoints

Base path: `/api/reference`

### 1. Search Medicines

**Endpoint:** `GET /api/reference/medicines/search`  
**Authentication:** ✅ Required

**Query Parameters:**
- `q`: Search query (medicine name)
- `limit`: Results limit (default: 10, max: 50)

**Example Request:**
```
GET /api/reference/medicines/search?q=metformin&limit=10
```

**Success Response:** `200 OK`
```json
{
  "medicines": [
    {
      "name": "Metformin Hydrochloride",
      "brandNames": ["Glucophage", "Fortamet"],
      "genericName": "Metformin",
      "dosageForms": ["Tablet", "Extended Release"],
      "manufacturer": "Various",
      "fdaUrl": "https://..."
    }
  ]
}
```

---

### 2. Get Medicine Details

**Endpoint:** `GET /api/reference/medicines/:id`  
**Authentication:** ✅ Required

**Success Response:** `200 OK`
```json
{
  "name": "Metformin Hydrochloride",
  "genericName": "Metformin",
  "brandNames": ["Glucophage", "Fortamet"],
  "indications": ["Type 2 Diabetes Mellitus"],
  "dosage": "500mg to 2000mg daily",
  "sideEffects": ["Nausea", "Diarrhea", "Stomach upset"],
  "warnings": ["Risk of lactic acidosis", "Kidney function monitoring required"],
  "interactions": ["Alcohol", "Contrast dyes"],
  "manufacturer": "Various",
  "fdaApprovalDate": "1994-12-29"
}
```

---

## News Endpoints

Base path: `/api/news`

### 1. Get Health News

**Endpoint:** `GET /api/news`  
**Authentication:** ✅ Required

**Query Parameters:**
- `category`: Filter by category (e.g., `diabetes`, `cardiology`)
- `limit`: Results per page (default: 20)

**Success Response:** `200 OK`
```json
{
  "articles": [
    {
      "id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "New Diabetes Treatment Shows Promise",
      "summary": "Researchers have discovered...",
      "source": "Medical News Today",
      "url": "https://...",
      "imageUrl": "https://...",
      "publishedAt": "2026-01-09T08:00:00Z",
      "category": "diabetes"
    }
  ]
}
```

---

## Webhooks (Coming Soon)

Receive real-time notifications for critical events.

**Supported Events:**
- `measurement.critical` - Vital signs exceed danger thresholds
- `consultation.high_urgency` - High-urgency AI consultation created
- `family.member_added` - New member joined family
- `report.analyzed` - Lab report analysis completed

**Webhook Payload Example:**
```json
{
  "event": "measurement.critical",
  "timestamp": "2026-01-10T12:00:00Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "measurementType": "blood_pressure",
    "value": { "systolic": 180, "diastolic": 110 },
    "severity": "critical"
  }
}
```

---

## SDKs & Client Libraries

### JavaScript/TypeScript

```bash
npm install @lifedoc/api-client
```

```typescript
import { LifeDocClient } from '@lifedoc/api-client';

const client = new LifeDocClient({
  apiKey: 'your_jwt_token',
  baseURL: 'https://api.lifedoc.app'
});

// Example: Get measurements
const measurements = await client.measurements.list({
  type: 'blood_pressure',
  limit: 10
});
```

---

## Testing with Postman

Import our Postman collection for easy API testing:

**Collection URL:** `https://www.postman.com/lifedoc/collection`

**Environment Variables:**
```
base_url: http://localhost:5000/api
token: <your_jwt_token>
```

---

## API Changelog

### Version 1.0 (Current)
- Initial API release
- All core endpoints operational
- JWT authentication implemented
- Rate limiting active

### Upcoming (Version 1.1)
- GraphQL endpoint
- WebSocket for real-time updates
- Batch operations
- Enhanced filtering and sorting

---

## Support & Feedback

- **API Issues**: [GitHub Issues](https://github.com/your-username/lifedoc/issues)
- **Email**: api-support@lifedoc.app
- **Documentation**: [Main README](README.md)

---

**Last Updated:** January 10, 2026  
**API Version:** 1.0  
**Status:** ✅ Stable
