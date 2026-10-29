import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  BellIcon,
  CalendarIcon,
  ArrowDownLeftIcon,
  CheckIcon,
} from '../components/Icons';
import { useAuthStore } from '../store/useAuthStore';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearNotifications,
} from '../api/useNotifications';
import { AppNotification, NotificationType } from '../api/notificationsApi';

type FilterKey = 'all' | NotificationType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'PAYMENT_OVERDUE', label: 'Retards' },
  { key: 'PAYOUT_RECEIVED', label: 'Versements' },
];

const TYPE_STYLE: Record<NotificationType, { tile: string; accent: string; icon: React.ReactNode }> = {
  PAYMENT_OVERDUE: {
    tile: 'bg-amber-50',
    accent: 'border-l-amber-500',
    icon: <CalendarIcon size={18} color="#D97706" />,
  },
  PAYOUT_RECEIVED: {
    tile: 'bg-emerald-50',
    accent: 'border-l-[#19A66A]',
    icon: <ArrowDownLeftIcon size={18} color="#19A66A" />,
  },
};

const formatFcfa = (amount?: number) => `${Math.round(amount || 0).toLocaleString('fr-FR')} FCFA`;

const pad = (n: number) => n.toString().padStart(2, '0');

function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffMin < 6 * 60) return `Il y a ${Math.floor(diffMin / 60)} h`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const section = sectionFor(iso);
  if (section === "Aujourd'hui") return `Aujourd'hui à ${time}`;
  if (section === 'Hier') return `Hier à ${time}`;
  return `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} à ${time}`;
}

