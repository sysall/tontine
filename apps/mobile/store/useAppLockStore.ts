import { create } from 'zustand';

interface AppLockState {
  isLocked: boolean;
  hasCheckedInitialLock: boolean;
  setLocked: (locked: boolean) => void;
  setHasCheckedInitialLock: (checked: boolean) => void;
  unlock: () => void;
}

export const useAppLockStore = create<AppLockState>((set) => ({
  isLocked: false,
  hasCheckedInitialLock: false,
  setLocked: (isLocked) => set({ isLocked }),
  setHasCheckedInitialLock: (hasCheckedInitialLock) => set({ hasCheckedInitialLock }),
  unlock: () => set({ isLocked: false }),
}));
