import { create } from 'zustand';

export interface UserProfile {
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
  setAuth: (user: UserProfile, token: string) => void;
  updatePaymentMethod: (provider: 'wave' | 'orange_money', phone: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    phoneNumber: '+221771234567',
    fullName: 'Fatou Sow',
    isVerified: true,
    defaultPaymentProvider: 'wave',
    paymentPhoneNumber: '+221771234567',
  },
  token: 'mock_jwt_token_2026',
  isAuthenticated: true,

  setAuth: (user: UserProfile, token: string) =>
    set({ user, token, isAuthenticated: true }),

  updatePaymentMethod: (provider: 'wave' | 'orange_money', phone: string) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, defaultPaymentProvider: provider, paymentPhoneNumber: phone }
        : null,
    })),

  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
