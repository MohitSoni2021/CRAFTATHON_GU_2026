# Health Management System API - Create Routes Documentation

This document provides comprehensive documentation for all **POST (Create)** endpoints in the Health Management System API. These routes allow users to create new records in the database for health tracking, measurements, diary entries, lab reports, and doctor visits.

---

## Create Routes

### Create User

**Route Path:** `POST /api/auth/register`

**Description:** Creates a new user account with basic profile information and optional health profile details, SOS contacts, and emergency settings.

**Authentication Required:** No

**Request Requirements:**

- **HTTP Method:** POST
- **Headers:**
  ```
  Content-Type: application/json
  ```

- **Body:**
  ```json
  {
    "name": "John Doe",
    "age": 35,
    "email": "john.doe@example.com",
    "password": "SecurePassword123!",
    "profile": {
      "gender": "male",
      "height": 180,
      "weight": 75,
      "bloodGroup": "O+",
      "chronicConditions": ["diabetes", "hypertension"]
    },
    "sosContacts": [
      {
        "name": "Jane Doe",
        "phone": "+1234567890",
        "email": "jane.doe@example.com",
        "relationship": "spouse"
      }
    ],
    "emergencySettings": {
      "enableAutoAlert": true,
      "criticalThresholds": {
        "glucose": {
          "low": 70,
          "high": 180
        },
        "bloodPressure": {
          "systolicHigh": 140,
          "diastolicHigh": 90
        }
      }
    }
  }
  ```

  **Field Requirements:**
  - `name` (required): User's full name
  - `email` (required, unique): User's email address
  - `password` (required): User's password (minimum 8 characters recommended)
  - `age` (optional): User's age
  - `profile` (optional): Nested health profile object
    - `gender` (optional): "male", "female", or "other"
    - `height` (optional): Height in centimeters
    - `weight` (optional): Weight in kilograms
    - `bloodGroup` (optional): Blood group (e.g., "O+", "A-")
    - `chronicConditions` (optional): Array of chronic condition strings
  - `sosContacts` (optional): Array of emergency contact objects
    - `name` (required): Contact person's name
    - `phone` (required): Contact phone number
    - `email` (optional): Contact email
    - `relationship` (optional): Relationship to user
  - `emergencySettings` (optional): Emergency alert configuration
    - `enableAutoAlert` (optional): Boolean flag for auto alerts
    - `criticalThresholds` (optional): Critical health thresholds

**Response Structure:**

- **Success Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "age": 35,
      "email": "john.doe@example.com",
      "type": "user",
      "isVerified": false,
      "profile": {
        "gender": "male",
        "height": 180,
        "weight": 75,
        "bloodGroup": "O+",
        "chronicConditions": ["diabetes", "hypertension"]
      },
      "sosContacts": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jane Doe",
          "phone": "+1234567890",
          "email": "jane.doe@example.com",
          "relationship": "spouse"
        }
      ],
      "emergencySettings": {
        "enableAutoAlert": true,
        "criticalThresholds": {
          "glucose": {
            "low": 70,
            "high": 180
          },
          "bloodPressure": {
            "systolicHigh": 140,
            "diastolicHigh": 90
          }
        }
      },
      "createdAt": "2025-12-26T10:30:00Z",
      "updatedAt": "2025-12-26T10:30:00Z"
    }
  }
  ```

- **Error Responses:**
  
  **400 Bad Request** (Validation Error):
  ```json
  {
    "message": "User validation failed",
    "error": "Email already exists"
  }
  ```

  **400 Bad Request** (Missing Required Fields):
  ```json
  {
    "message": "User validation failed",
    "error": "name is required, email is required, password is required"
  }
  ```

  **500 Internal Server Error:**
  ```json
  {
    "message": "Error creating user",
    "error": "Database connection failed"
  }
  ```

**Additional Notes:**
- Passwords are automatically hashed using bcrypt before storage (10 salt rounds).
- The `type` field defaults to "user" (can be "admin" for administrative accounts).
- The `isVerified` field defaults to false; users must verify their email via OTP.
- All optional fields can be updated later via the user profile update endpoint.
- Email addresses must be unique; duplicate emails will be rejected.

---

### Create Measurement

**Route Path:** `POST /api/measurements`

**Description:** Records health measurements (glucose, blood pressure, weight, heart rate, SpO2, etc.) for the authenticated user on a specific date. Multiple readings can be added for the same date, or new readings can be appended to existing measurements.

**Authentication Required:** Yes (JWT Bearer token)

**Request Requirements:**

- **HTTP Method:** POST
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  ```

