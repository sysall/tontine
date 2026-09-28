import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BellIcon,
  ShieldCheckIcon,
  CalendarIcon,
  TontineIcon,
} from '../components/Icons';
import { useNotificationStore, NotificationType } from '../store/useNotificationStore';
import { registerForPushNotificationsAsync } from '../services/notificationService';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    markAsRead,
    clearNotifications,
    unreadCount,
    loadNotificationsFromStorage,
  } = useNotificationStore();

  useEffect(() => {
    loadNotificationsFromStorage();
    registerForPushNotificationsAsync();
  }, []);

  const unreadTotal = unreadCount();

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'reminder':
        return <CalendarIcon size={18} color="#D97706" />;
      case 'admin_payout':
        return <ShieldCheckIcon size={18} color="#16A34A" />;
      case 'tontine':
        return <TontineIcon size={18} color="#173F73" />;
      default:
        return <BellIcon size={18} color="#173F73" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F4]">
      {/* Top Header */}
      <View className="px-5 pt-3 pb-4 bg-white border-b border-gray-100 flex-row items-center justify-between shadow-xs">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-2xl bg-gray-100 items-center justify-center"
        >
          <Text className="text-xl font-bold text-brand-dark">←</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-lg font-black text-brand-dark uppercase tracking-tight">
            Notifications
          </Text>
          <Text className="text-[11px] text-gray-400 font-semibold">
            {unreadTotal > 0 ? `${unreadTotal} non lue(s)` : 'Toutes lues'}
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-4 pb-8" showsVerticalScrollIndicator={false}>
        {/* Notification List */}
        {notifications.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center justify-center my-6 border border-gray-100">
            <BellIcon size={36} color="#9CA3AF" />
            <Text className="text-sm font-bold text-gray-500 mt-3">Aucune notification</Text>
            <Text className="text-xs text-gray-400 text-center mt-1">
              Vos rappels et validations apparaîtront ici.
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => markAsRead(item.id)}
              activeOpacity={0.85}
              className={`rounded-2xl p-4 mb-3 border ${!item.read
                ? 'bg-white border-[#19A66A]/40 shadow-xs'
                : 'bg-white/80 border-gray-100'
                }`}
            >
              <View className="flex-row items-start space-x-3">
                <View className={`w-9 h-9 rounded-xl items-center justify-center ${item.type === 'reminder'
                  ? 'bg-amber-50'
                  : item.type === 'admin_payout'
                    ? 'bg-emerald-50'
                    : 'bg-slate-100'
                  }`}>
                  {getNotificationIcon(item.type)}
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text className="text-sm font-black text-brand-dark flex-1 pr-2">
                      {item.title}
                    </Text>
                    {!item.read && (
                      <View className="w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </View>

                  <Text className="text-xs text-gray-600 font-medium leading-relaxed">
                    {item.body}
                  </Text>

                  <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                    <Text className="text-[10px] font-semibold text-gray-400">
                      {item.date}
                    </Text>

                    {item.type === 'reminder' && (
                      <TouchableOpacity
                        onPress={() => router.push('/contribute')}
                        activeOpacity={0.7}
                      >
                        <Text className="text-xs font-black text-[#173F73]">
                          Payer maintenant →
                        </Text>
                      </TouchableOpacity>
                    )}

                    {item.type === 'admin_payout' && (
                      <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                        Validé 100% Admin
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {notifications.length > 0 && (
          <View className="mt-4 mb-8 flex-row items-center justify-center">
            <TouchableOpacity
              onPress={clearNotifications}
              activeOpacity={0.6}
            >
              <Text className="text-[11px] font-medium text-red-400 underline">
                Vider l'historique
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
