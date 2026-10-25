import { create } from 'zustand';
import { Platform } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth as webAuth } from '../config/firebase';
import { secureStorage } from './secureStorage';
import { queryClient } from '../api/queryClient';
import { useNotificationStore } from './useNotificationStore';

export interface UserProfile {
  uid?: string;
  id?: string;
  phoneNumber: string;
  fullName?: string;
  isVerified: boolean;
  defaultPaymentProvider?: 'wave' | 'orange_money';
  paymentPhoneNumber?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoaded: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  updatePaymentMethod: (provider: 'wave' | 'orange_money', phone: string) => void;
  updateProfileName: (fullName: string) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoaded: false,

  initAuth: async () => {
    try {
      const storedUserJson = await secureStorage.getItem('auth_user');
      const storedToken = await secureStorage.getItem('auth_token');
      if (storedUserJson) {
        const user = JSON.parse(storedUserJson);
        set({ user, token: storedToken, isAuthenticated: true, isLoaded: true });
        return;
      }
    } catch (e) {
      console.warn('Erreur chargement session sécurisée:', e);
    }
    set({ isLoaded: true });
  },

  setAuth: (user: UserProfile, token: string) => {
    try {
      secureStorage.setItem('auth_user', JSON.stringify(user));
      secureStorage.setItem('auth_token', token);
    } catch (e) {}
    set({ user, token, isAuthenticated: true });
  },

  updatePaymentMethod: (provider: 'wave' | 'orange_money', phone: string) =>
    set((state) => {
      const updatedUser = state.user
        ? { ...state.user, defaultPaymentProvider: provider, paymentPhoneNumber: phone }
        : null;
      if (updatedUser) {
        secureStorage.setItem('auth_user', JSON.stringify(updatedUser)).catch(() => {});
      }
      return { user: updatedUser };
    }),

  updateProfileName: (fullName: string) =>
    set((state) => {
      const updatedUser = state.user
        ? { ...state.user, fullName }
        : null;
      if (updatedUser) {
        secureStorage.setItem('auth_user', JSON.stringify(updatedUser)).catch(() => {});
      }
      return { user: updatedUser };
    }),

  logout: () => {
    try {
      if (webAuth) {
        signOut(webAuth).catch(() => {});
      }
      if (Platform.OS !== 'web') {
        try {
          const rnfbAuth = require('@react-native-firebase/auth').default;
          rnfbAuth().signOut().catch(() => {});
        } catch (e) {}
      }
      secureStorage.removeItem('auth_user').catch(() => {});
      secureStorage.removeItem('auth_token').catch(() => {});

      // Nettoyer les caches locaux et données privées en mémoire
      queryClient.clear();
      try {
        useNotificationStore.getState().clearNotifications();
      } catch (e) {}
    } catch (e) {}
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