- **Body:**
  ```json
  {
    "date": "2025-12-26",
    "readings": [
      {
        "type": "glucose",
        "timestamp": "2025-12-26T08:30:00Z",
        "value": 120,
        "unit": "mg/dL",
        "notes": "fasting"
      },
      {
        "type": "bloodPressure",
        "timestamp": "2025-12-26T09:00:00Z",
        "value": {
          "systolic": 120,
          "diastolic": 80
        },
        "unit": "mmHg",
        "notes": "morning reading"
      },
      {
        "type": "weight",
        "timestamp": "2025-12-26T09:15:00Z",
        "value": 75.5,
        "unit": "kg"
      },
      {
        "type": "heartRate",
        "timestamp": "2025-12-26T09:20:00Z",
        "value": 72,
        "unit": "bpm"
      },
      {
        "type": "spo2",
        "timestamp": "2025-12-26T09:25:00Z",
        "value": 98,
        "unit": "%"
      }
    ]
  }
  ```

  **Field Requirements:**
  - `date` (required): Measurement date (format: "YYYY-MM-DD")
  - `readings` (required): Array of reading objects
    - `type` (required): One of ["glucose", "bloodPressure", "weight", "heartRate", "spo2", "other"]
    - `timestamp` (optional): Reading timestamp; defaults to current time
    - `value` (required): The measurement value; can be a number or object (e.g., for blood pressure)
    - `unit` (optional): Unit of measurement (e.g., "mg/dL", "mmHg", "kg", "bpm", "%")
    - `notes` (optional): Additional notes (e.g., "fasting", "after meal", "stressed")

  **Special Cases:**
  - **Glucose reading:** `value` is a Number (e.g., 120)
  - **Blood Pressure reading:** `value` is an Object with `systolic` and `diastolic` (e.g., `{ "systolic": 120, "diastolic": 80 }`)
  - **Weight reading:** `value` is a Number (e.g., 75.5)
  - **Heart Rate reading:** `value` is a Number (e.g., 72)
  - **SpO2 reading:** `value` is a Number (e.g., 98)

**Response Structure:**

- **Success Response (201 Created):**
  ```json
  {
    "message": "Measurement recorded successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "date": "2025-12-26T00:00:00Z",
      "readings": [
        {
          "_id": "507f1f77bcf86cd799439014",
          "type": "glucose",
          "timestamp": "2025-12-26T08:30:00Z",
          "value": 120,
          "unit": "mg/dL",
          "notes": "fasting"
        },
        {
          "_id": "507f1f77bcf86cd799439015",
          "type": "bloodPressure",
          "timestamp": "2025-12-26T09:00:00Z",
          "value": {
            "systolic": 120,
            "diastolic": 80
          },
          "unit": "mmHg",
          "notes": "morning reading"
        }
      ],
      "createdAt": "2025-12-26T10:30:00Z",
      "updatedAt": "2025-12-26T10:30:00Z"
    }
  }
  ```

- **Error Responses:**

  **400 Bad Request** (Validation Error):
  ```json
  {
    "message": "Error creating measurement",
    "error": "date is required"
  }
  ```

  **401 Unauthorized** (Missing/Invalid Token):
  ```json
  {
    "message": "Unauthorized",
    "error": "No token provided"
  }
  ```

  **404 Not Found** (User Not Found):
  ```json
  {
    "message": "User not found",
    "error": "The authenticated user does not exist"
  }
  ```

  **500 Internal Server Error:**
  ```json
  {
    "message": "Error creating measurement",
    "error": "Database error"
  }
  ```

**Additional Notes:**
- `userId` is automatically extracted from the JWT token and does not need to be provided in the request body.
- If a measurement record already exists for the specified date and user, new readings are appended to the existing record.
- The `timestamp` field for each reading defaults to the current time if not provided.
- Compound index on `userId` and `date` ensures fast queries for user-specific measurements.
- Blood pressure values must be provided as an object with `systolic` and `diastolic` keys.

