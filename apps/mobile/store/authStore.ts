import { create } from 'zustand';
import { UserDocument } from '@tontine/types';

interface AuthState {
  user: UserDocument | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDocument, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
