/**
 * Role enumeration for users in the platform.
 */
export enum Role {
  PATIENT = "PATIENT",
  CAREGIVER = "CAREGIVER",
  DOCTOR = "DOCTOR",
}

/**
 * Status of a specific dose log.
 */
export enum DoseStatus {
  TAKEN = "TAKEN",
  MISSED = "MISSED",
  DELAYED = "DELAYED",
}

/**
 * Type of frequency for medication schedules.
 */
export enum FrequencyType {
  DAILY = "DAILY",
  CUSTOM = "CUSTOM",
}

/**
 * Type of reminder to be sent.
 */
export enum ReminderType {
  BEFORE = "BEFORE",
  MISSED = "MISSED",
}