---

### Create Diary Entry

**Route Path:** `POST /api/diary`

**Description:** Creates a new diary entry with a user-provided text, AI-generated summary, mood classification, and extracted tags for the authenticated user on a specific date.

**Authentication Required:** Yes (JWT Bearer token)

**Request Requirements:**

- **HTTP Method:** POST
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  ```

- **Body:**
  ```json
  {
    "date": "2025-12-26",
    "rawText": "Had a great day today. Exercised for 30 minutes in the morning and felt energetic. Ate healthy meals. Feeling positive about my health journey.",
    "summary": "User had an active day with exercise and healthy eating, reporting positive mood and energy levels.",
    "mood": "happy",
    "tags": ["exercise", "diet", "positive"]
  }
  ```

  **Field Requirements:**
  - `date` (required): Diary entry date (format: "YYYY-MM-DD")
  - `rawText` (optional): Original user input or journal text
  - `summary` (required): AI-generated or manual summary of the entry
  - `mood` (optional): One of ["happy", "neutral", "stressed", "sad", "anxious", "energetic"]
  - `tags` (optional): Array of tags extracted by AI (e.g., ["exercise", "diet", "sleep", "work"])

**Response Structure:**

- **Success Response (201 Created):**
  ```json
  {
    "message": "Diary entry created successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439016",
      "userId": "507f1f77bcf86cd799439011",
      "date": "2025-12-26T00:00:00Z",
      "rawText": "Had a great day today. Exercised for 30 minutes in the morning and felt energetic. Ate healthy meals. Feeling positive about my health journey.",
      "summary": "User had an active day with exercise and healthy eating, reporting positive mood and energy levels.",
      "mood": "happy",
      "tags": ["exercise", "diet", "positive"],
      "createdAt": "2025-12-26T10:30:00Z",
      "updatedAt": "2025-12-26T10:30:00Z"
    }
  }
  ```

- **Error Responses:**

  **400 Bad Request** (Missing Summary):
  ```json
  {
    "message": "Error creating diary entry",
    "error": "summary is required"
  }
  ```

  **401 Unauthorized** (Missing/Invalid Token):
  ```json
  {
    "message": "Unauthorized",
    "error": "Invalid token"
  }
  ```

  **404 Not Found** (User Not Found):
  ```json
  {
    "message": "User not found",
    "error": "The authenticated user does not exist"
  }
  ```

  **500 Internal Server Error:**
  ```json
  {
    "message": "Error creating diary entry",
    "error": "Database error"
  }
  ```

**Additional Notes:**
- `userId` is automatically extracted from the JWT token and does not need to be provided in the request body.
- The `summary` field is required and should contain a concise overview of the diary entry.
- The `rawText` field can store the original user input before any AI processing.
- Mood values are restricted to the enum: "happy", "neutral", "stressed", "sad", "anxious", "energetic".
- Tags are typically AI-extracted from the diary text but can be manually provided.
- Compound index on `userId` and `date` enables efficient retrieval of user diary entries.
- Diary entries are useful for tracking psychological and lifestyle factors alongside health metrics.

---

### Create Lab Report

**Route Path:** `POST /api/lab-reports`

**Description:** Creates a new lab report record with test results, parsed data, optional file upload, and notes for the authenticated user.

**Authentication Required:** Yes (JWT Bearer token)

**Request Requirements:**

- **HTTP Method:** POST
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  ```

