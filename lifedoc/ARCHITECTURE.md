# Architecture - LifeDoc

> Technical architecture covering backend, frontend, authentication, AI services, and storage strategies

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Next.js 16 │ React 18 │ TypeScript │ Redux Toolkit │ Tailwind CSS │ Axios │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS / REST API
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  Express.js │ CORS │ Helmet │ Rate Limiting │ Request Logging │ Compression│
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
         ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
         │ AUTH MIDDLEWARE  │ │  VALIDATION  │ │ ROLE MIDDLEWARE  │
         │ JWT Verification │ │  Input       │ │ Role-based       │
         │ Token Decode     │ │  Sanitization│ │ Access Control   │
         └────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘
                  └──────────────────┼──────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTROLLER LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  AuthController │ ConsultationController │ LabReportController │ AIController│
│  MeasurementController │ FamilyController │ SOSController │ AdminController  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  AuthService │ AIService │ FileUploadService │ EmailService │ SMSService    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────────────────┐
                    ▼                 ▼                 ▼           ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │  MONGOOSE    │ │  CLOUDINARY  │ │  GEMINI AI   │ │  OPENAI      │
         │  ODM Layer   │ │  CDN Storage │ │  Health AI   │ │  Vision API  │
         └────────┬─────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
                  │              │                │                │
                  ▼              ▼                ▼                ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │   MongoDB    │ │  Cloudinary  │ │   Google     │ │    OpenAI    │
         │   Atlas      │ │   Storage    │ │   Gemini     │ │   Platform   │
         └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Backend Architecture

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | ≥20.0.0 | JavaScript runtime |
| Framework | Express.js | 5.2.1 | Web framework |
| Language | JavaScript | ES6+ | Primary language |
| Database | MongoDB | 9.0.2 | NoSQL document store |
| ODM | Mongoose | 9.0.2 | MongoDB object modeling |
| Auth | jsonwebtoken | 9.0.3 | JWT tokens |
| Password | bcryptjs | 6.0.0 | Password hashing |
| File Upload | Multer | 1.4.5 | Multipart handling |
| Cloud Storage | Cloudinary | 2.8.0 | CDN file storage |
| AI - Health | Google Generative AI | 0.24.1 | Symptom analysis, health insights |
| AI - Vision | OpenAI | 6.15.0 | Prescription OCR, lab report parsing |
| Email | Nodemailer | 7.0.12 | OTP delivery, notifications |
| SMS | Twilio | 5.11.2 | Emergency alerts |
| Security | Helmet | 8.0.0 | HTTP security headers |
| Rate Limiting | express-rate-limit | 7.7.3 | API throttling |
| PDF Parser | pdf-parse | 1.1.1 | Lab report text extraction |

### Directory Structure

