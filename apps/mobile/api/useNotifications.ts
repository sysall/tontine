import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, NotificationsResponse } from './notificationsApi';
import { useAuthStore } from '../store/useAuthStore';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

/** Notifications list + unread count. Polls every minute while the app is open. */
export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationsApi.list(),
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/** Lightweight selector for bell badges (shares the same cache entry). */
export function useUnreadNotificationsCount(): number {
  const { data } = useNotifications();
  return data?.unreadCount ?? 0;
}

/** Optimistically apply a change to the cached list, rolling back on error. */
function useOptimisticNotificationsMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  updater: (prev: NotificationsResponse, vars: TVars) => NotificationsResponse,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      const previous = queryClient.getQueryData<NotificationsResponse>(NOTIFICATIONS_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, updater(previous, vars));
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(NOTIFICATIONS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}

export function useMarkNotificationAsRead() {
  return useOptimisticNotificationsMutation<string>(
    (id) => notificationsApi.markAsRead(id),
    (prev, id) => {
      const target = prev.notifications.find((n) => n.notificationId === id);
      if (!target || target.read) return prev;
      return {
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
        notifications: prev.notifications.map((n) => (n.notificationId === id ? { ...n, read: true } : n)),
      };
    },
  );
}

export function useMarkAllNotificationsAsRead() {
  return useOptimisticNotificationsMutation<void>(
    () => notificationsApi.markAllAsRead(),
    (prev) => ({
      ...prev,
      unreadCount: 0,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }),
  );
}

export function useClearNotifications() {
  return useOptimisticNotificationsMutation<void>(
    () => notificationsApi.clearAll(),
    (prev) => ({ ...prev, unreadCount: 0, notifications: [] }),
  );
}
