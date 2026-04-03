import api from './axios';
import { 
  LoginInput, 
  CreateMedicationInput, 
  UpdateMedicationInput, 
  MedicationResponse 
} from '@hackgu/shared';

export const loginUser = async (data: LoginInput) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const registerUser = async (data: any) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const googleLogin = async (credential: string) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

export const createMedication = async (data: CreateMedicationInput) => {
  const response = await api.post('/medications', data);
  return response.data;
};

export const listMedications = async () => {
  const response = await api.get('/medications');
  return response.data;
};

export const getMedicationById = async (id: string) => {
  const response = await api.get(`/medications/${id}`);
  return response.data;
};

export const updateMedication = async (id: string, data: UpdateMedicationInput) => {
  const response = await api.put(`/medications/${id}`, data);
  return response.data;
};

export const deactivateMedication = async (id: string) => {
  const response = await api.delete(`/medications/${id}`);
  return response.data;
};

export const getAdherenceScore = async () => {
  const response = await api.get('/adherence/score');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (data: any) => {
  const response = await api.patch('/auth/me', data);
  return response.data;
};

export const getRiskLevel = async () => {
  const response = await api.get('/adherence/risk');
  return response.data;
};

export const getDailyAdherence = async () => {
  const response = await api.get('/adherence/daily');
  return response.data;
};

export const getWeeklyTrend = async () => {
  const response = await api.get('/adherence/weekly');
  return response.data;
};

export const getAdherencePatterns = async () => {
  const response = await api.get('/adherence/patterns');
  return response.data;
};

export const inviteCaregiver = async (data: { caregiverEmail: string, relationship: string }) => {
  const response = await api.post('/caregiver/invite', data);
  return response.data;
};

export const respondCaregiverInvite = async (data: { inviteId: string, status: 'ACCEPTED' | 'REJECTED' }) => {
  const response = await api.post('/caregiver/respond', data);
  return response.data;
};

export const getCaregiverInvites = async () => {
  const response = await api.get('/caregiver/invites');
  return response.data;
};

export const getMyPatientsList = async () => {
  const response = await api.get('/caregiver/patients');
  return response.data;
};

export const getPatientAdherenceCaregiver = async (patientId: string) => {
  const response = await api.get(`/caregiver/patients/${patientId}/adherence`);
  return response.data;
};

export const unlinkCaregiver = async (linkId: string) => {
  const response = await api.delete(`/caregiver/link/${linkId}`);
  return response.data;
};

export const getMyCaregivers = async () => {
  const response = await api.get('/caregiver/my-caregivers');
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationRead = async (id: string) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

export const getTodayDoses = async () => {
  const response = await api.get('/dose-logs/today');
  return response.data;
};

/**
 * Mark a dose as taken by POSTing to /dose-logs (upsert).
 * This is the primary way to record a taken dose from the schedule.
 */
export const markDoseAsTaken = async (data: {
  medicationId: string;
  scheduledAt: string;
  takenAt?: string;
  status?: string;
  notes?: string;
}) => {
  const response = await api.post('/dose-logs', {
    ...data,
    takenAt: data.takenAt ?? new Date().toISOString(),
    status: data.status ?? 'taken',
  });
  return response.data;
};

export const logDoseManual = async (data: any) => {
  const response = await api.post('/dose-logs', data);
  return response.data;
};

export const listDoseLogs = async (params: any = {}) => {
  const response = await api.get('/dose-logs', { params });
  return response.data;
};

// Patient API Endpoints
export const getPatientDoctors = async () => {
  const response = await api.get('/patient/doctors');
  return response.data;
};

// Doctor API Endpoints
export const linkDoctorPatient = async (data: { patientEmail: string, specialization?: string }) => {
  const response = await api.post('/doctor/add-patient', data);
  return response.data;
};

export const getDoctorPatients = async () => {
  const response = await api.get('/doctor/patients');
  return response.data;
};

export const togglePatientFlag = async (linkId: string) => {
  const response = await api.put(`/doctor/flag/${linkId}`);
  return response.data;
};

export const downloadAdherencePDF = async (patientId: string) => {
  const response = await api.get(`/doctor/adherence-pdf/${patientId}`, {
    responseType: 'blob', // Important for file downloads
  });
  return response;
};

// Push Notification API
export const subscribePush = async (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) => {
  const response = await api.post('/push/subscribe', subscription);
  return response.data;
};

export const unsubscribePush = async () => {
  const response = await api.post('/push/unsubscribe');
  return response.data;
};

export const sendTestPush = async () => {
  const response = await api.post('/push/test');
  return response.data;
};

export const getPushStatus = async () => {
  const response = await api.get('/push/status');
  return response.data;
};