```
server/
├── server.js                    # Entry point
├── package.json
├── .env                         # Environment variables
│
├── config/
│   ├── db.js                    # MongoDB connection
│   ├── cloudinary.js            # Cloudinary configuration
│   └── config.js                # General config
│
├── middleware/
│   ├── authMiddleware.js        # JWT authentication
│   ├── errorMiddleware.js       # Global error handling
│   ├── uploadMiddleware.js      # File upload (Multer)
│   └── rateLimiter.js           # Rate limiting
│
├── models/                      # Mongoose schemas
│   ├── User.js                  # User model
│   ├── Consultation.js          # AI consultations
│   ├── LabReport.js             # Lab test results
│   ├── DoctorReport.js          # Doctor visit records
│   ├── Measurement.js           # Vital signs
│   ├── Prescription.js          # Medicine prescriptions
│   ├── Diary.js                 # Health diary
│   ├── Appointment.js           # Medical appointments
│   ├── Family.js                # Family groups
│   ├── Medicine.js              # Medicine reference
│   ├── LabTest.js               # Lab test reference
│   ├── Article.js               # Health news
│   ├── DoctorVerification.js   # Doctor verification requests
│   ├── MeetingRequest.js        # Doctor-admin meetings
│   └── SavedPost.js             # Saved articles
│
├── controllers/                 # Request handlers
│   ├── authController.js
│   ├── consultationController.js
│   ├── labReportController.js
│   ├── measurementController.js
│   ├── diaryController.js
│   ├── familyController.js
│   ├── sosController.js
│   ├── adminController.js
│   ├── adminAIController.js
│   ├── adminMedicalController.js
│   ├── doctorVerificationController.js
│   └── meetingController.js
│
├── routes/                      # API routes
│   ├── auth.js
│   ├── ai.js
│   ├── measurements.js
│   ├── labReports.js
│   ├── doctorReports.js
│   ├── appointments.js
│   ├── diary.js
│   ├── family.js
│   ├── sos.js
│   ├── reference.js
│   ├── news.js
│   ├── doctorVerification.js
│   ├── meetings.js
│   ├── adminRoutes.js
│   ├── upload.js
│   └── share.js
│
├── services/                    # Business logic
│   └── aiService.js             # AI integration logic
│
├── jobs/                        # Background jobs
│   └── newsFetcher.js           # Health news cron job
│
├── prompts/                     # AI prompts
│   ├── labReportAnalyzer.txt
│   ├── diarySummerizer.txt
│   └── voicePersona.txt
│
├── scripts/                     # Utility scripts
│   ├── createAdmin.js           # Create admin user
│   ├── seedMedicalData.js       # Seed medicine database
│   ├── fetchNews.js             # Manual news fetch
│   └── listUsers.js             # Debug user list
│
├── test/                        # Test files
│   ├── diary.model.test.js
│   ├── measurement.model.test.js
│   ├── labReport.integration.test.js
│   └── ...
│
└── uploads/                     # Temporary upload directory
```

### Module Pattern

Each feature follows a consistent MVC pattern:

```
Feature (e.g., Measurements)
├── models/Measurement.js       # Mongoose schema, validations
├── controllers/measurementController.js  # Request handling
├── routes/measurements.js      # Route definitions
└── (optional) services/        # Complex business logic
```

### Middleware Chain

Request processing order:

```
1. CORS (Cross-Origin Resource Sharing)
       ↓
2. Helmet (Security Headers)
       ↓
3. Express.json() (JSON Body Parser)
       ↓
4. Express.urlencoded() (URL-encoded Parser)
       ↓
5. Compression (Response Compression)
       ↓
6. Request Logging
       ↓
7. Route Matching
       ↓
8. Rate Limiting (per route)
       ↓
9. Auth Middleware (JWT Verification)
       ↓
10. Role Middleware (Access Control)
       ↓
11. Upload Middleware (File Handling - optional)
       ↓
12. Controller (Business Logic)
       ↓
13. Error Middleware (Error Handling)
       ↓
14. Response
```

### Database Schema

15+ collections with embedded documents:

| Category | Collections |
|----------|-------------|
| **Users & Auth** | User |
| **Health Records** | Consultation, LabReport, DoctorReport, Measurement, Prescription, Diary, Appointment |
| **Family** | Family |
| **Reference Data** | Medicine, LabTest, Article |
| **Doctor Portal** | DoctorVerification, MeetingRequest |
| **User Content** | SavedPost |

### Mongoose Schema Examples

```javascript
// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number },
  type: { 
    type: String, 
    enum: ['user', 'doctor', 'admin'], 
    default: 'user' 
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  profile: {
    gender: String,
    height: Number,
    weight: Number,
    bloodGroup: String,
    chronicConditions: [String],
    allergies: [String]
  },
  sosContacts: [{
    name: String,
    phone: String,
    email: String,
    relationship: String
  }],
  emergencySettings: {
    enableAutoAlert: { type: Boolean, default: false },
    criticalThresholds: {
      systolicBP: Number,
      diastolicBP: Number,
      glucose: Number,
      heartRate: Number
    }
  }
}, { timestamps: true });
```

