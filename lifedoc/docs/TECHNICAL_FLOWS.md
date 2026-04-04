# Technical Flows & Architecture

## 1. System Architecture (DFD Level 1)

This high-level data flow diagram illustrates how users interact with the Lifedoc ecosystem and how data moves between the Client, Server, Database, and AI Services.

```mermaid
graph TD
    User((User))
    Client[Next.js Client]
    Server[Express Server]
    DB[(MongoDB)]
    
    subgraph External [External AI & Cloud]
        AI_Services[Google Gemini / OpenAI]
        Cloud_Storage[Cloudinary]
    end

    User -->|Interacts| Client
    Client -->|API Requests| Server
    Server -->|Auth & Validation| Server
    Server -->|Read/Write Data| DB
    Server -->|Analyze Symptoms| AI_Services
    Server -->|Upload Images| Cloud_Storage
```

## 2. Authentication Flow

Lifedoc uses a custom OTP-based authentication system to ensure security without requiring complex passwords.

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as MongoDB
    participant E as Email Service

    Note over U, S: Sign Up / Login Process
    U->>C: Enter Email
    C->>S: POST /api/auth/signup (or login)
    S->>S: Generate 6-digit OTP
    S->>DB: Save OTP (expires in 10m)
    S->>E: Send OTP to Email
    E-->>U: Receive OTP
    
    U->>C: Enter OTP
    C->>S: POST /api/auth/verify-otp
    S->>DB: Verify OTP & Expiry
    alt Valid
        S->>S: Generate JWT Token
        S-->>C: Return Token + User Profile
        C->>C: Store Token (LocalStorage/Cookie)
    else Invalid
        S-->>C: Error Message
    end
```

## 3. AI Analysis Flow (Symptom Checker)

The core "AI Doctor" feature processes user symptoms using Google Gemini.

```mermaid
sequenceDiagram
    participant P as Patient
    participant API as API Route (/api/ai/analyze)
    participant GEM as Google Gemini API
    participant DB as MongoDB

    P->>API: Submit Symptoms ("I have a headache...")
    API->>API: Validate Request & Auth
    API->>GEM: Prompt: "Act as doctor, analyze: {symptoms}"
    GEM-->>API: JSON Response {urgency, actions, summary}
    
    API->>DB: Save Consultation Record (for history)
    API-->>P: Display Structured Advice
```

## 4. Family Health Guardian Flow

This advanced flow allows a guardian to monitor manageable family members.

```mermaid
graph LR
    Admin[Family Admin] -->|Add/Invite| Member[Family Member]
    Admin -->|View Health| Dashboard[Family Dashboard]
    
    subgraph Sources [Health Data Sources]
        Vitals[Measurements]
        LabReports[Lab Results]
        Prescriptions[Meds]
    end
    
    Member --> Vitals
    Member --> LabReports
    Member --> Prescriptions
    
    Vitals & LabReports & Prescriptions --> Aggregator[Data Aggregator]
    Aggregator -->|Inject User Context| Gemini[Gemini 1.5 Flash]
    Gemini -->|Risk Assessment JSON| Dashboard
```

## 5. Prescription Processing Pipeline (Sequence Diagram)

This logic handles the complex task of converting a raw image into a scheduled medicine reminder with audio support.

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Server
    participant Cloudinary
    participant VisionAI as GPT-4o Vision
    participant DB as MongoDB

    User->>App: Captures Photo of Rx
    App->>Server: Upload Image (FormData)
    Server->>Cloudinary: Store Image
    Cloudinary-->>Server: Return Public URL
    
    Server->>VisionAI: Prompt: "Extract meds to JSON..." + ImageURL
    VisionAI-->>Server: JSON { meds: [{name, dosage, time}], audio_text }
    
    Server->>DB: Create Prescription Record
    DB-->>Server: Success
    Server-->>App: Return Structured Data
    App->>User: Display List + "Play Audio" Button
```

## 6. Database Schema (ER Diagram)

The underlying data model connecting Users, Families, and Health Records.

```mermaid
erDiagram
    User ||--o{ Consultation : has
    User ||--o{ Prescription : has
    User ||--o{ LabReport : has
    User ||--o{ Appointment : books
    
    Family ||--|{ User : "contains members"
    Family {
        ObjectId adminId
        Array members
    }

    User {
        String name
        String email
        String password_hash
        Object profile
        Boolean isManaged
    }

    Consultation {
        String symptoms
        String aiSummary
        String urgency
        Date createdAt
    }
```

## 7. Emergency SOS Logic (Round 2 Implementation)

The planned flow for the "One-Tap Rescue" feature.

```mermaid
flowchart TD
    Start((SOS Button Pressed)) --> GetLoc[Get GPS Coordinates]
    GetLoc --> API[POST /api/sos/trigger]
    
    API -->|Async| SMS
    API -->|Async| WA
    API -->|Async| DbLog
    
    subgraph Parallel [Notification Channels]
        direction TB
        SMS[Twilio SMS Service]
        WA[WhatsApp Business API]
        DbLog[Log Incident DB]
    end
    
    SMS --> Family[Family Admin 1]
    SMS --> Family2[Family Admin 2]
    WA --> Amb[Ambulance Service]
    
    Family --> Link[Click 'Live Track' Link]
    Link --> Map[Real-time Maps View]
```

## 8. Doctor Access Flow (QR Code Logic)

This flow illustrates how a doctor gains temporary, read-only access to a patient's medical history without needing a permanent account link.

```mermaid
sequenceDiagram
    participant PatientApp
    participant DoctorDevice
    participant Server
    participant DB as MongoDB

    Note over PatientApp, DoctorDevice: Scenario: Emergency Room Visit
    
    PatientApp->>Server: Request Access & Generate QR
    Server->>DB: Create Temp Token (Expires in 30m)
    Server-->>PatientApp: Return Token ID
    PatientApp->>PatientApp: Display QR Code (Token ID)
    
    DoctorDevice->>PatientApp: Scans QR Code
    DoctorDevice->>Server: GET /api/doctor/access/{token}
    Server->>DB: Validate Token & Check Expiry
    
    alt Token Valid
        DB-->>Server: Token Valid (PatientID: 123)
        Server->>DB: Fetch Patient History (Last 3 Months)
        Server-->>DoctorDevice: Return Read-Only Medical Record
    else Token Expired
        Server-->>DoctorDevice: Access Denied (403)
    end
```
