import api from './api';

export const linkCaregiverService = async (email) => {
  const response = await api.post('/caregiver/link', { email });
  return response.data;
};

export const getPatientsService = async () => {
  const response = await api.get('/caregiver/patients');
  return response.data;
};

export const getPatientAdherenceService = async (id) => {
  const response = await api.get(`/caregiver/patients/${id}/adherence`);
  return response.data;
};

export const unlinkCaregiverService = async (id) => {
  const response = await api.delete(`/caregiver/link/${id}`);
  return response.data;
};