```javascript
// Consultation Schema
const ConsultationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: { type: String, required: true },
  aiSummary: { type: String },
  urgency: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  actions: [String],
  lifestyleAdvice: [String],
  suggestedMedicines: [String],
  tokenUsage: {
    promptTokens: Number,
    completionTokens: Number,
    totalTokens: Number
  },
  reviewStatus: {
    type: String,
    enum: ['none', 'pending', 'reviewed'],
    default: 'none'
  },
  doctorReview: {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    feedback: String,
    recommendations: [String],
    reviewedAt: Date
  }
}, { timestamps: true });
```

### Mongoose ODM Usage

```javascript
// Database connection
// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

```javascript
// Example controller usage
// controllers/consultationController.js
const Consultation = require('../models/Consultation');

exports.getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ user: req.user.id })
      .populate('user', 'name email')
      .populate('doctorReview.doctorId', 'name')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## Frontend Architecture

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 16.1.1 | React framework with App Router |
| UI Library | React | 18.3.1 | Component-based UI |
| Language | TypeScript | 5.x | Type safety |
| State Management | Redux Toolkit | 2.11.2 | Global state |
| Styling | Tailwind CSS | 4.0 | Utility-first CSS |
| HTTP Client | Axios | 1.13.2 | API calls |
| Charts | Recharts | 3.6.0 | Data visualization |
| Forms | React Hook Form | 7.54.2 | Form handling |
| Notifications | React Hot Toast | 2.6.2 | Toast messages |
| Icons | Lucide React | 0.468.0 | Icon library |

### Directory Structure

```
client/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Landing page
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── verify-otp/
│   │   │       └── page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Main dashboard
│   │   │
│   │   ├── consultation/
│   │   │   ├── page.tsx         # AI consultation
│   │   │   └── [id]/
│   │   │       └── page.tsx     # View consultation
│   │   │
│   │   ├── scan/
│   │   │   └── page.tsx         # Prescription scanner
│   │   │
│   │   ├── lab-reports/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── doctor-reports/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── measurements/
│   │   │   └── page.tsx
│   │   │
│   │   ├── diary/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── family/
│   │   │   └── page.tsx
│   │   │
│   │   ├── appointments/
│   │   │   └── page.tsx
│   │   │
│   │   ├── medicine-search/
│   │   │   └── page.tsx
│   │   │
│   │   ├── news/
│   │   │   └── page.tsx
│   │   │
│   │   ├── doctor/              # Doctor portal
│   │   │   ├── verification/
│   │   │   ├── consultations/
│   │   │   └── meetings/
│   │   │
│   │   └── admin/               # Admin portal
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── verifications/
│   │       ├── medicines/
│   │       └── analytics/
│   │
│   ├── components/
│   │   ├── ui/                  # UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── dashboard/           # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   └── HealthSummary.tsx
│   │   │
│   │   ├── consultation/
│   │   │   ├── SymptomForm.tsx
│   │   │   ├── ConsultationResult.tsx
│   │   │   └── UrgencyBadge.tsx
│   │   │
│   │   ├── measurements/
│   │   │   ├── VitalChart.tsx
│   │   │   ├── MeasurementForm.tsx
│   │   │   └── VitalCard.tsx
│   │   │
│   │   ├── family/
│   │   │   ├── FamilyTree.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   └── AddMemberModal.tsx
│   │   │
│   │   └── shared/              # Shared components
│   │       ├── ProtectedRoute.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── FileUpload.tsx
│   │
│   ├── store/                   # Redux store
│   │   ├── index.ts             # Store configuration
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── consultationSlice.ts
│   │       ├── measurementSlice.ts
│   │       ├── labReportSlice.ts
│   │       ├── familySlice.ts
│   │       └── uiSlice.ts
│   │
│   ├── context/
│   │   └── AuthContext.tsx      # Auth context provider
│   │
│   ├── utils/
│   │   ├── api.ts               # Axios configuration
│   │   ├── constants.ts         # App constants
│   │   ├── helpers.ts           # Helper functions
│   │   └── validators.ts        # Form validators
│   │
│   └── types/
│       ├── user.ts
│       ├── consultation.ts
│       ├── measurement.ts
│       └── index.ts
│
├── public/                      # Static assets
│   ├── images/
│   └── icons/
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### State Management

**Redux Toolkit Pattern:**

```typescript
// store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'doctor' | 'admin';
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

