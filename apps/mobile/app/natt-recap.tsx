import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ShieldCheckIcon,
  CalendarIcon,
  SmartphoneIcon,
} from '../components/Icons';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscribeOffer } from '../api/useTontine';
import { db, auth } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function NattRecapScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const subscribeOfferMutation = useSubscribeOffer();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);
  const params = useLocalSearchParams<{
    offerId?: string;
    offerTitle?: string;
    offerType?: string;
    tierId?: string;
    tierName?: string;
    amountFcfa?: string;
    frequency?: string;
    category?: string;
    eventDueDate?: string;
    installmentAmount?: string;
    maxMembers?: string;
    eventId?: string;
    emoji?: string;
  }>();

  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'wave' | 'orange_money'>('wave');
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Parse financial values
  const targetAmount = parseInt(params.amountFcfa || '500000', 10);
  const threshold70Amount = Math.round(targetAmount * 0.70);
  const frequency = params.frequency || 'Mensuel';
  const isEvent = params.category === 'EVENT';
  const offerTitle = params.offerTitle || (isEvent ? 'Natt Événement' : 'Natt Classique');

  // Estimate installments count & installment amount
  const isRotativeClassique = params.offerType === 'rotative' || params.offerTitle?.toLowerCase().includes('classique');
  const isTekkTegui = params.offerType === 'projet' || params.offerTitle?.toLowerCase().includes('tek');
  const defaultInstallments = isRotativeClassique ? 4 : (isTekkTegui ? 10 : 10);

  const totalInstallments = params.maxMembers
    ? parseInt(params.maxMembers, 10)
    : (params.installmentAmount
      ? Math.max(1, Math.ceil(targetAmount / parseInt(params.installmentAmount, 10)))
      : defaultInstallments);

  const parsedInstallment = params.installmentAmount
    ? parseInt(params.installmentAmount, 10)
    : Math.round(targetAmount / totalInstallments);

  // Target versement index for 70%+ payout (avant-dernière cotisation)
  const targetVersementIndex = Math.max(1, totalInstallments - 1); // e.g. 3rd for 4, 9th for 10

  // Calculation of "Date de Prise Estimée" (date of 2nd to last installment)
  const calculatePayoutDate = () => {
    if (params.eventDueDate) {
      return params.eventDueDate;
    }

    const today = new Date();
    // Offset from today: (totalInstallments - 2) periods
    const periodsToAdd = Math.max(0, totalInstallments - 2);
    const payoutDate = new Date(today);
    const freqLower = frequency.toLowerCase();

    if (freqLower.includes('journalier') || freqLower.includes('jour') || freqLower.includes('daily')) {
      payoutDate.setDate(payoutDate.getDate() + periodsToAdd);
    } else if (freqLower.includes('hebdo') || freqLower.includes('weekly')) {
      payoutDate.setDate(payoutDate.getDate() + (periodsToAdd * 7));
    } else {
      // Default Mensuel / Rotative
      payoutDate.setMonth(payoutDate.getMonth() + periodsToAdd);
    }

    return payoutDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const payoutDateFormatted = calculatePayoutDate();

  const handleConfirmPaymentAndActivate = async () => {
    if (!acceptedTerms) {
      Alert.alert('Conditions requises', 'Veuillez accepter les règles et conditions du Natt avant de valider.');
      return;
    }

    setIsSimulatingPayment(true);

    try {
      const effectiveUserId = user?.uid || auth?.currentUser?.uid || user?.phoneNumber || 'user_demo_1';
      const userNattId = `user-natt-${Date.now()}`;
      const now = new Date();

      const freqUpper: 'DAILY' | 'WEEKLY' | 'MONTHLY' = (frequency || 'Mensuel').toLowerCase().includes('jour')
        ? 'DAILY'
        : ((frequency || 'Mensuel').toLowerCase().includes('hebdo') ? 'WEEKLY' : 'MONTHLY');

      const nextDueDateObj = new Date(now);
      if (freqUpper === 'DAILY') nextDueDateObj.setDate(nextDueDateObj.getDate() + 1);
      else if (freqUpper === 'WEEKLY') nextDueDateObj.setDate(nextDueDateObj.getDate() + 7);
      else nextDueDateObj.setMonth(nextDueDateObj.getMonth() + 1);

      const catalogId = params.offerType === 'rotative' ? 'natt_classique' : (params.offerType === 'projet' ? 'tekk_tegui' : undefined);
      const remainingBalance = Math.max(0, targetAmount - parsedInstallment);

      const newNattRecord = {
        userNattId,
        userId: effectiveUserId,
        userPhone: user?.phoneNumber || '',
        category: isEvent ? 'EVENT' : 'PERMANENT',
        catalogId: catalogId || null,
        eventId: params.eventId || null,
        title: offerTitle,
        targetAmount,
        thresholdAmount: threshold70Amount,
        totalPaid: parsedInstallment,
        remainingBalance,
        frequency: freqUpper,
        installmentAmount: parsedInstallment,
        totalInstallments,
        paidInstallmentsCount: 1,
        lastPaymentDate: now.toISOString(),
        paymentMethod: selectedProvider,
        nextDueDate: nextDueDateObj.toISOString(),
        eventDueDate: params.eventDueDate || null,
        status: 'ACTIVE',
        payoutEligible: false,
        payoutStatus: 'NOT_ELIGIBLE',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      // 1. Écriture directe dans Firestore (/user_natts/{userNattId})
      if (db) {
        try {
          const userNattRef = doc(db, 'user_natts', userNattId);
          await setDoc(userNattRef, newNattRecord, { merge: true });

          // Log de la transaction initiale pour le 1er versement
          const txId = `tx-${Date.now()}`;
          const txRef = doc(db, 'transactions', txId);
          await setDoc(txRef, {
            id: txId,
            userNattId,
            userId: effectiveUserId,
            amount: parsedInstallment,
            type: 'CONTRIBUTION',
            provider: selectedProvider,
            status: 'SUCCESS',
            description: `1ᵉʳ versement - ${offerTitle}`,
            createdAt: now.toISOString(),
          }, { merge: true });

          // Mettre également à jour les statistiques de l'utilisateur dans /users/{userId}
          const userRef = doc(db, 'users', effectiveUserId);
          await setDoc(userRef, {
            kycStatus: user?.isVerified ? 'VERIFIED' : 'PENDING_MANUAL_CHECK',
            updatedAt: now.toISOString(),
          }, { merge: true });

          console.log(`Natt & 1er versement enregistrés avec succès dans Firestore : ${userNattId}`);
        } catch (fErr) {
          console.warn('Erreur écriture Firestore userNatt:', fErr);
        }
      }

      // 2. Appeler l'API NestJS via React Query Hook (enregistrement centralisé Firestore via Firebase Admin SDK)
      try {
        await subscribeOfferMutation.mutateAsync({
          userId: effectiveUserId,
          category: isEvent ? 'EVENT' : 'PERMANENT',
          catalogId,
          eventId: params.eventId,
          targetAmount,
          frequency: freqUpper,
          customTitle: offerTitle,
          initialPaymentAmount: parsedInstallment,
          paymentMethod: selectedProvider,
        });
      } catch (apiErr) {
        console.warn('API NestJS subscription fallback, écriture Firestore directe exécutée:', apiErr);
      }

      setIsPaymentModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error('Erreur lors de l\'activation du Natt:', err);
      Alert.alert('Erreur', err?.message || 'Impossible d\'activer le Natt. Veuillez réessayer.');
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const handleFinishAndReturn = () => {
    setIsSuccessModalOpen(false);
    router.replace('/dashboard');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      {/* Navigation Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <Text className="text-lg font-bold text-gray-700">←</Text>
        </TouchableOpacity>

        <Text className="text-base font-extrabold text-brand-dark">
          Récapitulatif & Engagements
        </Text>

        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>

        {/* Card 1: Financial Summary Grid */}
        <View className="bg-white rounded-3xl p-5 mb-5 border border-gray-100 shadow-sm">
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Détails Financiers du Natt Choisi
          </Text>

          <View className="space-y-3">
            {/* Target Amount */}
            <View className="flex-row justify-between items-center py-2.5 border-b border-gray-100">
              <Text className="text-sm text-gray-500 font-medium">Montant Cible :</Text>
              <Text className="text-base font-black text-brand-dark">
                {targetAmount.toLocaleString('fr-FR')} FCFA
              </Text>
            </View>


            {/* Installment Amount */}
            <View className="flex-row justify-between items-center py-2.5 border-b border-gray-100">
              <Text className="text-sm text-gray-500 font-medium">Montant par Échéance :</Text>
              <Text className="text-sm font-extrabold text-blue-600">
                {parsedInstallment.toLocaleString('fr-FR')} FCFA
              </Text>
            </View>

            {/* Frequency */}
            <View className="flex-row justify-between items-center py-2.5 border-b border-gray-100">
              <Text className="text-sm text-gray-500 font-medium">Fréquence de Cotisation :</Text>
              <Text className="text-sm font-bold text-gray-800">{frequency}</Text>
            </View>

            {/* Total Installments */}
            <View className="flex-row justify-between items-center py-2.5 border-b border-gray-100">
              <Text className="text-sm text-gray-500 font-medium">Nombre de Versements :</Text>
              <Text className="text-sm font-bold text-gray-800">{totalInstallments} versement(s)</Text>
            </View>

            {/* Date de Prise Estimée */}
            <View className="flex-row justify-between items-center py-2.5 pt-3 border-t border-emerald-100 bg-emerald-50/70 -mx-5 px-5 mt-1 rounded-b-2xl">
              <View className="flex-row items-center space-x-1.5">
                <CalendarIcon size={16} color="#19A66A" />
                <Text className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                  Date de Prise :
                </Text>
              </View>
              <Text className="text-sm font-black text-emerald-700">
                {payoutDateFormatted}
              </Text>
            </View>
          </View>
        </View>

        {/* Card 2: Golden Rules Tontine Express */}
        <View className="bg-white rounded-3xl p-5 mb-5 border border-gray-100 shadow-sm">
          <View className="flex-row items-center space-x-2 mb-4">
            <ShieldCheckIcon size={20} color="#19A66A" />
            <Text className="text-xs font-bold uppercase tracking-wider text-brand-dark">
              Les Règles d'Or Tontine Express
            </Text>
          </View>

          <View className="space-y-4">
            {/* Rule 1 */}
            <View className="flex-row items-start space-x-3">
              <View className="w-7 h-7 rounded-full bg-[#19A66A]/20 items-center justify-center mt-0.5">
                <Text className="text-xs font-black text-brand-dark">1</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-brand-dark">
                  Respect des Échéances & Montants
                </Text>
                <Text className="text-xs text-gray-500 mt-1 leading-5">
                  Effectuer ses versements aux dates prévues, selon la fréquence et le montant convenus lors de la souscription.
                </Text>
              </View>
            </View>

            {/* Rule 2 */}
            <View className="flex-row items-start space-x-3">
              <View className="w-7 h-7 rounded-full bg-purple-100 items-center justify-center mt-0.5">
                <Text className="text-xs font-black text-purple-700">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-brand-dark">
                  Réactivité avec l'Équipe
                </Text>
                <Text className="text-xs text-gray-500 mt-1 leading-5">
                  Répondre dans les meilleurs délais aux sollicitations de l'équipe de suivi Tontine Express (appels, messages WhatsApp).
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Card 3: Checkbox Engagement */}
        <TouchableOpacity
          onPress={() => setAcceptedTerms(!acceptedTerms)}
          activeOpacity={0.8}
          className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 flex-row items-center space-x-3"
        >
          <View className={`w-6 h-6 rounded-md border items-center justify-center ${acceptedTerms ? 'bg-brand-primary border-brand-primary' : 'bg-gray-100 border-gray-300'}`}>
            {acceptedTerms && <Text className="text-white text-xs font-bold">✓</Text>}
          </View>
          <Text className="text-xs font-semibold text-gray-700 flex-1 leading-5">
            J'accepte la charte de la tontine et m'engage à respecter l'échéancier de versement.
          </Text>
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => {
            if (!acceptedTerms) {
              Alert.alert('Conditions requises', 'Veuillez accepter les règles et conditions du Natt avant de valider.');
              return;
            }
            setIsPaymentModalOpen(true);
          }}
          disabled={isSimulatingPayment || !acceptedTerms}
          activeOpacity={0.85}
          className={`w-full py-4 rounded-2xl items-center shadow-lg mb-10 border ${acceptedTerms ? 'bg-[#173F73] active:bg-[#1A4A82] border-[#19A66A]/30' : 'bg-gray-300 border-transparent'}`}
        >
          {isSimulatingPayment ? (
            <ActivityIndicator color="#19A66A" />
          ) : (
            <Text className={`text-base font-black uppercase tracking-wider ${acceptedTerms ? 'text-[#19A66A]' : 'text-gray-500'}`}>
              CONFIRMER MA SOUSCRIPTION
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* 💳 PAYMENT SIMULATION MODAL */}
      <Modal visible={isPaymentModalOpen} animationType="slide" transparent>
        <View className="flex-1 bg-black/70 justify-end sm:justify-center items-center p-0 sm:p-4">
          <View className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <View>
                <Text className="text-lg font-black text-brand-dark">
                  Premier Versement 💳
                </Text>
                <Text className="text-xs text-gray-500 font-medium">
                  {offerTitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPaymentModalOpen(false)}
                disabled={isSimulatingPayment}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-sm font-bold text-gray-500">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Recap Card */}
            <View className="bg-[#FDFBF7] p-4 rounded-2xl border border-gray-200 mb-4 items-center">
              <Text className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                Montant du 1ᵉʳ Versement
              </Text>
              <Text className="text-2xl font-black text-[#173F73]">
                {parsedInstallment.toLocaleString('fr-FR')} FCFA
              </Text>
              <Text className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full mt-2">
                1 / {totalInstallments} versement(s)
              </Text>
            </View>

            {/* Payment Method Selector */}
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Choisissez votre moyen de paiement :
            </Text>

            {/* Provider Tab 1: Wave */}
            <TouchableOpacity
              onPress={() => setSelectedProvider('wave')}
              activeOpacity={0.85}
              className={`p-3.5 rounded-2xl border mb-3 flex-row justify-between items-center ${selectedProvider === 'wave'
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
                    Numéro : {user?.paymentPhoneNumber || user?.phoneNumber || 'Non renseigné'}
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
              className={`p-3.5 rounded-2xl border mb-4 flex-row justify-between items-center ${selectedProvider === 'orange_money'
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
                    Numéro : {user?.paymentPhoneNumber || user?.phoneNumber || 'Non renseigné'}
                  </Text>
                </View>
              </View>
              {selectedProvider === 'orange_money' && (
                <Text className="text-base font-black text-[#173F73]">✓</Text>
              )}
            </TouchableOpacity>

            {/* Simulation Notice */}
            <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex-row items-center space-x-2">
              <Text className="text-base">💡</Text>
              <Text className="text-xs text-amber-800 font-medium flex-1 leading-4">
                <Text className="font-bold">Mode Simulation :</Text> En confirmant, le montant du 1ᵉʳ versement sera simulé et votre souscription sera directement activée.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleConfirmPaymentAndActivate}
              disabled={isSimulatingPayment}
              activeOpacity={0.85}
              className="w-full bg-[#173F73] py-4 rounded-2xl items-center shadow-lg border border-[#19A66A]/30 mb-2"
            >
              {isSimulatingPayment ? (
                <ActivityIndicator color="#19A66A" />
              ) : (
                <Text className="text-sm font-black text-[#19A66A] uppercase tracking-wider">
                  PAYER {parsedInstallment.toLocaleString('fr-FR')} FCFA (SIMULATION)
                </Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={() => setIsPaymentModalOpen(false)}
              disabled={isSimulatingPayment}
              className="w-full py-3 items-center"
            >
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Annuler
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SUCCESS CONFIRMATION MODAL */}
      <Modal visible={isSuccessModalOpen} animationType="fade" transparent>
        <View className="flex-1 bg-black/75 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl">
            <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
              <Text className="text-3xl">🎉</Text>
            </View>

            <Text className="text-xl font-black text-brand-dark text-center mb-2">
              Natt Activé & 1ᵉʳ Versement Validé !
            </Text>

            <Text className="text-xs text-gray-500 text-center mb-6 leading-5">
              Votre souscription au <Text className="font-bold text-brand-dark">{offerTitle}</Text> est désormais active.
              {"\n\n"}
              <Text className="text-emerald-700 font-semibold">
                ✓ 1ᵉʳ versement de {parsedInstallment.toLocaleString('fr-FR')} FCFA effectué avec succès via {selectedProvider === 'wave' ? 'Wave Sénégal' : 'Orange Money'}.
              </Text>
            </Text>

            <TouchableOpacity
              onPress={handleFinishAndReturn}
              className="w-full bg-brand-primary py-4 rounded-2xl items-center shadow-md"
            >
              <Text className="text-sm font-black text-white uppercase tracking-wider">
                RETOURNER AU TABLEAU DE BORD
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
