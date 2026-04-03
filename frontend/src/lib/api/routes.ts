import api from './axios';
import { LoginInput } from '@hackgu/shared';

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