### API Client Configuration

```typescript
// utils/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Route Protection

```typescript
// components/shared/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'doctor' | 'admin')[];
}

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.type)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.type)) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
}
```

---

## Authentication & Authorization Flow

### Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │ Nodemailer│         │ MongoDB  │
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ POST /auth/signup  │                    │                    │
     │ {name, email, pwd} │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │ Check if email exists                   │
     │                    │───────────────────────────────────────▶│
     │                    │                    │                    │
     │                    │◀───────────────────────────────────────│
     │                    │                    │                    │
     │                    │ Hash password      │                    │
     │                    │ (bcrypt)           │                    │
     │                    │                    │                    │
     │                    │ Generate OTP       │                    │
     │                    │ (6-digit, 10 min)  │                    │
     │                    │                    │                    │
     │                    │ Save user          │                    │
     │                    │───────────────────────────────────────▶│
     │                    │                    │                    │
     │                    │ Send OTP email     │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │◀───────────────────│                    │                    │
     │ {userId, message}  │                    │                    │
     │                    │                    │                    │
     │ POST /auth/verify-otp                   │                    │
     │ {userId, otp}      │                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │ Verify OTP         │                    │
     │                    │───────────────────────────────────────▶│
     │                    │                    │                    │
     │                    │◀───────────────────────────────────────│
     │                    │                    │                    │
     │                    │ jwt.sign()         │                    │
     │                    │ (generate token)   │                    │
     │                    │                    │                    │
     │◀───────────────────│                    │                    │
     │ {token, user}      │                    │                    │
     │                    │                    │                    │
     │ Store token in     │                    │                    │
     │ localStorage       │                    │                    │
     │                    │                    │                    │
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": "user_mongodb_id",
    "type": "user",
    "iat": 1704067200,
    "exp": 1704153600
  },
  "signature": "..."
}
```

### Token Expiration

| Setting | Value |
|---------|-------|
| Default Expiry | 24 hours |
| OTP Expiry | 10 minutes |
| Refresh Strategy | Re-login required |
| Storage | localStorage (client) |

### Authorization Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Auth MW │         │  Route   │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │ Request + Token    │                    │
     │───────────────────▶│                    │
     │                    │                    │
     │                    │ 1. Extract token   │
     │                    │ 2. Verify JWT      │
     │                    │ 3. Decode payload  │
     │                    │ 4. Attach to req.user
     │                    │                    │
     │                    │───────────────────▶│
     │                    │ req.user available │
     │                    │                    │
     │                    │                    │ Check user.type
     │                    │                    │ against allowed
     │                    │                    │
     │                    │                    │ If allowed:
     │                    │                    │   → Proceed
     │                    │                    │ If denied:
     │                    │                    │   → 403 Forbidden
```

### Middleware Implementation

```javascript
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Role-based middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.type)) {
      return res.status(403).json({ 
        message: `User role ${req.user.type} is not authorized` 
      });
    }

    next();
  };
};
```

### Route Protection Example

```javascript
// routes/ai.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const aiController = require('../controllers/aiController');

// Protected routes - any authenticated user
router.post('/analyze', protect, aiController.analyzeSymptoms);
router.post('/analyze-prescription', protect, aiController.analyzePrescription);

// Admin only
router.get('/admin/ai-stats', 
  protect, 
  authorize('admin'), 
  adminAIController.getAIStats
);

// Doctor only
router.get('/doctor/consultations/pending',
  protect,
  authorize('doctor'),
  doctorController.getPendingConsultations
);

