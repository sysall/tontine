import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TontineIcon, BellIcon } from '../components/Icons';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useDashboardSummary } from '../api/useTontine';
import { ActiveTontineItem } from '../api/tontineApi';

type StatusFilterType = 'active' | 'pending' | 'completed';

export interface ExtendedTontineItem extends ActiveTontineItem {
  statusCategory: 'active' | 'pending' | 'completed';
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

  const userPhoneOrId = user?.phoneNumber || user?.paymentPhoneNumber;
  const { data: dashboardData, isLoading, refetch } = useDashboardSummary(userPhoneOrId);

  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('active');

  const apiTontines: ActiveTontineItem[] = dashboardData?.tontines || [];

  const allTontines: ExtendedTontineItem[] = apiTontines.map((item) => {
    let statusCategory: 'active' | 'pending' | 'completed' = 'active';
    if (item.status === 'COMPLETED') {
      statusCategory = 'completed';
    } else if (item.status === 'PENDING') {
      statusCategory = 'pending';
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
  const pendingCount = allTontines.filter((t) => t.statusCategory === 'pending').length;
  const completedCount = allTontines.filter((t) => t.statusCategory === 'completed').length;

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
        {/* ==================== 3 STATUS FILTER TABS ==================== */}
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

          {/* Tab 2: En attente */}
          <TouchableOpacity
            onPress={() => setStatusFilter('pending')}
            activeOpacity={0.8}
            className={`flex-1 py-2.5 px-1 rounded-2xl border items-center ${statusFilter === 'pending'
              ? 'bg-[#173F73] border-[#173F73] shadow-sm'
              : 'bg-white border-gray-200'
              }`}
          >
            <Text
              className={`text-xs font-black ${statusFilter === 'pending' ? 'text-[#19A66A]' : 'text-gray-600'
                }`}
            >
              En attente ({pendingCount})
            </Text>
          </TouchableOpacity>

          {/* Tab 3: Terminé */}
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
                : statusFilter === 'pending'
                  ? 'Aucune tontine en attente'
                  : 'Aucune tontine terminée'}
            </Text>
            <Text className="text-xs text-gray-500 text-center leading-relaxed mb-6">
              {statusFilter === 'active'
                ? 'Vous n\'avez pas de cercle d\'épargne actif pour le moment. Découvrez nos formules pour commencer !'
                : statusFilter === 'pending'
                  ? 'Vous n\'avez pas de souscription en attente de démarrage.'
                  : 'Vos tontines terminées apparaîtront ici avec le récapitulatif des gants perçus.'}
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
                {tontine.statusCategory === 'pending' && (
                  <View className="px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
                    <Text className="text-[10px] font-extrabold text-amber-800 uppercase">
                      En attente
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

              {tontine.statusCategory === 'pending' && (
                <View className="my-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                  <Text className="text-xs font-bold text-amber-900 mb-0.5">
                    Formation du groupe en cours
                  </Text>
                  <Text className="text-[11px] text-amber-800 font-medium">
                    {tontine.startDateInfo || 'Lancement prévu prochainement.'}
                  </Text>
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

              {/* Details & Actions */}
              <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                <View>
                  <Text className="text-[10px] text-gray-400 font-semibold uppercase">
                    {tontine.statusCategory === 'completed' ? 'Gain total perçu' : 'Mon total cotisé'}
                  </Text>
                  <Text className="text-sm font-black text-brand-dark">
                    {tontine.myContributionFcfa.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>

                {tontine.statusCategory === 'active' && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Cotisation instantanée',
                        `Procéder au versement de ${tontine.amountPerCycle.toLocaleString('fr-FR')} FCFA pour ${tontine.name} via :`,
                        [
                          { text: 'Wave', onPress: () => Alert.alert('Wave Sénégal', 'Paiement Wave prêt !') },
                          { text: 'Orange Money', onPress: () => Alert.alert('Orange Money', 'Paiement OM prêt !') },
                          { text: 'Annuler', style: 'cancel' },
                        ]
                      );
                    }}
                    activeOpacity={0.85}
                    className="px-5 py-3 bg-[#173F73] active:bg-[#1A4A82] rounded-2xl shadow-sm border border-[#19A66A]/30"
                  >
                    <Text className="text-xs font-black text-[#19A66A] uppercase tracking-wider">RÉGLES</Text>
                  </TouchableOpacity>
                )}

                {tontine.statusCategory === 'pending' && (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Détails du Cercle',
                        `${tontine.name} : ${tontine.startDateInfo || 'Tirage des tours bientôt disponible.'}`
                      );
                    }}
                    activeOpacity={0.85}
                    className="px-4 py-2.5 bg-amber-100 active:bg-amber-200 border border-amber-300 rounded-2xl"
                  >
                    <Text className="text-xs font-black text-amber-900 uppercase">DÉTAILS</Text>
                  </TouchableOpacity>
                )}

                {tontine.statusCategory === 'completed' && (
                  <View className="px-4 py-2.5 bg-emerald-100 rounded-2xl border border-emerald-300">
                    <Text className="text-xs font-black text-emerald-900 uppercase">REÇU ✓</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
