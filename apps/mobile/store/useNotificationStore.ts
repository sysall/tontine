import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType = 'reminder' | 'admin_payout' | 'system' | 'tontine';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  date: string;
  read: boolean;
  metadata?: {
    nattName?: string;
    amountFcfa?: number;
    daysLeft?: number;
    status?: string;
    [key: string]: any;
  };
}

interface NotificationState {
  notifications: NotificationItem[];
  pushToken: string | null;
  fcmToken: string | null;
  isPermissionGranted: boolean;
  setPushToken: (token: string | null) => void;
  setFcmToken: (token: string | null) => void;
  setPermissionGranted: (granted: boolean) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  unreadCount: () => number;
  loadNotificationsFromStorage: () => Promise<void>;
}

const STORAGE_KEY = 'tontine_notifications_history_v1';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const saveToStorage = async (notifications: NotificationItem[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur sauvegarde notifications AsyncStorage:', error);
  }
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  pushToken: null,
  fcmToken: null,
  isPermissionGranted: false,

  setPushToken: (pushToken) => set({ pushToken }),
  setFcmToken: (fcmToken) => set({ fcmToken }),
  setPermissionGranted: (isPermissionGranted) => set({ isPermissionGranted }),

  addNotification: (newNotifData) => {
    const newNotification: NotificationItem = {
      ...newNotifData,
      id: `notif-${Date.now()}`,
      date: 'À l\'instant',
      read: false,
    };
    const updated = [newNotification, ...get().notifications];
    set({ notifications: updated });
    saveToStorage(updated);
  },

  markAsRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updated });
    saveToStorage(updated);
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications: updated });
    saveToStorage(updated);
  },

  clearNotifications: () => {
    set({ notifications: [] });
    saveToStorage([]);
  },

  unreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  loadNotificationsFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ notifications: parsed });
        }
      }
    } catch (e) {
      console.warn('Impossible de charger les notifications enregistrées:', e);
    }
  },
}));