module.exports = router;
```

---

## Storage Strategy

### Database Storage (MongoDB)

**What's Stored:**
- User accounts and authentication data
- Health consultations (symptoms, AI analysis)
- Lab reports metadata and parsed results
- Doctor reports (visit records, prescriptions)
- Vital sign measurements
- Health diary entries
- Appointments
- Family group data
- Medicine and lab test reference data
- Health news articles
- Doctor verification requests
- Meeting requests
- Saved posts

**Why MongoDB:**
- Flexible schema for varied health data structures
- JSON-like documents match application data
- Embedded documents for nested data (user profile, sosContacts)
- Horizontal scalability for growing user base
- Rich query capabilities with aggregation pipeline
- Atlas managed service with built-in backup

### File Storage (Cloudinary)

**What's Stored:**
- Lab report files (PDF, JPEG, PNG)
- Prescription images
- Doctor report documents
- Profile pictures
- Evidence photos for consultations
- ID documents for doctor verification

**Why Cloudinary:**
- CDN for fast global content delivery
- Automatic image optimization and format conversion
- Secure signed URLs for private files
- PDF to image conversion support
- Transformation capabilities (resize, crop, quality)
- No server disk space management
- Built-in backup and redundancy

### File Upload Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │  Multer  │         │Cloudinary│
└────┬─────┘         └────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │                    │
     │ POST /upload/image │                    │                    │
     │ multipart/form-data│                    │                    │
     │───────────────────▶│                    │                    │
     │                    │                    │                    │
     │                    │ Parse multipart    │                    │
     │                    │───────────────────▶│                    │
     │                    │                    │                    │
     │                    │◀───────────────────│                    │
     │                    │ File buffer        │                    │
     │                    │                    │                    │
     │                    │ Validate:          │                    │
     │                    │ - File type        │                    │
     │                    │ - File size (10MB) │                    │
     │                    │                    │                    │
     │                    │ cloudinary.uploader.upload()            │
     │                    │───────────────────────────────────────▶│
     │                    │                    │                    │
     │                    │◀───────────────────────────────────────│
     │                    │ { secure_url, public_id }              │
     │                    │                    │                    │
     │                    │ Save to MongoDB:   │                    │
     │                    │ - URL              │                    │
     │                    │ - public_id        │                    │
     │                    │ - file type        │                    │
     │                    │                    │                    │
     │◀───────────────────│                    │                    │
     │ { success, url }   │                    │                    │
     │                    │                    │                    │
```

### Storage Configuration

```javascript
// config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

### File Upload Middleware

```javascript
// middleware/uploadMiddleware.js
const multer = require('multer');

// Memory storage (buffer)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed.'), false);
  }
};

// Multer config
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
```

### File Categories and Folders

| Category | Cloudinary Folder | Max Size | Allowed Types |
|----------|-------------------|----------|---------------|
| Lab Reports | `lifedoc/lab-reports/` | 10MB | PDF, JPG, PNG |
| Prescriptions | `lifedoc/prescriptions/` | 10MB | JPG, PNG |
| Doctor Reports | `lifedoc/doctor-reports/` | 10MB | PDF, JPG, PNG |
| Profile Pictures | `lifedoc/profiles/` | 5MB | JPG, PNG |
| Verification Docs | `lifedoc/verifications/` | 10MB | PDF |

---

## AI Module Architecture

### AI Services Integration

LifeDoc integrates two primary AI services:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LIFEDOC APPLICATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  Express Backend  │  MongoDB  │  Cloudinary  │  Email  │  SMS               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
         ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
         │  GOOGLE GEMINI   │ │  OPENAI      │ │  OPENFDA API │
         │  1.5 Flash       │ │  GPT-4 Vision│ │  Medicine DB │
         │  - Symptom AI    │ │  - OCR       │ │  - Drug Info │
         │  - Diary AI      │ │  - Lab Parse │ │              │
         └──────────────────┘ └──────────────┘ └──────────────┘
```

### AI Pipeline Architecture

#### 1. Symptom Analysis Pipeline

```
User Input (Text)
      │
      ▼
┌─────────────────┐
│  Input          │
│  Validation     │
│  - Length check │
│  - Sanitization │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Context        │
│  Loading        │
│  - User profile │
│  - Chronic cond │
│  - Medications  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Prompt         │
│  Engineering    │
│  - System prompt│
│  - User context │
│  - Symptoms     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Gemini AI Call │
│  - Temperature  │
│  - Max tokens   │
│  - Safety       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Response       │
│  Processing     │
│  - Parse JSON   │
│  - Urgency calc │
│  - Actions list │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Token Tracking │
│  - Count tokens │
│  - Calculate $  │
└────────┬────────┘
         │
         ▼
    Save to DB
```

