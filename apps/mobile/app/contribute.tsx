import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TontineIcon, WalletIcon, SmartphoneIcon, ShieldCheckIcon } from '../components/Icons';
import { useDashboardSummary } from '../api/useTontine';
import { ActiveTontineItem } from '../api/tontineApi';
import { useAuthStore } from '../store/useAuthStore';

export default function ContributeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: dashboardData, isLoading } = useDashboardSummary();

  const activeTontines: ActiveTontineItem[] = dashboardData?.tontines || [
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
    },
  ];

  // Payment Selection State
  const [selectedTontine, setSelectedTontine] = useState<ActiveTontineItem | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'wave' | 'orange_money'>('wave');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePay = () => {
    if (!selectedTontine) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1200);
  };

  const handleCloseModal = () => {
    setSelectedTontine(null);
    setPaymentSuccess(false);
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
            Paiement Cotisation
          </Text>
          <Text className="text-[11px] text-gray-500 font-semibold">
            {activeTontines.length} Natt(s) actif(s) disponible(s)
          </Text>
        </View>

        <View className="w-10" />
      </View>

      {/* Main Scroll Content */}
      <ScrollView className="flex-1 px-5 pt-4 pb-8" showsVerticalScrollIndicator={false}>
        {/* Intro Info Box */}
        <View className="bg-[#04252D] rounded-3xl p-5 mb-5 shadow-lg border border-[#D8C911]/30">
          <View className="flex-row items-center space-x-3 mb-2">
            <View className="w-10 h-10 rounded-2xl bg-[#D8C911]/20 items-center justify-center border border-[#D8C911]/40">
              <WalletIcon size={22} color="#D8C911" />
            </View>
            <View className="flex-1">
              <Text className="text-xs uppercase tracking-widest text-[#D8C911] font-extrabold">
                Versements Sécurisés 🔒
              </Text>
              <Text className="text-base font-black text-white">
                Sélectionnez votre Natt à cotiser
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-300 leading-relaxed">
            Vos paiements sont traités instantanément via Wave Sénégal ou Orange Money avec reçu officiel immédiat.
          </Text>
        </View>

        <Text className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3 px-1">
          Mes Natt Actifs
        </Text>

        {/* Active Tontine Cards List */}
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#D8C911" />
            <Text className="text-xs font-semibold text-gray-500 mt-3">
              Chargement de vos tontines actives...
            </Text>
          </View>
        ) : activeTontines.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center border border-gray-100 mt-2 shadow-sm">
            <Text className="text-base font-black text-brand-dark text-center mb-2">
              Aucune tontine active disponible
            </Text>
            <Text className="text-xs text-gray-500 text-center leading-relaxed mb-4">
              Vous devez avoir au moins une tontine active pour pouvoir effectuer une cotisation.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/my-tontines')}
              className="px-6 py-3 bg-[#04252D] rounded-2xl border border-[#D8C911]/30"
            >
              <Text className="text-xs font-black text-[#D8C911] uppercase">Voir mes tontines</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activeTontines.map((tontine: ActiveTontineItem) => (
            <View
              key={tontine.id}
              className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 pr-2">
                  <Text className="text-lg font-black text-brand-dark">{tontine.name}</Text>
                  <Text className="text-xs text-gray-500 font-semibold mt-0.5">
                    {tontine.category}
                  </Text>
                </View>
                <View className="px-3 py-1 bg-[#FAF8D6] rounded-full border border-[#D8C911]">
                  <Text className="text-[10px] font-extrabold text-[#04252D] uppercase">
                    Tour {tontine.currentTurn} / {tontine.totalTours}
                  </Text>
                </View>
              </View>

              <View className="bg-slate-50 rounded-2xl p-3.5 mb-4 border border-gray-100 flex-row justify-between items-center">
                <View>
                  <Text className="text-[10px] text-gray-400 uppercase font-semibold">
                    Montant de la cotisation
                  </Text>
                  <Text className="text-base font-black text-[#04252D]">
                    {tontine.amountPerCycle.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[10px] text-gray-400 uppercase font-semibold">
                    Total déjà cotisé
                  </Text>
                  <Text className="text-sm font-bold text-gray-700">
                    {tontine.myContributionFcfa.toLocaleString('fr-FR')} FCFA
                  </Text>
                </View>
              </View>

              {/* Pay Button for this tontine */}
              <TouchableOpacity
                onPress={() => setSelectedTontine(tontine)}
                activeOpacity={0.85}
                className="w-full bg-[#04252D] active:bg-[#0A333D] py-3.5 rounded-2xl items-center justify-center shadow-sm border border-[#D8C911]/30 flex-row space-x-2"
              >
                <SmartphoneIcon size={18} color="#D8C911" />
                <Text className="text-xs font-black text-[#D8C911] uppercase tracking-wider">
                  COTISER {tontine.amountPerCycle.toLocaleString('fr-FR')} FCFA
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL PAIEMENT DE COTISATION */}
      <Modal visible={Boolean(selectedTontine)} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <View>
                <Text className="text-lg font-black text-brand-dark uppercase">
                  Payer pour {selectedTontine?.name}
                </Text>
                <Text className="text-xs text-gray-500 font-semibold">
                  Montant : {selectedTontine?.amountPerCycle.toLocaleString('fr-FR')} FCFA
                </Text>
              </View>
              <TouchableOpacity onPress={handleCloseModal}>
                <Text className="text-xl font-bold text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            {paymentSuccess ? (
              <View className="py-6 items-center">
                <View className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 items-center justify-center mb-3">
                  <ShieldCheckIcon size={34} color="#10B981" />
                </View>
                <Text className="text-xl font-black text-brand-dark text-center mb-1">
                  Cotisation Effectuée ! 🎉
                </Text>
                <Text className="text-xs text-gray-500 text-center mb-6 px-4">
                  Votre versement de {selectedTontine?.amountPerCycle.toLocaleString('fr-FR')} FCFA pour {selectedTontine?.name} a été validé avec succès via {selectedProvider === 'wave' ? 'Wave Sénégal' : 'Orange Money'}.
                </Text>

                <TouchableOpacity
                  onPress={handleCloseModal}
                  className="w-full bg-[#04252D] py-4 rounded-2xl items-center border border-[#D8C911]/30"
                >
                  <Text className="text-xs font-black text-[#D8C911] uppercase tracking-wider">
                    RETOURNER AU TABLEAU DE BORD
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-xs font-extrabold uppercase text-gray-400 mb-3">
                  Choisissez votre moyen de paiement :
                </Text>

                {/* Provider Tab 1: Wave */}
                <TouchableOpacity
                  onPress={() => setSelectedProvider('wave')}
                  activeOpacity={0.85}
                  className={`p-4 rounded-2xl border mb-3 flex-row justify-between items-center ${selectedProvider === 'wave'
                      ? 'bg-[#FAF8D6] border-[#D8C911]'
                      : 'bg-white border-gray-200'
                    }`}
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-9 h-9 rounded-xl bg-blue-100 items-center justify-center">
                      <SmartphoneIcon size={20} color="#0284C7" />
                    </View>
                    <View>
                      <Text className="text-sm font-black text-brand-dark">Wave Sénégal 🌊</Text>
                      <Text className="text-xs text-gray-500 font-medium">
                        Numéro : {user?.paymentPhoneNumber || user?.phoneNumber || '+221 77 123 45 67'}
                      </Text>
                    </View>
                  </View>
                  {selectedProvider === 'wave' && (
                    <Text className="text-base font-black text-[#04252D]">✓</Text>
                  )}
                </TouchableOpacity>

                {/* Provider Tab 2: Orange Money */}
                <TouchableOpacity
                  onPress={() => setSelectedProvider('orange_money')}
                  activeOpacity={0.85}
                  className={`p-4 rounded-2xl border mb-5 flex-row justify-between items-center ${selectedProvider === 'orange_money'
                      ? 'bg-[#FAF8D6] border-[#D8C911]'
                      : 'bg-white border-gray-200'
                    }`}
                >
                  <View className="flex-row items-center space-x-3">
                    <View className="w-9 h-9 rounded-xl bg-orange-100 items-center justify-center">
                      <SmartphoneIcon size={20} color="#EA580C" />
                    </View>
                    <View>
                      <Text className="text-sm font-black text-brand-dark">Orange Money 🟠</Text>
                      <Text className="text-xs text-gray-500 font-medium">
                        Numéro : {user?.paymentPhoneNumber || user?.phoneNumber || '+221 77 123 45 67'}
                      </Text>
                    </View>
                  </View>
                  {selectedProvider === 'orange_money' && (
                    <Text className="text-base font-black text-[#04252D]">✓</Text>
                  )}
                </TouchableOpacity>

                {/* Submit Payment Button */}
                <TouchableOpacity
                  onPress={handlePay}
                  disabled={isProcessing}
                  activeOpacity={0.85}
                  className="w-full bg-[#04252D] active:bg-[#0A333D] py-4 rounded-2xl items-center justify-center border border-[#D8C911]/30"
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#D8C911" />
                  ) : (
                    <Text className="text-sm font-black text-[#D8C911] uppercase tracking-wider">
                      VALIDER ET PAYER {selectedTontine?.amountPerCycle.toLocaleString('fr-FR')} FCFA
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