function sectionFor(iso: string): string {
  const date = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dayMs = 24 * 60 * 60 * 1000;
  const t = date.getTime();
  if (t >= startOfToday.getTime()) return "Aujourd'hui";
  if (t >= startOfToday.getTime() - dayMs) return 'Hier';
  if (t >= startOfToday.getTime() - 7 * dayMs) return 'Cette semaine';
  return 'Plus ancien';
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data, isLoading, isError, error, refetch, isRefetching } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const clearAll = useClearNotifications();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  const notifications = data?.notifications ?? [];
  const unreadTotal = data?.unreadCount ?? 0;

  const counts = useMemo(
    () => ({
      all: notifications.length,
      PAYMENT_OVERDUE: notifications.filter((n) => n.type === 'PAYMENT_OVERDUE').length,
      PAYOUT_RECEIVED: notifications.filter((n) => n.type === 'PAYOUT_RECEIVED').length,
    }),
    [notifications],
  );

  const unreadOverdue = useMemo(
    () => notifications.filter((n) => n.type === 'PAYMENT_OVERDUE' && !n.read),
    [notifications],
  );

  const sections = useMemo(() => {
    const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
    const groups: { title: string; items: AppNotification[] }[] = [];
    filtered.forEach((n) => {
      const title = sectionFor(n.createdAt);
      const group = groups.find((g) => g.title === title);
      if (group) group.items.push(n);
      else groups.push({ title, items: [n] });
    });
    return groups;
  }, [notifications, filter]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handlePress = (item: AppNotification) => {
    if (!item.read) markAsRead.mutate(item.notificationId);
  };

  const handlePayNow = (item: AppNotification) => {
    if (!item.read) markAsRead.mutate(item.notificationId);
    router.push(
      item.userNattId
        ? { pathname: '/contribute', params: { nattId: item.userNattId } }
        : '/contribute',
    );
  };

  const confirmClear = () => {
    Alert.alert(
      "Vider l'historique",
      'Toutes vos notifications seront supprimées de cette liste.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', style: 'destructive', onPress: () => clearAll.mutate() },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FBF9F4]" edges={['top']}>
      {/* Header */}
      <View className="px-5 pt-3 pb-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="w-10 h-10 rounded-2xl bg-gray-100 items-center justify-center"
            accessibilityLabel="Retour"
          >
            <Text className="text-xl font-bold text-brand-dark">←</Text>
          </TouchableOpacity>

          <View className="items-center">
            <Text className="text-lg font-black text-brand-dark uppercase tracking-tight">Notifications</Text>
            <Text className="text-[11px] text-gray-400 font-semibold">
              {unreadTotal > 0 ? `${unreadTotal} non lue${unreadTotal > 1 ? 's' : ''}` : 'Tout est à jour'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => markAllAsRead.mutate()}
            disabled={unreadTotal === 0}
            activeOpacity={0.7}
            className={`w-10 h-10 rounded-2xl items-center justify-center ${unreadTotal > 0 ? 'bg-emerald-50' : 'bg-gray-50'}`}
            accessibilityLabel="Tout marquer comme lu"
          >
            <CheckIcon size={18} color={unreadTotal > 0 ? '#19A66A' : '#D1D5DB'} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="flex-row mt-4">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.8}
                className={`mr-2 px-3.5 py-2 rounded-full flex-row items-center border ${
                  active ? 'bg-[#173F73] border-[#173F73]' : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-gray-600'}`}>{f.label}</Text>
                {counts[f.key] > 0 && (
                  <View className={`ml-1.5 px-1.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
                    <Text className={`text-[10px] font-black ${active ? 'text-white' : 'text-gray-500'}`}>
                      {counts[f.key]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#173F73" />}
      >
        {/* Overdue banner */}
        {unreadOverdue.length > 0 && filter !== 'PAYOUT_RECEIVED' && (
          <View className="rounded-2xl p-4 mb-4 bg-amber-50 border border-amber-200 flex-row items-center">
            <View className="w-9 h-9 rounded-xl bg-amber-100 items-center justify-center mr-3">
              <CalendarIcon size={18} color="#B45309" />
            </View>
            <View className="flex-1 pr-2">
              <Text className="text-sm font-black text-amber-900">
                {unreadOverdue.length} cotisation{unreadOverdue.length > 1 ? 's' : ''} en retard
              </Text>
              <Text className="text-[11px] text-amber-800 font-medium mt-0.5">
                Régularisez pour rester éligible au versement.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handlePayNow(unreadOverdue[0])}
              activeOpacity={0.8}
              className="bg-amber-500 px-3 py-2 rounded-xl"
            >
              <Text className="text-xs font-black text-white">Payer</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : isError ? (
          <View className="bg-white rounded-3xl p-8 items-center my-6 border border-red-100">
            <BellIcon size={36} color="#F87171" />
            <Text className="text-sm font-bold text-gray-700 mt-3">Impossible de charger les notifications</Text>
            <Text className="text-xs text-gray-400 text-center mt-1">
              {(error as Error)?.message || 'Vérifiez votre connexion et réessayez.'}
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              activeOpacity={0.8}
              className="mt-4 bg-[#173F73] px-5 py-2.5 rounded-xl"
            >
              <Text className="text-xs font-black text-white">Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : sections.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center my-6 border border-gray-100">
            <View className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center">
              <BellIcon size={30} color="#9CA3AF" />
            </View>
            <Text className="text-sm font-bold text-gray-600 mt-4">
              {filter === 'PAYMENT_OVERDUE'
                ? 'Aucun retard de cotisation'
                : filter === 'PAYOUT_RECEIVED'
                  ? 'Aucun versement pour le moment'
                  : 'Aucune notification'}
            </Text>
            <Text className="text-xs text-gray-400 text-center mt-1 leading-relaxed">
              Vous serez prévenu ici en cas de retard de cotisation{'\n'}et lorsque l'administrateur vous fait un versement.
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.title} className="mb-2">
              <Text className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                {section.title}
              </Text>
              {section.items.map((item) => (
                <NotificationCard
                  key={item.notificationId}
                  item={item}
                  onPress={() => handlePress(item)}
                  onPayNow={() => handlePayNow(item)}
                />
              ))}
            </View>
          ))
        )}

        {!isLoading && notifications.length > 0 && (
          <View className="mt-4 items-center">
            <TouchableOpacity onPress={confirmClear} activeOpacity={0.6} disabled={clearAll.isPending}>
              <Text className="text-[11px] font-medium text-red-400 underline">Vider l'historique</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationCard({
  item,
  onPress,
  onPayNow,
}: {
  item: AppNotification;
  onPress: () => void;
  onPayNow: () => void;
}) {
  const style = TYPE_STYLE[item.type] ?? TYPE_STYLE.PAYMENT_OVERDUE;
  const isOverdue = item.type === 'PAYMENT_OVERDUE';
  const amount = item.metadata?.amountFcfa;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`rounded-2xl p-4 mb-3 border border-l-4 ${
        item.read ? 'bg-white/70 border-gray-100 border-l-gray-200' : `bg-white border-gray-100 ${style.accent}`
      }`}
    >
      <View className="flex-row items-start">
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${style.tile}`}>{style.icon}</View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-0.5">
            <Text
              className={`text-sm flex-1 pr-2 ${item.read ? 'font-bold text-gray-600' : 'font-black text-brand-dark'}`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.read && <View className="w-2 h-2 rounded-full bg-red-500" />}
          </View>

          <Text className={`text-xs leading-relaxed ${item.read ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
            {item.body}
          </Text>

          <View className="flex-row items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
            <Text className="text-[10px] font-semibold text-gray-400">{formatRelative(item.createdAt)}</Text>

            {isOverdue ? (
              <TouchableOpacity onPress={onPayNow} activeOpacity={0.7} className="flex-row items-center">
                {amount ? (
                  <Text className="text-[11px] font-black text-amber-600 mr-2">{formatFcfa(amount)}</Text>
                ) : null}
                <Text className="text-xs font-black text-[#173F73]">Payer maintenant →</Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-emerald-50 px-2 py-1 rounded-lg">
                <Text className="text-[11px] font-black text-emerald-600">+{formatFcfa(amount)}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }} className="rounded-2xl p-4 mb-3 bg-white border border-gray-100 flex-row">
      <View className="w-10 h-10 rounded-xl bg-gray-100 mr-3" />
      <View className="flex-1">
        <View className="h-3.5 w-2/3 rounded bg-gray-100 mb-2" />
        <View className="h-3 w-full rounded bg-gray-100 mb-1.5" />
        <View className="h-3 w-4/5 rounded bg-gray-100" />
      </View>
    </Animated.View>
  );
}