#### 2. Prescription OCR Pipeline

```
Image Upload
      │
      ▼
┌─────────────────┐
│  Cloudinary     │
│  Upload         │
│  - Get URL      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Image          │
│  Validation     │
│  - Format check │
│  - Size check   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI Vision  │
│  API Call       │
│  - GPT-4V       │
│  - Extract text │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data           │
│  Structuring    │
│  - Parse meds   │
│  - Dosage       │
│  - Frequency    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Validation     │
│  - Medicine DB  │
│  - OpenFDA      │
└────────┬────────┘
         │
         ▼
    Save to DB
```

#### 3. Lab Report Analysis Pipeline

```
PDF/Image Upload
      │
      ▼
┌─────────────────┐
│  Cloudinary     │
│  Upload         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  File Type      │
│  Detection      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│PDF     │ │Image       │
│Parse   │ │OCR         │
│pdf-parse│ │OpenAI      │
└────┬───┘ └────┬───────┘
     │          │
     └────┬─────┘
          ▼
┌─────────────────┐
│  AI Parsing     │
│  - Test names   │
│  - Values       │
│  - Ranges       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Abnormality    │
│  Detection      │
│  - Compare range│
│  - Flag issues  │
└────────┬────────┘
         │
         ▼
    Save to DB
```

### AI Service Implementation

```javascript
// services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Symptom analysis with Gemini
exports.analyzeSymptoms = async (symptoms, userContext) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a medical AI assistant. Analyze the following symptoms:
  
Symptoms: ${symptoms}

User Context:
- Age: ${userContext.age || 'Unknown'}
- Chronic Conditions: ${userContext.chronicConditions?.join(', ') || 'None'}
- Allergies: ${userContext.allergies?.join(', ') || 'None'}

Provide a JSON response with:
{
  "summary": "Brief analysis of symptoms",
  "urgency": "Low|Medium|High",
  "actions": ["Action 1", "Action 2"],
  "lifestyleAdvice": ["Advice 1", "Advice 2"],
  "suggestedMedicines": ["Medicine 1", "Medicine 2"]
}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  const aiResponse = JSON.parse(jsonMatch[0]);

  return {
    ...aiResponse,
    tokenUsage: {
      promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
      completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: result.response.usageMetadata?.totalTokenCount || 0,
    }
  };
};

// Prescription OCR with OpenAI Vision
exports.analyzePrescription = async (imageUrl) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Extract all medicine information from this prescription image. 
            Return a JSON with: 
            {
              "medicines": [
                {
                  "name": "Medicine name",
                  "dosage": "Dosage",
                  "frequency": "Frequency",
                  "duration": "Duration",
                  "instructions": "Special instructions"
                }
              ],
              "doctorName": "Doctor name",
              "prescriptionDate": "Date"
            }`
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    max_tokens: 1000
  });

  const content = response.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
};

// Lab report parsing
exports.analyzeLabReport = async (fileUrl, fileType) => {
  // Extract text based on file type
  let extractedText;
  if (fileType === 'pdf') {
    // Use pdf-parse
    const pdfData = await pdfParse(fileBuffer);
    extractedText = pdfData.text;
  } else {
    // Use OpenAI Vision for images
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all text from this lab report image.' },
            { type: 'image_url', image_url: { url: fileUrl } }
          ]
        }
      ]
    });
    extractedText = response.choices[0].message.content;
  }

  // Parse structured data with AI
  const parseResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'user',
        content: `Parse this lab report and extract test results in JSON format:
        
${extractedText}

Return JSON:
{
  "tests": [
    {
      "testName": "Test name",
      "value": numeric_value,
      "unit": "Unit",
      "referenceRange": "Range",
      "status": "normal|low|high"
    }
  ]
}`
      }
    ]
  });

  const content = parseResponse.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
};
```

### AI Cost Management

**Token Tracking:**
```javascript
// Track token usage in consultation model
const consultation = await Consultation.create({
  user: userId,
  symptoms,
  aiSummary: response.summary,
  urgency: response.urgency,
  tokenUsage: {
    promptTokens: response.tokenUsage.promptTokens,
    completionTokens: response.tokenUsage.completionTokens,
    totalTokens: response.tokenUsage.totalTokens
  }
});
```

**Cost Calculation:**
```javascript
// Admin dashboard - calculate AI costs
const totalTokens = await Consultation.aggregate([
  { $group: { _id: null, total: { $sum: '$tokenUsage.totalTokens' } } }
]);

