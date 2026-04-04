import api from './api';

export const loginService = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const signupService = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const googleLoginService = async (credential) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

export const getMeService = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const updateProfileService = async (data) => {
  const response = await api.patch('/auth/me', data);
  return response.data;
};
