import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BellIcon } from './Icons';
import { useUnreadNotificationsCount } from '../api/useNotifications';

interface NotificationBellProps {
  color?: string;
  size?: number;
}

/** Header bell with a live unread badge, linking to the notifications screen. */
export default function NotificationBell({ color = '#173F73', size = 22 }: NotificationBellProps) {
  const router = useRouter();
  const unread = useUnreadNotificationsCount();

  return (
    <TouchableOpacity
      onPress={() => router.push('/notifications')}
      activeOpacity={0.7}
      className="w-10 h-10 items-center justify-center relative"
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Notifications, ${unread} non lue(s)` : 'Notifications'}
    >
      <BellIcon size={size} color={color} />
      {unread > 0 && (
        <View className="absolute top-1 right-1 bg-red-500 min-w-[16px] h-[16px] rounded-full items-center justify-center px-1 border border-white">
          <Text className="text-[9px] font-black text-white">{unread > 9 ? '9+' : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