const estimatedCost = (totalTokens[0].total / 1000) * 0.01; // $0.01 per 1K tokens
```

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPER MACHINE                         │
├───────────────┬───────────────┬───────────────┬─────────────┤
│ Next.js Dev   │ Express Dev   │ MongoDB Local │ Cloudinary  │
│ :3000         │ :5000         │ :27017        │ (Cloud)     │
│ (Fast Refresh)│ (nodemon)     │ OR Atlas      │             │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

### Production Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE / CDN                                │
│                         (Static Assets, DDoS Protection)                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
         ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
         │  Frontend        │ │  Backend     │ │  File Storage    │
         │  (Vercel)        │ │  (Railway)   │ │  (Cloudinary)    │
         │  Next.js Static  │ │  Express API │ │  Global CDN      │
         └──────────────────┘ └──────┬───────┘ └──────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
         ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
         │  Database    │ │  Google      │ │  OpenAI      │
         │  MongoDB     │ │  Gemini AI   │ │  API         │
         │  Atlas       │ │  API         │ │              │
         └──────────────┘ └──────────────┘ └──────────────┘
                    │                ▲                ▲
                    └────────────────┼────────────────┘
                                     │
                           ┌─────────┴─────────┐
                           ▼                   ▼
                    ┌──────────────┐ ┌──────────────┐
                    │  Nodemailer  │ │  Twilio SMS  │
                    │  SMTP        │ │  API         │
                    └──────────────┘ └──────────────┘
```

### Deployment Platforms

| Component | Platform | Reason |
|-----------|----------|--------|
| **Frontend** | Vercel | Optimized for Next.js, automatic deployments, edge functions |
| **Backend** | Railway / Render | Easy Node.js hosting, environment variables, logs |
| **Database** | MongoDB Atlas | Managed MongoDB, automated backups, global clusters |
| **File Storage** | Cloudinary | CDN, transformations, automatic optimization |
| **Email** | SendGrid / SMTP | Reliable email delivery, high sending limits |
| **SMS** | Twilio | Global SMS delivery, emergency alerts |

### Environment Variables

```bash
# Backend (.env)
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRE=24h

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Services
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# SMS
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number

# External APIs
OPENFDA_API_URL=https://api.fda.gov/drug
NEWS_API_KEY=your-news-api-key

# Frontend URL
CLIENT_URL=https://lifedoc.vercel.app
```

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.lifedoc.app/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

---

## Security Architecture

### Security Layers

| Layer | Implementation | Details |
|-------|----------------|---------|
| **Transport** | HTTPS/TLS | SSL certificates from Let's Encrypt / Cloudflare |
| **Headers** | Helmet.js | Content Security Policy, X-Frame-Options, XSS Protection |
| **Authentication** | JWT | HS256 algorithm, 24-hour expiry |
| **Authorization** | Role-based | User type enum: user, doctor, admin |
| **Input Validation** | Manual validation | Sanitize inputs, prevent injection |
| **Password** | bcrypt | Salt rounds: 10, one-way hashing |
| **MongoDB** | Mongoose | Parameterized queries prevent NoSQL injection |
| **XSS** | React escaping | Auto-escape in JSX, sanitize user-generated content |
| **CORS** | cors middleware | Whitelist client origin |
| **Rate Limiting** | express-rate-limit | 100 req/15min default, 20 req/15min for AI |
| **File Upload** | Multer + validation | Type and size validation |
| **CSRF** | SameSite cookies | (Optional for cookie-based auth) |

