import { apiFetch } from './apiClient';

export type NotificationType = 'PAYMENT_OVERDUE' | 'PAYOUT_RECEIVED';

export interface AppNotification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  readAt?: string | null;
  userNattId?: string | null;
  metadata?: {
    nattTitle?: string;
    amountFcfa?: number;
    dueDate?: string;
    daysOverdue?: number;
    reminderIndex?: number;
    provider?: string;
    reference?: string;
    transactionId?: string;
  };
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: AppNotification[];
  unreadCount: number;
}

export const notificationsApi = {
  list: (limit = 50) => apiFetch<NotificationsResponse>(`/notifications?limit=${limit}`),

  markAsRead: (notificationId: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${encodeURIComponent(notificationId)}/read`, {
      method: 'POST',
    }),

  markAllAsRead: () => apiFetch<{ success: boolean; updated: number }>('/notifications/read-all', { method: 'POST' }),

  clearAll: () => apiFetch<{ success: boolean; cleared: number }>('/notifications', { method: 'DELETE' }),
};