- **Body:**
  ```json
  {
    "reportDate": "2025-12-20",
    "testType": "HbA1c",
    "parsedResults": {
      "HbA1c": "6.8%",
      "eAG": "150 mg/dL",
      "status": "prediabetic"
    },
    "fileUrl": "https://s3.amazonaws.com/lab-reports/user-123/HbA1c_2025-12-20.pdf",
    "notes": "Results indicate prediabetic state. Recommend dietary changes and exercise."
  }
  ```

  **Alternative Example with Different Test Type:**
  ```json
  {
    "reportDate": "2025-12-15",
    "testType": "Lipid Profile",
    "parsedResults": {
      "totalCholesterol": "195 mg/dL",
      "LDL": "120 mg/dL",
      "HDL": "50 mg/dL",
      "triglycerides": "100 mg/dL",
      "status": "borderline high"
    },
    "fileUrl": "https://s3.amazonaws.com/lab-reports/user-123/Lipid_Profile_2025-12-15.pdf",
    "notes": "LDL is elevated. Consider statin therapy consultation."
  }
  ```

  **Field Requirements:**
  - `reportDate` (required): Date of the lab report (format: "YYYY-MM-DD")
  - `testType` (required): Type of test (e.g., "HbA1c", "Lipid Profile", "CBC", "TSH")
  - `parsedResults` (optional): Mixed/dynamic object containing extracted test results as key-value pairs
  - `fileUrl` (optional): URL to the PDF or image file stored in cloud storage (S3, GridFS, etc.)
  - `notes` (optional): Clinical notes or observations regarding the results

**Response Structure:**

- **Success Response (201 Created):**
  ```json
  {
    "message": "Lab report created successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439017",
      "userId": "507f1f77bcf86cd799439011",
      "reportDate": "2025-12-20T00:00:00Z",
      "testType": "HbA1c",
      "parsedResults": {
        "HbA1c": "6.8%",
        "eAG": "150 mg/dL",
        "status": "prediabetic"
      },
      "fileUrl": "https://s3.amazonaws.com/lab-reports/user-123/HbA1c_2025-12-20.pdf",
      "notes": "Results indicate prediabetic state. Recommend dietary changes and exercise.",
      "createdAt": "2025-12-26T10:30:00Z",
      "updatedAt": "2025-12-26T10:30:00Z"
    }
  }
  ```

- **Error Responses:**

  **400 Bad Request** (Missing Required Fields):
  ```json
  {
    "message": "Error creating lab report",
    "error": "reportDate is required, testType is required"
  }
  ```

  **401 Unauthorized** (Invalid Token):
  ```json
  {
    "message": "Unauthorized",
    "error": "Token expired"
  }
  ```

  **404 Not Found** (User Not Found):
  ```json
  {
    "message": "User not found",
    "error": "The authenticated user does not exist"
  }
  ```

  **500 Internal Server Error:**
  ```json
  {
    "message": "Error creating lab report",
    "error": "Failed to store file"
  }
  ```

**Additional Notes:**
- `userId` is automatically extracted from the JWT token.
- The `parsedResults` field is flexible (Mixed type) to accommodate various test types and their specific results.
- File uploads can be handled in two ways:
  1. **Pre-upload**: Generate the `fileUrl` via a separate file upload endpoint (using multer or AWS S3) and pass it in the create request.
  2. **Integrated upload**: Modify the route to accept multipart/form-data and handle file upload with multer, storing the URL before saving the document.
- The `fileUrl` field should contain a publicly accessible or authenticated URL to the stored file.
- Compound index on `userId` and `reportDate` enables fast retrieval of user lab history.
- Lab reports are critical for longitudinal health tracking and can be compared over time.

---

### Create Doctor Report

**Route Path:** `POST /api/doctor-reports`

**Description:** Creates a new doctor visit record with diagnoses, prescribed medications, clinical notes, optional file upload, and follow-up appointment date for the authenticated user.

**Authentication Required:** Yes (JWT Bearer token)

**Request Requirements:**

