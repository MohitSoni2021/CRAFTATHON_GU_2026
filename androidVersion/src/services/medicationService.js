import api from './api';

export const getTodayDosesService = async () => {
  const response = await api.get('/dose-logs/today');
  return response.data;
};

export const markDoseAsTakenService = async (data) => {
  const response = await api.post('/dose-logs', {
    ...data,
    takenAt: data.takenAt ?? new Date().toISOString(),
    status: data.status ?? 'taken',
  });
  return response.data;
};

export const listMedicationsService = async () => {
  const response = await api.get('/medications');
  return response.data;
};

export const createMedicationService = async (data) => {
  const response = await api.post('/medications', data);
  return response.data;
};
