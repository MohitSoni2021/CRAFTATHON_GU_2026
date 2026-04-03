export enum UserRole       { PATIENT = 'patient', CAREGIVER = 'caregiver', DOCTOR = 'doctor' }
export enum DoseStatus     { TAKEN = 'taken', MISSED = 'missed', DELAYED = 'delayed', PENDING = 'pending' }
export enum FrequencyType  { DAILY = 'daily', WEEKLY = 'weekly', MONTHLY = 'monthly', CUSTOM = 'custom' }
export enum RiskLevel      { LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
export enum NotifType      { REMINDER = 'reminder', MISSED_DOSE = 'missed_dose', CAREGIVER_ALERT = 'caregiver_alert' }

export const UserRoleValues = Object.values(UserRole);
export const DoseStatusValues = Object.values(DoseStatus);
export const FrequencyTypeValues = Object.values(FrequencyType);
export const RiskLevelValues = Object.values(RiskLevel);
export const NotifTypeValues = Object.values(NotifType);
