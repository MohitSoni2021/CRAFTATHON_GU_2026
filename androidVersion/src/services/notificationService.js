import api from './api';

export const getNotificationsService = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markReadService = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllReadService = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};
