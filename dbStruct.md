# Database Structure (dbStruct)

This project uses MongoDB with Mongoose models in `backend/src/modules/*/*.model.ts`.

## Core Collections

### Users (`User`)
- Fields
  - `name` (string, required)
  - `email` (string, required, unique)
  - `password` (string, optional)
  - `role` (string enum: PATIENT/CAREGIVER/DOCTOR, defaults PATIENT)
  - `phone` (string, optional)
  - `timezone` (string, default `Asia/Kolkata`)
  - `adherenceScore` (number, optional)
  - `createdAt` (date, default now)

### Medications (`Medication`)
- Fields
  - `userId` (ObjectId -> User, required, indexed)
  - `name` (string, required)
  - `dosage` (string, required)
  - `unit` (string, required)
  - `frequency` (string enum: schedule type, required)
  - `scheduleTimes` (array of strings, required)
  - `startDate` (date, required)
  - `endDate` (date, optional)
  - `isActive` (boolean, default true, indexed)
  - `notes` (string, optional)
  - `createdAt` (date, default now)

### Dose Logs (`DoseLog`)
- Fields
  - `userId` (ObjectId -> User, required)
  - `medicationId` (ObjectId -> Medication, required, indexed)
  - `scheduledAt` (date, required)
  - `takenAt` (date, optional)
  - `status` (string enum: PENDING/TAKEN/MISSED etc, required, default PENDING)
  - `notes` (string, optional)
  - `delayMinutes` (number, optional)
  - `createdAt` (date, default now)
- Indexes
  - Compound: `{ userId: 1, scheduledAt: 1 }`

### Caregiver Links (`CaregiverLink`)
- Fields
  - `patientId` (ObjectId -> User, required, indexed)
  - `caregiverId` (ObjectId -> User, optional, indexed)
  - `caregiverEmail` (string, required)
  - `relationship` (string, required)
  - `status` (string enum: PENDING/ACCEPTED/REJECTED, default PENDING)
  - `permissions` (array of strings, default `["VIEW_ADHERENCE", "RECEIVE_ALERTS"]`)
  - `invitedAt` (date, default now)
  - `respondedAt` (date, optional)
- Indexes
  - Unique compound: `{ patientId: 1, caregiverEmail: 1 }`

### Notifications (`Notification`)
- Fields
  - `userId` (ObjectId -> User, required)
  - `type` (string enum: NotifType, required)
  - `medicationId` (ObjectId -> Medication, optional)
  - `message` (string, required)
  - `isRead` (boolean, default false)
  - `scheduledAt` (date, required, indexed)
  - `sentAt` (date, optional)
  - `createdAt` (date, default now)
- Indexes
  - `{ userId: 1, isRead: 1 }`

### Push Subscription (`PushSubscription`)
- Fields
  - `userId` (ObjectId -> User, required, unique)
  - `endpoint` (string, required)
  - `keys.p256dh` (string, required)
  - `keys.auth` (string, required)
  - `createdAt`, `updatedAt` (timestamps)

### Reminder Log (`ReminderLog`)
- Fields
  - `userId` (ObjectId -> User, required)
  - `medicationId` (ObjectId -> Medication, required)
  - `scheduledTime` (string, required; e.g., `"HH:MM"`)
  - `dateKey` (string, required; e.g., `"YYYY-MM-DD"`)
  - `sentAt` (date, default now)
- Indexes
  - Unique compound: `{ userId: 1, medicationId: 1, scheduledTime: 1, dateKey: 1 }`

## Enums in Shared Types
- `UserRole`: from `@hackgu/shared` (PATIENT, CAREGIVER, DOCTOR)
- `FrequencyType`: from shared (DAILY, WEEKLY, etc)
- `DoseStatus`: from shared (PENDING, TAKEN, MISSED)
- `NotifType`: from shared (REMINDER, ALERT etc)

## Notes
- Logical relations are represented by ObjectId references.
- Most timestamp fields are date objects with defaults accustomed to `Date.now()`.
- This file is a single source for understanding DB shape and indexes for query optimization.