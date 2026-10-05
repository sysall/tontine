import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { TontineIcon, BellIcon, CalendarIcon } from '../components/Icons';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useDashboardSummary } from '../api/useTontine';
import { ActiveTontineItem } from '../api/tontineApi';

type StatusFilterType = 'active' | 'completed';

export interface ExtendedTontineItem extends ActiveTontineItem {
  statusCategory: 'active' | 'completed';
  startDateInfo?: string;
  payoutDateInfo?: string;
}

export default function MyTontinesScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const unreadNotifsCount = useNotificationStore((state) => state.unreadCount());

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  const userPhoneOrId = user?.uid || user?.id || user?.phoneNumber || user?.paymentPhoneNumber;
  const { data: dashboardData, isLoading, refetch } = useDashboardSummary(userPhoneOrId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('active');
  const [selectedDetailsTontine, setSelectedDetailsTontine] = useState<ExtendedTontineItem | null>(null);

  const apiTontines: ActiveTontineItem[] = dashboardData?.tontines || [];

  const allTontines: ExtendedTontineItem[] = apiTontines.map((item) => {
    let statusCategory: 'active' | 'completed' = 'active';
    if (item.status === 'COMPLETED') {
      statusCategory = 'completed';
    }

    return {
      ...item,
      statusCategory,
      startDateInfo: item.nextTurnDate ? `Prochain versement: ${item.nextTurnDate}` : 'Lancement du cycle à venir',
      payoutDateInfo: item.status === 'COMPLETED' ? 'Gain total perçu avec succès ✓' : undefined,
    };
  });

  const filteredTontines = allTontines.filter(
    (item) => item.statusCategory === statusFilter
  );

  const activeCount = allTontines.filter((t) => t.statusCategory === 'active').length;
  const completedCount = allTontines.filter((t) => t.statusCategory === 'completed').length;

  const getInstallmentsSchedule = (tontine: ExtendedTontineItem) => {
    const totalTours = tontine.totalTours || 10;
    const currentTurn = tontine.statusCategory === 'completed' ? totalTours : (tontine.currentTurn || 1);
    const catLower = (tontine.category || '').toLowerCase();
    const isDaily = catLower.includes('jour') || catLower.includes('daily');
    const isWeekly = catLower.includes('hebdo') || catLower.includes('weekly');

    let baseDate = new Date();
    if (tontine.nextTurnDate) {
      const parsed = new Date(tontine.nextTurnDate);
      if (!isNaN(parsed.getTime())) baseDate = parsed;
    }

    const monthsFr = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const list = [];
    for (let i = 1; i <= totalTours; i++) {
      const isPaid = i <= currentTurn;
      const diff = i - currentTurn;
      const itemDate = new Date(baseDate);

      if (isDaily) {
        itemDate.setDate(itemDate.getDate() + diff);
      } else if (isWeekly) {
        itemDate.setDate(itemDate.getDate() + (diff * 7));
      } else {
        itemDate.setMonth(itemDate.getMonth() + diff);
      }

      const formattedDate = `${itemDate.getDate()} ${monthsFr[itemDate.getMonth()]} ${itemDate.getFullYear()}`;

      list.push({
        turnNumber: i,
        formattedDate,
        isPaid,
        amount: tontine.amountPerCycle,
      });
    }

    return list;
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-beige">
      {/* Header with Back Navigation */}
      <View className="px-5 pt-3 pb-4 bg-white border-b border-gray-100 flex-row items-center justify-between shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-2xl bg-gray-100 items-center justify-center"
        >
          <Text className="text-xl font-bold text-brand-dark">←</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-lg font-black text-brand-dark uppercase tracking-tight">
            Mes Tontines
          </Text>
          <Text className="text-[11px] text-gray-500 font-semibold">
            {allTontines.length} souscription(s) au total
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
          className="w-10 h-10 items-center justify-center relative"
        >
          <BellIcon size={22} color="#173F73" />
          {unreadNotifsCount > 0 && (
            <View className="absolute top-1 right-1 bg-red-500 min-w-[16px] h-[16px] rounded-full items-center justify-center px-1">
              <Text className="text-[9px] font-black text-white">{unreadNotifsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-5 pt-4 pb-8" showsVerticalScrollIndicator={false}>
        {/* ==================== 2 STATUS FILTER TABS ==================== */}
        <View className="flex-row space-x-2 mb-5">
          {/* Tab 1: Actif (Selected by default) */}
          <TouchableOpacity
            onPress={() => setStatusFilter('active')}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 px-1 rounded-2xl border items-center ${statusFilter === 'active'
              ? 'bg-[#173F73] border-[#173F73] shadow-sm'
              : 'bg-white border-gray-200'
              }`}
          >
            <Text
              className={`text-xs font-black ${statusFilter === 'active' ? 'text-[#19A66A]' : 'text-gray-600'
                }`}
            >
              Actif ({activeCount})
            </Text>
          </TouchableOpacity>

          {/* Tab 2: Terminé */}
          <TouchableOpacity
            onPress={() => setStatusFilter('completed')}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 px-1 rounded-2xl border items-center ${statusFilter === 'completed'
              ? 'bg-[#173F73] border-[#173F73] shadow-sm'
              : 'bg-white border-gray-200'
              }`}
          >
            <Text
              className={`text-xs font-black ${statusFilter === 'completed' ? 'text-[#19A66A]' : 'text-gray-600'
                }`}
            >
              Terminé ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==================== TONTINE LIST BY FILTER ==================== */}
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#19A66A" />
            <Text className="text-xs font-semibold text-gray-500 mt-3">
              Chargement de vos tontines en cours...
            </Text>
          </View>
        ) : filteredTontines.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-gray-100 mt-4 shadow-sm">
            <View className="w-16 h-16 rounded-full bg-[#D4F2E4] items-center justify-center mb-4 border border-[#19A66A]">
              <TontineIcon size={32} color="#173F73" focused />
            </View>
            <Text className="text-lg font-black text-brand-dark text-center mb-2">
              {statusFilter === 'active'
                ? 'Aucune tontine active'
                : 'Aucune tontine terminée'}
            </Text>
            <Text className="text-xs text-gray-500 text-center leading-relaxed mb-6">
              {statusFilter === 'active'
                ? 'Vous n\'avez pas de cercle d\'épargne actif pour le moment. Découvrez nos formules pour commencer !'
                : 'Vos tontines terminées apparaîtront ici avec le récapitulatif des gains perçus.'}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/contribute')}
              activeOpacity={0.85}
              className="w-full bg-brand-dark active:bg-brand-darkCard py-4 rounded-2xl items-center shadow-md shadow-black/20 border border-brand-primary/30"
            >
              <Text className="text-sm font-black text-brand-primary uppercase tracking-wider">
                EFFECTUER UNE COTISATION
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTontines.map((tontine: ExtendedTontineItem) => (
            <View
              key={tontine.id}
              className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100"
            >
              {/* Header Tontine */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-extrabold text-brand-dark">
                    {tontine.name}
                  </Text>
                  <Text className="text-xs text-gray-500 font-semibold mt-0.5">
                    {tontine.category} • {tontine.amountPerCycle.toLocaleString('fr-FR')} FCFA / tour
                  </Text>
                </View>

                {/* Status Badge */}
                {tontine.statusCategory === 'active' && (
                  <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
                    <Text className="text-[10px] font-extrabold text-emerald-800 uppercase">
                      Actif
                    </Text>
                  </View>
                )}
                {tontine.statusCategory === 'completed' && (
                  <View className="px-3 py-1 bg-cyan-50 rounded-full border border-cyan-200">
                    <Text className="text-[10px] font-extrabold text-cyan-800 uppercase">
                      Terminé ✓
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress Bar or Info Banner */}
              {tontine.statusCategory === 'active' && (
                <View className="my-3 bg-slate-50 p-3.5 rounded-2xl border border-gray-100">
                  <View className="flex-row justify-between text-xs mb-1.5">
                    <Text className="text-[11px] text-gray-500 font-semibold">
                      Progression du cycle
                    </Text>
                    <Text className="text-[11px] font-black text-brand-dark">
                      Tour {tontine.currentTurn} sur {tontine.totalTours}
                    </Text>
                  </View>
                  <View className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      style={{ width: `${(tontine.currentTurn / tontine.totalTours) * 100}%` }}
                      className="h-full bg-brand-primary rounded-full"
                    />
                  </View>
                </View>
              )}

              {tontine.statusCategory === 'completed' && (
                <View className="my-3 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200">
                  <Text className="text-xs font-bold text-emerald-900 mb-0.5">
                    Cercle clôturé avec succès 🎉
                  </Text>
                  <Text className="text-[11px] text-emerald-800 font-medium">
                    {tontine.payoutDateInfo || 'Tous les versements ont été effectués.'}
                  </Text>
                </View>
              )}

              {/* Details Footer */}
              <View className="pt-3 border-t border-gray-100 flex-row justify-between items-center">
                <View>
                  <Text className="text-[10px] text-gray-400 font-semibold uppercase">
                    {tontine.statusCategory === 'completed' ? 'Gain total perçu' : 'Mon total cotisé'}
                  </Text>
                  <Text className="text-sm font-black text-brand-dark">
                    {tontine.myContributionFcfa.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedDetailsTontine(tontine)}
                  activeOpacity={0.8}
                  className="px-4 py-2.5 bg-[#173F73] active:bg-[#1A4A82] rounded-2xl border border-[#19A66A]/30 flex-row items-center space-x-1.5 shadow-sm"
                >
                  <CalendarIcon size={14} color="#19A66A" />
                  <Text className="text-xs font-black text-[#19A66A] uppercase tracking-wider">
                    Détails
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL DETAILS ÉCHÉANCIER */}
      <Modal visible={Boolean(selectedDetailsTontine)} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/65">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[85%] shadow-2xl">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <View className="flex-1 pr-2">
                <Text className="text-lg font-black text-brand-dark uppercase tracking-tight">
                  Échéancier des Versements
                </Text>
                <Text className="text-xs text-gray-500 font-semibold mt-0.5">
                  {selectedDetailsTontine?.name} ({selectedDetailsTontine?.category})
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedDetailsTontine(null)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-sm font-bold text-gray-500">✕</Text>
              </TouchableOpacity>
            </View>

            {selectedDetailsTontine && (
              <View className="flex-1">
                {/* Stats Summary Bar */}
                <View className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-gray-200 mb-4 flex-row justify-between items-center">
                  <View>
                    <Text className="text-[10px] text-gray-400 font-extrabold uppercase">Montant par Tour</Text>
                    <Text className="text-sm font-black text-[#173F73]">
                      {selectedDetailsTontine.amountPerCycle.toLocaleString('fr-FR')} FCFA
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] text-gray-400 font-extrabold uppercase">Cotisé / Objectif</Text>
                    <Text className="text-sm font-black text-[#19A66A]">
                      {selectedDetailsTontine.myContributionFcfa.toLocaleString('fr-FR')} FCFA
                    </Text>
                  </View>
                </View>

                {/* Timeline Header */}
                <View className="flex-row justify-between items-center mb-2 px-1">
                  <Text className="text-xs font-black text-gray-400 uppercase tracking-wider">
                    Liste des Tours & Échéances
                  </Text>
                  <Text className="text-xs font-bold text-emerald-700">
                    {selectedDetailsTontine.statusCategory === 'completed'
                      ? 'Tout est réglé 🎉'
                      : `${selectedDetailsTontine.currentTurn} / ${selectedDetailsTontine.totalTours} tour(s)`}
                  </Text>
                </View>

                {/* Installments Timeline List */}
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                  <View className="space-y-2.5 py-1">
                    {getInstallmentsSchedule(selectedDetailsTontine).map((item) => (
                      <View
                        key={item.turnNumber}
                        className={`p-3.5 rounded-2xl border flex-row items-center justify-between ${item.isPaid
                            ? 'bg-emerald-50/70 border-emerald-200'
                            : 'bg-white border-gray-200'
                          }`}
                      >
                        <View className="flex-row items-center space-x-3">
                          <View
                            className={`w-8 h-8 rounded-full items-center justify-center ${item.isPaid ? 'bg-emerald-500' : 'bg-gray-200'
                              }`}
                          >
                            {item.isPaid ? (
                              <Text className="text-white text-xs font-black">✓</Text>
                            ) : (
                              <Text className="text-gray-600 text-xs font-bold">{item.turnNumber}</Text>
                            )}
                          </View>

                          <View>
                            <Text className={`text-xs font-black ${item.isPaid ? 'text-emerald-900' : 'text-brand-dark'}`}>
                              Tour #{item.turnNumber} — {item.amount.toLocaleString('fr-FR')} FCFA
                            </Text>
                            <Text className="text-[11px] text-gray-500 font-semibold mt-0.5">
                              {item.formattedDate}
                            </Text>
                          </View>
                        </View>

                        {/* Status Tag */}
                        <View
                          className={`px-3 py-1 rounded-full ${item.isPaid
                              ? 'bg-emerald-100 border border-emerald-300'
                              : 'bg-amber-100 border border-amber-300'
                            }`}
                        >
                          <Text
                            className={`text-[10px] font-black uppercase ${item.isPaid ? 'text-emerald-800' : 'text-amber-900'
                              }`}
                          >
                            {item.isPaid ? 'Effectué' : 'À venir'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                {/* Close Action Button */}
                <TouchableOpacity
                  onPress={() => setSelectedDetailsTontine(null)}
                  activeOpacity={0.85}
                  className="w-full bg-[#173F73] py-3.5 rounded-2xl items-center mt-4 shadow-sm border border-[#19A66A]/30"
                >
                  <Text className="text-xs font-black text-[#19A66A] uppercase tracking-wider">
                    FERMER
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