### Security Headers (Helmet)

```javascript
// server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
      connectSrc: ["'self'", process.env.CLIENT_URL],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
```

### Rate Limiting

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Default rate limiter
exports.defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

// AI endpoint rate limiter
exports.aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many AI requests, please try again later.',
});

// Auth rate limiter (stricter)
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
});
```

### Data Sanitization

```javascript
// Example: Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

// Usage in controller
exports.createDiary = async (req, res) => {
  const { content } = req.body;
  const sanitizedContent = sanitizeInput(content);
  
  // ... save to database
};
```

### HIPAA Compliance Considerations

| Requirement | Implementation |
|-------------|----------------|
| **Data Encryption** | TLS in transit, consider encryption at rest |
| **Access Controls** | JWT auth, role-based authorization |
| **Audit Logging** | Log all access to PHI (user actions, timestamps) |
| **Data Backup** | MongoDB Atlas automated backups |
| **Data Retention** | Lab reports: 7 years, consultations: 5 years |
| **User Rights** | Export data feature, account deletion |
| **Business Associate Agreements** | Required for Cloudinary, Twilio, email providers |

---

## Performance Optimization

### Backend Optimization

| Technique | Implementation |
|-----------|----------------|
| **Database Indexing** | Index on userId, email, createdAt |
| **Pagination** | Limit queries to 20-50 results |
| **Caching** | Consider Redis for frequent queries |
| **Compression** | Gzip response compression |
| **Connection Pooling** | Mongoose connection pool |
| **Async Operations** | Use async/await, Promise.all |

### Frontend Optimization

| Technique | Implementation |
|-----------|----------------|
| **Code Splitting** | Next.js automatic code splitting |
| **Image Optimization** | Next.js Image component, Cloudinary CDN |
| **Lazy Loading** | React.lazy, dynamic imports |
| **Caching** | SWR or React Query for data fetching |
| **Bundle Size** | Tree shaking, minimize dependencies |

---

## Monitoring & Logging

### Logging Strategy

```javascript
// Simple console logging (upgrade to Winston/Pino for production)
const log = {
  info: (message, meta) => console.log(`[INFO] ${message}`, meta),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message, meta) => console.warn(`[WARN] ${message}`, meta),
};

// Usage
log.info('User logged in', { userId: user.id, email: user.email });
log.error('AI API call failed', error);
```

### Monitoring Tools (Recommended)

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking, crash reporting |
| **LogRocket** | Frontend session replay, error tracking |
| **Datadog / New Relic** | APM, performance monitoring |
| **MongoDB Atlas Monitoring** | Database performance, alerts |
| **Vercel Analytics** | Frontend performance metrics |

---

## Conclusion

This architecture provides:

1. **Scalability** - Stateless API, cloud storage, managed database
2. **Security** - JWT auth, role-based access, input validation, rate limiting
3. **Maintainability** - Clear separation of concerns, consistent patterns
4. **Performance** - CDN, compression, indexing, pagination
5. **AI Integration** - Google Gemini for health analysis, OpenAI Vision for OCR
6. **Healthcare Focus** - HIPAA-ready design, audit logging, data retention policies
7. **Developer Experience** - TypeScript, hot reload, modern frameworks
8. **Production Ready** - Error handling, monitoring, logging, deployment guides

### Technology Highlights

- **Frontend**: Next.js 16 + React 18 + TypeScript + Redux Toolkit
- **Backend**: Express.js + MongoDB + Mongoose
- **AI**: Google Gemini AI + OpenAI Vision API
- **Storage**: Cloudinary CDN
- **Communication**: Nodemailer (email) + Twilio (SMS)
- **Deployment**: Vercel (frontend) + Railway (backend) + MongoDB Atlas

---

**Document Version:** 1.0  
**Last Updated:** January 11, 2026  
**Author:** LifeDoc Development Team  
**Status:** ✅ Production Ready
