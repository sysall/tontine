import React, { useState } from 'react';
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
import { TontineIcon } from '../components/Icons';
import { useDashboardSummary } from '../api/useTontine';
import { ActiveTontineItem } from '../api/tontineApi';

type StatusFilterType = 'active' | 'pending' | 'completed';

// Extended mock item type for pending & completed status demonstration
export interface ExtendedTontineItem extends ActiveTontineItem {
  statusCategory: 'active' | 'pending' | 'completed';
  startDateInfo?: string;
  payoutDateInfo?: string;
}

const EXTRA_MOCK_TONTINES: ExtendedTontineItem[] = [
  // Active (from dashboard API)
  {
    id: 'tontine-1',
    name: 'Natt Classique',
    offerType: 'rotative',
    category: 'Rotative Mensuelle',
    amountPerCycle: 50000,
    currentTurn: 3,
    totalTours: 10,
    totalMembers: 10,
    myContributionFcfa: 150000,
    myPayoutTurn: 5,
    nextTurnDate: '25 Août 2026',
    status: 'ACTIVE',
    statusCategory: 'active',
  },
  {
    id: 'tontine-2',
    name: 'Tekk Tegui',
    offerType: 'projet',
    category: 'Rotative Journalière',
    amountPerCycle: 25000,
    currentTurn: 4,
    totalTours: 8,
    totalMembers: 8,
    myContributionFcfa: 100000,
    myPayoutTurn: 8,
    nextTurnDate: '1er Septembre 2026',
    status: 'ACTIVE',
    statusCategory: 'active',
  },
  // Pending (En attente de démarrage)
  {
    id: 'tontine-pending-1',
    name: 'Tabaski Premium',
    offerType: 'rotative',
    category: 'Événementiel Mensuel',
    amountPerCycle: 100000,
    currentTurn: 0,
    totalTours: 6,
    totalMembers: 6,
    myContributionFcfa: 0,
    myPayoutTurn: 2,
    nextTurnDate: '1er Septembre 2026',
    status: 'PENDING',
    statusCategory: 'pending',
    startDateInfo: 'Début le 1er Septembre (4/6 membres prêts)',
  },
  {
    id: 'tontine-pending-2',
    name: 'Natt Magal Touba',
    offerType: 'rotative',
    category: 'Rotative Spéciale',
    amountPerCycle: 75000,
    currentTurn: 0,
    totalTours: 4,
    totalMembers: 4,
    myContributionFcfa: 0,
    myPayoutTurn: 1,
    nextTurnDate: '15 Septembre 2026',
    status: 'PENDING',
    statusCategory: 'pending',
    startDateInfo: 'Tirage de l\'ordre des tours en cours',
  },
  // Completed (Terminé)
  {
    id: 'tontine-completed-1',
    name: 'Korité Express 2026',
    offerType: 'rotative',
    category: 'Événementiel Clôturé',
    amountPerCycle: 50000,
    currentTurn: 5,
    totalTours: 5,
    totalMembers: 5,
    myContributionFcfa: 250000,
    myPayoutTurn: 2,
    nextTurnDate: 'Clôturé le 15 Juin 2026',
    status: 'COMPLETED',
    statusCategory: 'completed',
    payoutDateInfo: 'Gain de 250.000 FCFA perçu avec succès ✓',
  },
];

export default function MyTontinesScreen() {
  const router = useRouter();
  const { data: dashboardData, isLoading, refetch } = useDashboardSummary();

  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('active');

  // Merge API tontines with mock status tontines
  const apiTontines = dashboardData?.tontines || [];
  const allTontines: ExtendedTontineItem[] = EXTRA_MOCK_TONTINES;

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

        <View className="w-10" />
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
              ? 'bg-[#04252D] border-[#04252D] shadow-sm'
              : 'bg-white border-gray-200'
              }`}
          >
            <Text
              className={`text-xs font-black ${statusFilter === 'active' ? 'text-[#D8C911]' : 'text-gray-600'
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
              ? 'bg-[#04252D] border-[#04252D] shadow-sm'
              : 'bg-white border-gray-200'
              }`}
          >
            <Text
              className={`text-xs font-black ${statusFilter === 'pending' ? 'text-[#D8C911]' : 'text-gray-600'
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
              ? 'bg-[#04252D] border-[#04252D] shadow-sm'
              : 'bg-white border-gray-200'
              }`}
          >
            <Text
              className={`text-xs font-black ${statusFilter === 'completed' ? 'text-[#D8C911]' : 'text-gray-600'
                }`}
            >
              Terminé ({completedCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ==================== TONTINE LIST BY FILTER ==================== */}
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#D8C911" />
            <Text className="text-xs font-semibold text-gray-500 mt-3">
              Chargement de vos tontines en cours...
            </Text>
          </View>
        ) : filteredTontines.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-gray-100 mt-4 shadow-sm">
            <View className="w-16 h-16 rounded-full bg-[#FAF8D6] items-center justify-center mb-4 border border-[#D8C911]">
              <TontineIcon size={32} color="#04252D" focused />
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
                    className="px-5 py-3 bg-[#04252D] active:bg-[#0A333D] rounded-2xl shadow-sm border border-[#D8C911]/30"
                  >
                    <Text className="text-xs font-black text-[#D8C911] uppercase tracking-wider">RÉGLES</Text>
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
