import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { WalletIcon, SmartphoneIcon, ShieldCheckIcon, CalendarIcon } from '../components/Icons';
import { useDashboardSummary, useProcessContribution } from '../api/useTontine';
import { ActiveTontineItem } from '../api/tontineApi';
import { useAuthStore } from '../store/useAuthStore';
import { auth } from '../config/firebase';

export default function ContributeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  const userPhoneOrId = user?.uid || user?.id || user?.phoneNumber || user?.paymentPhoneNumber;
  const { data: dashboardData, isLoading, refetch } = useDashboardSummary(userPhoneOrId);
  const processContributionMutation = useProcessContribution();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const activeTontines: ActiveTontineItem[] = dashboardData?.tontines || [];

  // Payment Selection State
  const [selectedTontine, setSelectedTontine] = useState<ActiveTontineItem | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'wave' | 'orange_money'>('wave');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePay = async () => {
    if (!selectedTontine) return;
    setIsProcessing(true);

    const effectiveUserId = user?.uid || user?.id || auth?.currentUser?.uid || user?.phoneNumber || 'user_demo_1';
    const providerKey: 'WAVE' | 'ORANGE_MONEY' = selectedProvider === 'wave' ? 'WAVE' : 'ORANGE_MONEY';

    try {
      // Traitement du versement 100% via l'API NestJS
      await processContributionMutation.mutateAsync({
        userNattId: selectedTontine.id,
        userId: effectiveUserId,
        amount: selectedTontine.amountPerCycle,
        paymentMethod: providerKey,
      });

      refetch();
      setPaymentSuccess(true);
    } catch (err: any) {
      console.error('Error executing contribution payment:', err);
      Alert.alert('Erreur', err?.message || 'Impossible d\'effectuer le versement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTontine(null);
    setPaymentSuccess(false);
    refetch();
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
        <View className="bg-[#173F73] rounded-3xl p-5 mb-5 shadow-lg border border-[#19A66A]/30">
          <View className="flex-row items-center space-x-3 mb-2">
            <View className="w-10 h-10 rounded-2xl bg-[#19A66A]/20 items-center justify-center border border-[#19A66A]/40">
              <WalletIcon size={22} color="#19A66A" />
            </View>
            <View className="flex-1">
              <Text className="text-xs uppercase tracking-widest text-[#19A66A] font-extrabold">
                Versements Sécurisés 🔒
              </Text>
              <Text className="text-base font-black text-white">
                Sélectionnez votre Natt à cotiser
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-300 leading-relaxed">
            Vos paiements sont traités instantanément via Wave Sénégal, Orange Money ou Carte bancaire.
          </Text>
        </View>

        <Text className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3 px-1">
          Mes Natt Actifs
        </Text>

        {/* Active Tontine Cards List */}
        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#19A66A" />
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
              className="px-6 py-3 bg-[#173F73] rounded-2xl border border-[#19A66A]/30"
            >
              <Text className="text-xs font-black text-[#19A66A] uppercase">Voir mes tontines</Text>
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
                <View className="px-3 py-1 bg-[#D4F2E4] rounded-full border border-[#19A66A]">
                  <Text className="text-[10px] font-extrabold text-[#173F73] uppercase">
                    Tour {tontine.currentTurn} / {tontine.totalTours}
                  </Text>
                </View>
              </View>

              <View className="bg-slate-50 rounded-2xl p-3.5 mb-3 border border-gray-100 flex-row justify-between items-center">
                <View>
                  <Text className="text-[10px] text-gray-400 uppercase font-semibold">
                    Montant de la cotisation
                  </Text>
                  <Text className="text-base font-black text-[#173F73]">
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

              {/* Next Due Date Banner */}
              <View className="flex-row items-center justify-between bg-emerald-50/80 px-3.5 py-2.5 rounded-2xl border border-emerald-200/80 mb-3">
                <View className="flex-row items-center space-x-2">
                  <CalendarIcon size={16} color="#19A66A" />
                  <Text className="text-xs font-bold text-emerald-900">Prochaine Échéance :</Text>
                </View>
                <Text className="text-xs font-black text-[#173F73]">
                  {tontine.nextTurnDate || 'Non définie'}
                </Text>
              </View>

              {/* Pay Button for this tontine */}
              <TouchableOpacity
                onPress={() => setSelectedTontine(tontine)}
                activeOpacity={0.85}
                className="w-full bg-[#173F73] active:bg-[#1A4A82] py-3.5 rounded-2xl items-center justify-center shadow-sm border border-[#19A66A]/30 flex-row space-x-2"
              >
                <SmartphoneIcon size={18} color="#19A66A" />
                <Text className="text-xs font-black text-[#19A66A] uppercase tracking-wider">
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
                  <ShieldCheckIcon size={34} color="#19A66A" />
                </View>
                <Text className="text-xl font-black text-brand-dark text-center mb-1">
                  Cotisation Effectuée ! 🎉
                </Text>
                <Text className="text-xs text-gray-500 text-center mb-6 px-4">
                  Votre versement de {selectedTontine?.amountPerCycle.toLocaleString('fr-FR')} FCFA pour {selectedTontine?.name} a été validé avec succès via {selectedProvider === 'wave' ? 'Wave Sénégal' : 'Orange Money'}.
                </Text>

                <TouchableOpacity
                  onPress={handleCloseModal}
                  className="w-full bg-[#173F73] py-4 rounded-2xl items-center border border-[#19A66A]/30"
                >
                  <Text className="text-xs font-black text-[#19A66A] uppercase tracking-wider">
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
                    ? 'bg-[#D4F2E4] border-[#19A66A]'
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
                    <Text className="text-base font-black text-[#173F73]">✓</Text>
                  )}
                </TouchableOpacity>

                {/* Provider Tab 2: Orange Money */}
                <TouchableOpacity
                  onPress={() => setSelectedProvider('orange_money')}
                  activeOpacity={0.85}
                  className={`p-4 rounded-2xl border mb-5 flex-row justify-between items-center ${selectedProvider === 'orange_money'
                    ? 'bg-[#D4F2E4] border-[#19A66A]'
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
                    <Text className="text-base font-black text-[#173F73]">✓</Text>
                  )}
                </TouchableOpacity>

                {/* Submit Payment Button */}
                <TouchableOpacity
                  onPress={handlePay}
                  disabled={isProcessing}
                  activeOpacity={0.85}
                  className="w-full bg-[#173F73] active:bg-[#1A4A82] py-4 rounded-2xl items-center justify-center border border-[#19A66A]/30"
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#19A66A" />
                  ) : (
                    <Text className="text-sm font-black text-[#19A66A] uppercase tracking-wider">
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
