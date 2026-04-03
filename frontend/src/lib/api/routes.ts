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
