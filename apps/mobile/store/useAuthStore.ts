import { create } from 'zustand';

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
  setAuth: (user: UserProfile, token: string) => void;
  updatePaymentMethod: (provider: 'wave' | 'orange_money', phone: string) => void;
  updateProfileName: (fullName: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user: UserProfile, token: string) =>
    set({ user, token, isAuthenticated: true }),

  updatePaymentMethod: (provider: 'wave' | 'orange_money', phone: string) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, defaultPaymentProvider: provider, paymentPhoneNumber: phone }
        : null,
    })),

  updateProfileName: (fullName: string) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, fullName }
        : null,
    })),

  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
