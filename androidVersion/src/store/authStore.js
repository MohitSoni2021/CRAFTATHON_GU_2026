import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMeService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAuthToken: async (token) => {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (e) {
      console.error('Error saving token', e);
    }
  },

  hydrate: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const userData = await getMeService();
        set({ user: userData, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false, isAuthenticated: false, user: null });
      }
    } catch (e) {
      // If token invalid, clear it
      await AsyncStorage.removeItem('token');
      set({ isAuthenticated: false, user: null, isLoading: false, error: e.message });
    }
  },

  login: (userData, token) => {
    AsyncStorage.setItem('token', token);
    set({ user: userData, isAuthenticated: true, error: null });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  setError: (msg) => set({ error: msg }),
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
