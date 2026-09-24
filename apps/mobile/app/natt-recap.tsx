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
  TontineIcon,
  CalendarIcon,
  BoltIcon,
  WalletIcon,
} from '../components/Icons';
import { useAuthStore } from '../store/useAuthStore';

export default function NattRecapScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

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
    emoji?: string;
  }>();

  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [generatedInviteCode, setGeneratedInviteCode] = useState('');

  // Parse financial values
  const targetAmount = parseInt(params.amountFcfa || '500000', 10);
  const threshold70Amount = Math.round(targetAmount * 0.70);
  const frequency = params.frequency || 'Mensuel';
  const isEvent = params.category === 'EVENT';
  const offerTitle = params.offerTitle || (isEvent ? 'Natt Événement' : 'Natt Classique');

  // Estimate installments
  const parsedInstallment = params.installmentAmount ? parseInt(params.installmentAmount, 10) : Math.round(targetAmount / 10);
  const totalInstallments = Math.max(1, Math.ceil(targetAmount / parsedInstallment));

  const handleActivateNatt = () => {
    if (!acceptedTerms) {
      Alert.alert('Conditions requises', 'Veuillez accepter les règles et conditions du Natt avant de valider.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const inviteCode = 'TE' + Math.floor(1000 + Math.random() * 9000);
      setGeneratedInviteCode(inviteCode);
      setIsSuccessModalOpen(true);
    }, 1000);
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
              <Text className="text-sm text-gray-500 font-medium">Montant Cible (100% Cagnotte) :</Text>
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
            <View className="flex-row justify-between items-center py-2.5">
              <Text className="text-sm text-gray-500 font-medium">Nombre de Versements Cible :</Text>
              <Text className="text-sm font-bold text-gray-800">{totalInstallments} versement(s)</Text>
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
                  Déblocage 100% dès 70% cotisés
                </Text>
                <Text className="text-xs text-gray-500 mt-1 leading-5">
                  Dès que vous atteignez <Text className="font-bold text-brand-dark">{threshold70Amount.toLocaleString('fr-FR')} FCFA</Text> (70%), la cagnotte totale de <Text className="font-bold text-brand-dark">{targetAmount.toLocaleString('fr-FR')} FCFA</Text> est transmise à l'administrateur pour versement sur votre compte Wave / OM.
                </Text>
              </View>
            </View>

            {/* Rule 2 */}
            <View className="flex-row items-start space-x-3">
              <View className="w-7 h-7 rounded-full bg-blue-100 items-center justify-center mt-0.5">
                <Text className="text-xs font-black text-blue-700">2</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-brand-dark">
                  Trésorerie Centrale Unique
                </Text>
                <Text className="text-xs text-gray-500 mt-1 leading-5">
                  Vous n'attendez le tour de personne et aucun regroupement n'est requis. Votre déblocage dépend uniquement de vos propres cotisations.
                </Text>
              </View>
            </View>

            {/* Rule 3 */}
            <View className="flex-row items-start space-x-3">
              <View className="w-7 h-7 rounded-full bg-purple-100 items-center justify-center mt-0.5">
                <Text className="text-xs font-black text-purple-700">3</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-brand-dark">
                  Remboursement des 30% restants
                </Text>
                <Text className="text-xs text-gray-500 mt-1 leading-5">
                  Après réception de vos 100%, vous continuez simplement vos versement habituels jusqu'à solder le reliquat selon l'échéancier.
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
            J'accepte les conditions de la tontine et m'engage à respecter l'échéancier de versement.
          </Text>
        </TouchableOpacity>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleActivateNatt}
          disabled={isLoading || !acceptedTerms}
          className={`w-full py-4 rounded-2xl items-center shadow-lg mb-10 ${acceptedTerms ? 'bg-brand-dark active:bg-brand-darkCard' : 'bg-gray-300'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#19A66A" />
          ) : (
            <Text className="text-base font-black text-[#19A66A] uppercase tracking-wider">
              VALIDER & ACTIVER MON NATT
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* SUCCESS CONFIRMATION MODAL */}
      <Modal visible={isSuccessModalOpen} animationType="fade" transparent>
        <View className="flex-1 bg-black/75 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl">
            <View className="w-16 h-16 rounded-full bg-emerald-100 items-center justify-center mb-4">
              <Text className="text-3xl">🎉</Text>
            </View>

            <Text className="text-xl font-black text-brand-dark text-center mb-2">
              Natt Activé avec Succès !
            </Text>

            <Text className="text-xs text-gray-500 text-center mb-5 leading-5">
              Votre souscription au <Text className="font-bold text-brand-dark">{offerTitle}</Text> est désormais active.
            </Text>

            <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-full mb-6 items-center">
              <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Code d'Invitation Généré
              </Text>
              <Text className="text-2xl font-black text-brand-dark tracking-widest font-mono">
                {generatedInviteCode}
              </Text>
              <Text className="text-[10px] text-gray-500 mt-1">Partagez-le avec vos proches s'ils souhaitent vous rejoindre.</Text>
            </View>

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
