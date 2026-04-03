1: export enum UserRole       { PATIENT = 'patient', CAREGIVER = 'caregiver', DOCTOR = 'doctor' }
2: export enum DoseStatus     { TAKEN = 'taken', MISSED = 'missed', DELAYED = 'delayed', PENDING = 'pending' }
3: export enum FrequencyType  { DAILY = 'daily', WEEKLY = 'weekly', MONTHLY = 'monthly', CUSTOM = 'custom' }
4: export enum RiskLevel      { LOW = 'low', MEDIUM = 'medium', HIGH = 'high' }
5: export enum NotifType      { REMINDER = 'reminder', MISSED_DOSE = 'missed_dose', CAREGIVER_ALERT = 'caregiver_alert' }
6: export enum CaregiverLinkStatus { PENDING = 'pending', ACCEPTED = 'accepted', REJECTED = 'rejected' }
7: export enum CaregiverPermission { VIEW_ADHERENCE = 'VIEW_ADHERENCE', RECEIVE_ALERTS = 'RECEIVE_ALERTS' }
8: 
9: export const UserRoleValues = Object.values(UserRole);
10: export const DoseStatusValues = Object.values(DoseStatus);
11: export const FrequencyTypeValues = Object.values(FrequencyType);
12: export const RiskLevelValues = Object.values(RiskLevel);
13: export const NotifTypeValues = Object.values(NotifType);
14: export const CaregiverLinkStatusValues = Object.values(CaregiverLinkStatus);
15: export const CaregiverPermissionValues = Object.values(CaregiverPermission);