- **HTTP Method:** POST
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  ```

- **Body:**
  ```json
  {
    "visitDate": "2025-12-24",
    "doctorName": "Dr. Sarah Smith",
    "diagnosis": ["Type 2 Diabetes", "Hypertension"],
    "prescriptions": [
      {
        "medicine": "Metformin",
        "dosage": "500mg",
        "frequency": "twice daily",
        "duration": "30 days"
      },
      {
        "medicine": "Lisinopril",
        "dosage": "10mg",
        "frequency": "once daily",
        "duration": "ongoing"
      }
    ],
    "summary": "Patient presented with elevated blood sugar and blood pressure. Commenced on metformin and lisinopril. Lifestyle modifications advised.",
    "fileUrl": "https://s3.amazonaws.com/doctor-reports/user-123/visit_2025-12-24.pdf",
    "followUpDate": "2026-01-24"
  }
  ```

  **Field Requirements:**
  - `visitDate` (required): Date of the doctor visit (format: "YYYY-MM-DD")
  - `doctorName` (optional): Name of the healthcare provider
  - `diagnosis` (optional): Array of diagnosis strings (e.g., ["Type 2 Diabetes", "Hypertension"])
  - `prescriptions` (optional): Array of prescription objects
    - `medicine` (required): Name of the medication
    - `dosage` (optional): Dosage amount (e.g., "500mg", "10ml")
    - `frequency` (optional): Frequency of administration (e.g., "twice daily", "once daily")
    - `duration` (optional): Duration of treatment (e.g., "30 days", "ongoing")
  - `summary` (optional): Clinical summary or notes from the visit
  - `fileUrl` (optional): URL to the prescription or report file
  - `followUpDate` (optional): Date of the next follow-up appointment (format: "YYYY-MM-DD")

**Response Structure:**

- **Success Response (201 Created):**
  ```json
  {
    "message": "Doctor report created successfully",
    "data": {
      "_id": "507f1f77bcf86cd799439018",
      "userId": "507f1f77bcf86cd799439011",
      "visitDate": "2025-12-24T00:00:00Z",
      "doctorName": "Dr. Sarah Smith",
      "diagnosis": ["Type 2 Diabetes", "Hypertension"],
      "prescriptions": [
        {
          "_id": "507f1f77bcf86cd799439019",
          "medicine": "Metformin",
          "dosage": "500mg",
          "frequency": "twice daily",
          "duration": "30 days"
        },
        {
          "_id": "507f1f77bcf86cd799439020",
          "medicine": "Lisinopril",
          "dosage": "10mg",
          "frequency": "once daily",
          "duration": "ongoing"
        }
      ],
      "summary": "Patient presented with elevated blood sugar and blood pressure. Commenced on metformin and lisinopril. Lifestyle modifications advised.",
      "fileUrl": "https://s3.amazonaws.com/doctor-reports/user-123/visit_2025-12-24.pdf",
      "followUpDate": "2026-01-24T00:00:00Z",
      "createdAt": "2025-12-26T10:30:00Z",
      "updatedAt": "2025-12-26T10:30:00Z"
    }
  }
  ```

- **Error Responses:**

  **400 Bad Request** (Missing Required Fields):
  ```json
  {
    "message": "Error creating doctor report",
    "error": "visitDate is required"
  }
  ```

  **401 Unauthorized** (Invalid Token):
  ```json
  {
    "message": "Unauthorized",
    "error": "Authentication failed"
  }
  ```

  **404 Not Found** (User Not Found):
  ```json
  {
    "message": "User not found",
    "error": "The authenticated user does not exist"
  }
  ```

  **500 Internal Server Error:**
  ```json
  {
    "message": "Error creating doctor report",
    "error": "Database error while saving report"
  }
  ```

**Additional Notes:**
- `userId` is automatically extracted from the JWT token.
- All fields except `visitDate` are optional, allowing flexible data entry depending on the level of detail available.
- The `prescriptions` array contains individual prescription objects, each with required `medicine` field and optional dosage/frequency/duration details.
- The `followUpDate` should be set if the doctor scheduled a follow-up appointment; it can be used to send appointment reminders.
- File uploads can be handled similarly to lab reports:
  1. **Pre-upload**: Generate the `fileUrl` via a separate file upload endpoint and pass it in the create request.
  2. **Integrated upload**: Modify the route to accept multipart/form-data with multer.
- Compound index on `userId` and `visitDate` ensures efficient retrieval of user visit history.
- Doctor reports provide comprehensive clinical context and can be cross-referenced with measurements and lab results for holistic health tracking.

---

## Common Authentication Details

For all create routes requiring authentication (Measurement, Diary, LabReport, DoctorReport):

- **Token Format:** JWT (JSON Web Token) passed in the `Authorization` header as a Bearer token.
- **Header Example:**
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Token Extraction:** Middleware (e.g., passport-jwt or custom JWT middleware) extracts the token, verifies it, and populates `req.user` with the decoded user information.
- **User ID:** The authenticated user's `_id` is automatically extracted as `req.user.id` or `req.user._id` and used for the `userId` field in the document. No manual `userId` input is required.
- **Error Handling:** If the token is missing, expired, or invalid, the request returns a `401 Unauthorized` response.

---

## File Upload Handling

For routes that accept file uploads (LabReport and DoctorReport):

### Option 1: Pre-Upload Flow
1. User uploads the file to a separate endpoint (e.g., `POST /api/upload`).
2. The server stores the file in cloud storage (AWS S3, Google Cloud Storage, etc.) or uses GridFS.
3. The endpoint returns a `fileUrl` pointing to the stored file.
4. User includes the `fileUrl` in the create request body.

### Option 2: Integrated Upload with Multer
1. Modify the create route to accept `multipart/form-data` instead of JSON.
2. Use multer middleware to handle file uploads in the request.
3. Store the file and generate a `fileUrl` before saving the document.
4. Return the created document with the `fileUrl` in the response.

**Example Multer Middleware (Node.js/Express):**
```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  // File is available as req.file
  const fileUrl = `/uploads/${req.file.filename}`;
  // ... rest of the create logic
});
```

---

## Validation and Error Handling

All create endpoints perform the following validations:

1. **Required Fields:** Missing required fields return a `400 Bad Request` with field-specific error messages.
2. **Data Types:** Invalid data types (e.g., passing a string for a number field) return a `400 Bad Request`.
3. **Enum Validation:** Fields with restricted values (e.g., mood, reading type) are validated against allowed enums.
4. **Unique Constraints:** Fields marked as unique (e.g., user email) return a `400 Bad Request` if a duplicate is detected.
5. **Authentication:** Missing or invalid JWT tokens return a `401 Unauthorized`.
6. **User Existence:** For authenticated routes, the user's existence is verified; a missing user returns `404 Not Found`.
7. **Database Errors:** Unexpected database issues return a `500 Internal Server Error`.

---

## Rate Limiting and Best Practices

- **Rate Limiting:** Consider implementing rate limiting on create endpoints to prevent abuse (e.g., max 100 requests per minute per user).
- **Input Sanitization:** Sanitize text inputs to prevent injection attacks.
- **Pagination:** For read operations retrieving multiple records, implement pagination to handle large datasets efficiently.
- **Logging:** Log all create operations for audit trails and debugging.
- **Timestamps:** All documents include `createdAt` and `updatedAt` timestamps for tracking.
- **Idempotency:** For critical operations, consider implementing idempotent request handling using unique request IDs.

---

## Examples and Use Cases

### Scenario 1: Daily Health Tracking
1. User creates a diary entry describing their day.
2. User creates a measurement record with morning glucose and blood pressure readings.
3. Later, user adds additional evening readings to the same measurement record.

### Scenario 2: Doctor Visit and Lab Results
1. User creates a doctor report after a visit with diagnoses and prescribed medications.
2. One week later, user creates a lab report with HbA1c results from tests ordered during the visit.
3. User references the doctor report's ID in their diary when discussing lab results.

### Scenario 3: Emergency Preparedness
1. During user registration, user sets up SOS contacts and emergency alert thresholds.
2. System creates a diary entry tracking mood and stress levels.
3. If a measurement reading (e.g., glucose) exceeds the critical threshold, the system can trigger alerts to SOS contacts.

---

## Summary Table

| Model | Route | Authentication | Primary Purpose |
|-------|-------|-----------------|-----------------|
| User | `POST /api/auth/register` | No | User account creation |
| Measurement | `POST /api/measurements` | Yes | Health metric recording |
| Diary | `POST /api/diary` | Yes | Mood and lifestyle journaling |
| LabReport | `POST /api/lab-reports` | Yes | Lab test result storage |
| DoctorReport | `POST /api/doctor-reports` | Yes | Clinical visit documentation |

---

## Support and Troubleshooting

For issues or questions:
- Verify that all required headers are included (especially `Authorization` for authenticated routes).
- Ensure request body JSON is properly formatted and valid.
- Check that date fields use the correct format (ISO 8601 or "YYYY-MM-DD").
- Verify that enum values match the allowed options exactly (case-sensitive for some fields).
- Review server logs for detailed error messages if a `500 Internal Server Error` occurs.
