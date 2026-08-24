import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TontineLogo } from '../components/TontineLogo';
import {
  HomeIcon,
  TontineIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  LogOutIcon,
  WalletIcon,
  JoinIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ReceiptIcon,
  CreditCardIcon,
  WhatsAppIcon,
  SmartphoneIcon,
  SettingsIcon,
  PlusIcon,
  CalendarIcon,
  BoltIcon,
  SparklesIcon,
} from '../components/Icons';
import { useAuthStore } from '../store/useAuthStore';
import { OFFICIAL_OFFERS, OfficialOffer, OfficialTier, TransactionItem, ActiveTontineItem } from '../api/tontineApi';
import {
  useDashboardSummary,
  useTransactionHistory,
  useSubscribeOffer,
  useJoinTontine,
} from '../api/useTontine';

type TabType = 'home' | 'tontines' | 'profile';
type TxFilterType = 'all' | 'contribution' | 'payout';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, updatePaymentMethod, logout } = useAuthStore();

  // Active Bottom Tab State
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Transaction Filter State
  const [txFilter, setTxFilter] = useState<TxFilterType>('all');
  const [selectedTxModal, setSelectedTxModal] = useState<TransactionItem | null>(null);

  // React Query Hooks
  const { data: dashboardData, isLoading, refetch } = useDashboardSummary();
  const { data: txData, isLoading: isTxLoading, refetch: refetchTx } = useTransactionHistory();
  const subscribeOfferMutation = useSubscribeOffer();
  const joinTontineMutation = useJoinTontine();

  // Modals state
  const [selectedOfferModal, setSelectedOfferModal] = useState<OfficialOffer | null>(null);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Payment Method Modal Form State ('wave' | 'orange_money' | 'card')
  const [selectedProviderTab, setSelectedProviderTab] = useState<'wave' | 'orange_money' | 'card'>(
    user?.defaultPaymentProvider || 'wave'
  );
  const [paymentPhoneInput, setPaymentPhoneInput] = useState(
    user?.paymentPhoneNumber || user?.phoneNumber || '+221771234567'
  );

  // Selected Tier State for Subscription Modal
  const [selectedTier, setSelectedTier] = useState<OfficialTier | null>(null);

  // Natt Événement Selection State
  const [selectedEventOption, setSelectedEventOption] = useState<'noel' | 'tabaski' | 'magal'>('noel');

  // KYC State
  const [cniNumber, setCniNumber] = useState('');
  const [isKycVerified, setIsKycVerified] = useState(true);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleOpenSubscribeModal = (offer: OfficialOffer) => {
    setSelectedOfferModal(offer);
    setSelectedTier(offer.tiers[0] || null);
  };

  const handleConfirmSubscription = () => {
    if (!selectedOfferModal || !selectedTier) {
      Alert.alert('Erreur', 'Veuillez sélectionner un pack d\'épargne.');
      return;
    }

    subscribeOfferMutation.mutate(
      {
        offerType: selectedOfferModal.type,
        tierId: selectedTier.id,
        amountFcfa: selectedTier.amountFcfa,
      },
      {
        onSuccess: (res) => {
          const offerTitle = selectedOfferModal.title;
          setSelectedOfferModal(null);
          setSelectedTier(null);
          Alert.alert(
            'Félicitations !',
            `Votre souscription à la ${offerTitle} (${selectedTier.name}) est enregistrée.\n\nCode d'invitation généré pour vos proches : ${res.subscription.inviteCode}`
          );
        },
        onError: (err) => {
          Alert.alert('Erreur', err.message || 'Échec de la souscription');
        },
      }
    );
  };

  const handleJoinSubmit = () => {
    const eventLabels: Record<string, string> = {
      noel: 'Noël',
      tabaski: 'Tabaski',
      magal: 'Magal',
    };

    joinTontineMutation.mutate(
      { inviteCode: selectedEventOption.toUpperCase() },
      {
        onSuccess: (res) => {
          setIsJoinModalOpen(false);
          Alert.alert('Natt Événement Rejoint !', `Vous avez rejoint le Natt Événement (${eventLabels[selectedEventOption]}) avec succès.`);
        },
        onError: (err) => {
          Alert.alert('Erreur', err.message || 'Échec du recrutement dans l\'événement');
        },
      }
    );
  };

  const handleKycSubmit = () => {
    if (!cniNumber || cniNumber.trim().length < 10) {
      Alert.alert('Erreur KYC', 'Veuillez saisir un numéro de CNI / Passeport valide.');
      return;
    }
    setIsKycVerified(true);
    setIsKycModalOpen(false);
    Alert.alert('Vérification KYC', 'Votre pièce d\'identité a été validée avec succès par les services de conformité.');
  };

  const handleSavePaymentMethod = () => {
    if (selectedProviderTab === 'card') {
      handleContactAdminWhatsApp();
      return;
    }

    if (!paymentPhoneInput || paymentPhoneInput.trim().length < 9) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    updatePaymentMethod(selectedProviderTab, paymentPhoneInput);
    setIsPaymentModalOpen(false);
    const providerName = selectedProviderTab === 'wave' ? 'Wave Sénégal' : 'Orange Money';
    Alert.alert('Moyen de Paiement Enregistré !', `${providerName} configuré avec le numéro ${paymentPhoneInput}.`);
  };

  const handleContactAdminWhatsApp = () => {
    const adminPhone = '221771234567';
    const msg = encodeURIComponent(
      'Bonjour Admin Tontine Express, je souhaite effectuer un retrait par carte bancaire / virement sur mon compte.'
    );
    const url = `https://wa.me/${adminPhone}?text=${msg}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp', 'Impossible d\'ouvrir WhatsApp sur cet appareil.');
    });
  };

  const summary = dashboardData?.summary || {
    totalSavedFcfa: 250000,
    nextPaymentFcfa: 50000,
    nextPaymentDueDate: '2026-08-25',
    expectedPayoutFcfa: 500000,
    myPayoutTurn: 3,
    activeTontinesCount: 2,
  };

  const tontines = dashboardData?.tontines || [];
  const rawTransactions = txData?.transactions || [];

  const filteredTransactions = rawTransactions.filter((tx: TransactionItem) => {
    if (txFilter === 'contribution') return tx.type === 'contribution';
    if (txFilter === 'payout') return tx.type === 'payout';
    return true;
  });

  const activePaymentProvider = user?.defaultPaymentProvider || 'wave';
  const activePaymentPhone = user?.paymentPhoneNumber || user?.phoneNumber || '+221 77 123 45 67';

  return (
    <SafeAreaView className="flex-1 bg-brand-beige justify-between">
      <ScrollView className="flex-1 px-5 pt-3 pb-6" showsVerticalScrollIndicator={false}>
        {/* Header Greeting */}
        <View className="flex-row items-center justify-between pb-4 border-b border-gray-200/60">
          <TontineLogo size="sm" showText={false} />
          <View className="flex-1 pl-3">
            <Text className="text-xs text-gray-500 font-medium">Bienvenue</Text>
            <Text className="text-base font-extrabold text-brand-dark" numberOfLines={1}>
              {user?.fullName || 'Fatou Sow'}
            </Text>
          </View>
        </View>

        {/* Official Brand Hero Balance Card */}
        <View className="mt-5 bg-[#04252D] rounded-3xl p-6 shadow-xl shadow-black/30 border border-[#D8C911]/30">
          <View className="flex-row justify-between items-start">
            <View>
              <Text className="text-xs uppercase tracking-widest text-[#D8C911] font-extrabold mb-1">
                Mon Épargne Totale Cotisée
              </Text>
              <Text className="text-3xl font-black text-white tracking-tight">
                {summary.totalSavedFcfa.toLocaleString('fr-FR')} <Text className="text-[#D8C911] text-xl font-black">FCFA</Text>
              </Text>
            </View>
            <View className="w-10 h-10 rounded-2xl bg-[#D8C911]/20 items-center justify-center border border-[#D8C911]/40">
              <WalletIcon size={22} color="#D8C911" />
            </View>
          </View>

          <View className="mt-6 pt-4 border-t border-slate-700/60 flex-row justify-between">
            <View>
              <Text className="text-[11px] text-gray-300 uppercase font-semibold">Prochain Versement</Text>
              <Text className="text-sm font-black text-[#D8C911]">
                {summary.nextPaymentFcfa.toLocaleString('fr-FR')} FCFA
              </Text>
              <Text className="text-[10px] text-gray-400">Échéance: 25 Août</Text>
            </View>
            <View className="items-end">
              <Text className="text-[11px] text-gray-300 uppercase font-semibold">Gain Attendu</Text>
              <Text className="text-sm font-black text-white">
                {summary.expectedPayoutFcfa.toLocaleString('fr-FR')} FCFA
              </Text>
              <Text className="text-[10px] text-[#D8C911]">Tour #{summary.myPayoutTurn}</Text>
            </View>
          </View>
        </View>

        {/* ==================== WAVE-STYLE QUICK ACTIONS GRID (6 BUTTONS) ==================== */}
        <View className="my-5 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 px-1">
            Services & Actions Rapides
          </Text>

          {/* Row 1: Direct Formula Shortcuts */}
          <View className="flex-row justify-around items-center mb-5">
            {/* 4. Natt Classique */}
            <TouchableOpacity
              onPress={() => {
                const offer = OFFICIAL_OFFERS.find((o) => o.id === 'rotative') || OFFICIAL_OFFERS[0];
                setSelectedOfferModal(offer);
              }}
              activeOpacity={0.8}
              className="items-center flex-1"
            >
              <View className="w-14 h-14 rounded-full bg-[#04252D] border border-[#04252D] items-center justify-center mb-1.5 shadow-sm">
                <CalendarIcon size={22} color="#D8C911" />
              </View>
              <Text className="text-xs font-extrabold text-brand-dark text-center">Natt Classique</Text>
            </TouchableOpacity>

            {/* 5. Tekk Tegui */}
            <TouchableOpacity
              onPress={() => {
                const offer = OFFICIAL_OFFERS.find((o) => o.id === 'projet') || OFFICIAL_OFFERS[1];
                setSelectedOfferModal(offer);
              }}
              activeOpacity={0.8}
              className="items-center flex-1"
            >
              <View className="w-14 h-14 rounded-full bg-[#04252D] border border-[#04252D] items-center justify-center mb-1.5 shadow-sm">
                <BoltIcon size={22} color="#D8C911" />
              </View>
              <Text className="text-xs font-extrabold text-brand-dark text-center">Tekk Tegui</Text>
            </TouchableOpacity>

            {/* 6. Natt Événementiel */}
            <TouchableOpacity
              onPress={() => setIsJoinModalOpen(true)}
              activeOpacity={0.8}
              className="items-center flex-1"
            >
              <View className="w-14 h-14 rounded-full bg-[#04252D] border border-[#04252D] items-center justify-center mb-1.5 shadow-sm">
                <SparklesIcon size={22} color="#D8C911" />
              </View>
              <Text className="text-xs font-extrabold text-brand-dark text-center">Natt Événement</Text>
            </TouchableOpacity>
          </View>
          {/* Row 2: General Navigation */}
          <View className="flex-row justify-around items-center">
            {/* 1. Cotiser */}
            <TouchableOpacity
              onPress={() => router.push('/contribute')}
              activeOpacity={0.8}
              className="items-center flex-1"
            >
              <View className="w-14 h-14 rounded-full bg-[#FAF8D6] border border-[#D8C911] items-center justify-center mb-1.5 shadow-sm">
                <WalletIcon size={24} color="#04252D" />
              </View>
              <Text className="text-xs font-extrabold text-brand-dark text-center">Cotiser</Text>
            </TouchableOpacity>

            {/* 2. Mes tontines */}
            <TouchableOpacity
              onPress={() => router.push('/my-tontines')}
              activeOpacity={0.8}
              className="items-center flex-1"
            >
              <View className="w-14 h-14 rounded-full bg-[#FAF8D6] border border-[#D8C911] items-center justify-center mb-1.5 shadow-sm">
                <TontineIcon size={24} color="#04252D" focused />
              </View>
              <Text className="text-xs font-extrabold text-brand-dark text-center">Mes tontines</Text>
            </TouchableOpacity>

            {/* 3. Paramètres */}
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              activeOpacity={0.8}
              className="items-center flex-1"
            >
              <View className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 items-center justify-center mb-1.5 shadow-sm">
                <SettingsIcon size={24} color="#04252D" />
              </View>
              <Text className="text-xs font-extrabold text-brand-dark text-center">Paramètres</Text>
            </TouchableOpacity>
          </View>

        </View>


        {/* ==================== HISTORIQUE DES TRANSACTIONS ==================== */}
        <View className="mt-6 mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-black text-brand-dark tracking-tight uppercase">
              Transactions
            </Text>
            <TouchableOpacity onPress={() => refetchTx()}>
              <Text className="text-xs font-extrabold text-[#04252D]">Actualiser</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <View className="flex-row space-x-2 mb-4">
            <TouchableOpacity
              onPress={() => setTxFilter('all')}
              className={`px-3.5 py-1.5 rounded-full border ${txFilter === 'all'
                ? 'bg-[#04252D] border-[#04252D]'
                : 'bg-white border-gray-200'
                }`}
            >
              <Text className={`text-xs font-extrabold ${txFilter === 'all' ? 'text-[#D8C911]' : 'text-gray-600'}`}>
                Toutes ({rawTransactions.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTxFilter('contribution')}
              className={`px-3.5 py-1.5 rounded-full border ${txFilter === 'contribution'
                ? 'bg-[#04252D] border-[#04252D]'
                : 'bg-white border-gray-200'
                }`}
            >
              <Text className={`text-xs font-extrabold ${txFilter === 'contribution' ? 'text-[#D8C911]' : 'text-gray-600'}`}>
                Cotisations ↗
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTxFilter('payout')}
              className={`px-3.5 py-1.5 rounded-full border ${txFilter === 'payout'
                ? 'bg-[#04252D] border-[#04252D]'
                : 'bg-white border-gray-200'
                }`}
            >
              <Text className={`text-xs font-extrabold ${txFilter === 'payout' ? 'text-[#D8C911]' : 'text-gray-600'}`}>
                Versements ↙
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transaction List */}
          {isTxLoading ? (
            <ActivityIndicator size="small" color="#D8C911" className="my-4" />
          ) : filteredTransactions.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center border border-gray-100">
              <Text className="text-sm font-semibold text-gray-500">Aucune transaction trouvée.</Text>
            </View>
          ) : (
            filteredTransactions.map((tx: TransactionItem) => {
              const isPayout = tx.type === 'payout';
              return (
                <TouchableOpacity
                  key={tx.id}
                  onPress={() => setSelectedTxModal(tx)}
                  activeOpacity={0.8}
                  className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row justify-between items-center"
                >
                  <View className="flex-row items-center space-x-3 flex-1 pr-2">
                    {/* Icon Badge */}
                    <View
                      className={`w-10 h-10 rounded-2xl items-center justify-center border ${isPayout
                        ? 'bg-[#FAF8D6] border-[#D8C911]'
                        : 'bg-slate-100 border-slate-200'
                        }`}
                    >
                      {isPayout ? (
                        <ArrowDownLeftIcon size={20} color="#04252D" />
                      ) : (
                        <ArrowUpRightIcon size={20} color="#04252D" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-sm font-extrabold text-brand-dark" numberOfLines={1}>
                        {tx.title}
                      </Text>
                      <Text className="text-[11px] text-gray-500 font-medium mt-0.5" numberOfLines={1}>
                        {tx.tontineName} • {tx.date}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text
                      className={`text-sm font-black ${isPayout ? 'text-emerald-600' : 'text-brand-dark'
                        }`}
                    >
                      {isPayout ? '+' : '-'} {tx.amountFcfa.toLocaleString('fr-FR')} FCFA
                    </Text>
                    <View className="flex-row items-center space-x-1 mt-0.5">
                      <Text className="text-[10px] font-bold text-gray-400">
                        {tx.provider === 'wave' ? 'Wave' : 'Orange Money'}
                      </Text>
                      <ReceiptIcon size={12} color="#9CA3AF" />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* MODAL 1: SUBSCRIBE TO OFFICIAL OFFER TIERS */}
      <Modal visible={Boolean(selectedOfferModal)} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <Text className="text-xl font-black text-brand-dark uppercase">
                {selectedOfferModal?.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedOfferModal(null)}>
                <Text className="text-xl font-bold text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-500 mb-4 font-medium">
              Choisissez le pack ou l'objectif d'épargne adapté à votre rythme :
            </Text>

            {/* List of Tiers */}
            <ScrollView className="max-h-72 mb-4">
              {selectedOfferModal?.tiers.map((tier) => {
                const isSelected = selectedTier?.id === tier.id;
                return (
                  <TouchableOpacity
                    key={tier.id}
                    onPress={() => setSelectedTier(tier)}
                    className={`p-4 rounded-2xl mb-3 border ${isSelected
                      ? 'bg-blue-50 border-blue-400 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text className="text-base font-extrabold text-brand-dark">
                          {tier.name}
                        </Text>
                        <Text className="text-xs text-gray-500 mt-0.5">
                          {tier.frequency} • {tier.targetDate ? `Cible: ${tier.targetDate}` : `${tier.maxMembers || 10} membres`}
                        </Text>
                      </View>
                      <Text className="text-lg font-black text-blue-600">
                        {tier.amountFcfa.toLocaleString('fr-FR')} <Text className="text-xs font-bold text-gray-600">FCFA</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={handleConfirmSubscription}
              disabled={subscribeOfferMutation.isPending}
              className="w-full bg-brand-primary active:bg-brand-primaryHover py-4 rounded-2xl items-center shadow-md shadow-blue-500/25"
            >
              {subscribeOfferMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-black text-white uppercase tracking-wider">
                  CONFIRMER MA SOUSCRIPTION
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: JOIN NATT ÉVÉNEMENT */}
      <Modal visible={isJoinModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <Text className="text-xl font-black text-brand-dark uppercase">
                Natt Événement
              </Text>
              <TouchableOpacity onPress={() => setIsJoinModalOpen(false)}>
                <Text className="text-xl font-bold text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-semibold text-gray-600 mb-4">
              Choisissez l'événement pour lequel vous souhaitez cotiser :
            </Text>

            {/* Event Options */}
            <View className="mb-5">
              {/* Option 1 : Noël */}
              <TouchableOpacity
                onPress={() => setSelectedEventOption('noel')}
                activeOpacity={0.8}
                className={`p-4 rounded-2xl border flex-row items-center justify-between mb-3 ${
                  selectedEventOption === 'noel'
                    ? 'bg-blue-50 border-brand-primary shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <View className="flex-row items-center space-x-3">
                  <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center">
                    <Text className="text-lg">🎄</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-extrabold text-brand-dark">Option 1 : Noël</Text>
                    <Text className="text-xs text-gray-500">Épargne Fêtes de Fin d'Année</Text>
                  </View>
                </View>
                <View className={`w-5 h-5 rounded-full border items-center justify-center ${
                  selectedEventOption === 'noel' ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'
                }`}>
                  {selectedEventOption === 'noel' && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
              </TouchableOpacity>

              {/* Option 2 : Tabaski */}
              <TouchableOpacity
                onPress={() => setSelectedEventOption('tabaski')}
                activeOpacity={0.8}
                className={`p-4 rounded-2xl border flex-row items-center justify-between mb-3 ${
                  selectedEventOption === 'tabaski'
                    ? 'bg-blue-50 border-brand-primary shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <View className="flex-row items-center space-x-3">
                  <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                    <Text className="text-lg">🐑</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-extrabold text-brand-dark">Option 2 : Tabaski</Text>
                    <Text className="text-xs text-gray-500">Préparation Aïd el-Kébir</Text>
                  </View>
                </View>
                <View className={`w-5 h-5 rounded-full border items-center justify-center ${
                  selectedEventOption === 'tabaski' ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'
                }`}>
                  {selectedEventOption === 'tabaski' && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
              </TouchableOpacity>

              {/* Option 3 : Magal */}
              <TouchableOpacity
                onPress={() => setSelectedEventOption('magal')}
                activeOpacity={0.8}
                className={`p-4 rounded-2xl border flex-row items-center justify-between mb-3 ${
                  selectedEventOption === 'magal'
                    ? 'bg-blue-50 border-brand-primary shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <View className="flex-row items-center space-x-3">
                  <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
                    <Text className="text-lg">🕌</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-extrabold text-brand-dark">Option 3 : Magal</Text>
                    <Text className="text-xs text-gray-500">Grand Magal de Touba</Text>
                  </View>
                </View>
                <View className={`w-5 h-5 rounded-full border items-center justify-center ${
                  selectedEventOption === 'magal' ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'
                }`}>
                  {selectedEventOption === 'magal' && <Text className="text-white text-xs font-bold">✓</Text>}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleJoinSubmit}
              disabled={joinTontineMutation.isPending}
              className="w-full bg-brand-primary active:bg-brand-primaryHover py-4 rounded-2xl items-center shadow-md shadow-blue-500/25"
            >
              {joinTontineMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-black text-white uppercase tracking-wider">
                  REJOINDRE CET ÉVÉNEMENT
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: TRANSACTION RECEIPT DETAIL SHEET */}
      <Modal visible={Boolean(selectedTxModal)} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <Text className="text-xl font-black text-brand-dark uppercase">
                Reçu de Transaction
              </Text>
              <TouchableOpacity onPress={() => setSelectedTxModal(null)}>
                <Text className="text-xl font-bold text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            {selectedTxModal && (
              <View className="mb-6">
                <View className="items-center my-3">
                  <View
                    className={`w-14 h-14 rounded-full items-center justify-center mb-2 border ${selectedTxModal.type === 'payout'
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-cyan-50 border-cyan-300'
                      }`}
                  >
                    {selectedTxModal.type === 'payout' ? (
                      <ArrowDownLeftIcon size={28} color="#10B981" />
                    ) : (
                      <ArrowUpRightIcon size={28} color="#06B6D4" />
                    )}
                  </View>
                  <Text className="text-2xl font-black text-brand-dark">
                    {selectedTxModal.type === 'payout' ? '+' : '-'} {selectedTxModal.amountFcfa.toLocaleString('fr-FR')} FCFA
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1 font-semibold">
                    {selectedTxModal.title}
                  </Text>
                </View>

                {/* Details list */}
                <View className="bg-gray-50 rounded-2xl p-4 space-y-2.5 border border-gray-200/60 mt-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500">Tontine :</Text>
                    <Text className="text-xs font-bold text-brand-dark">{selectedTxModal.tontineName}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500">Moyen de paiement :</Text>
                    <Text className="text-xs font-bold text-brand-dark">
                      {selectedTxModal.provider === 'wave' ? 'Wave Sénégal' : 'Orange Money'}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500">Référence :</Text>
                    <Text className="text-xs font-mono font-bold text-blue-700">{selectedTxModal.reference}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500">Horodatage :</Text>
                    <Text className="text-xs font-semibold text-gray-700">{selectedTxModal.date}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-500">Statut :</Text>
                    <Text className="text-xs font-extrabold text-emerald-700">SUCCÈS (Validé BCEAO ✓)</Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setSelectedTxModal(null)}
              className="w-full bg-brand-dark py-4 rounded-2xl items-center shadow-md"
            >
              <Text className="text-base font-black text-cyan-400 uppercase tracking-wider">
                FERMER LE REÇU
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: KYC IDENTITY VERIFICATION SHEET */}
      <Modal visible={isKycModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <Text className="text-xl font-black text-brand-dark uppercase">
                Vérification d'Identité (KYC)
              </Text>
              <TouchableOpacity onPress={() => setIsKycModalOpen(false)}>
                <Text className="text-xl font-bold text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-500 mb-4">
              Conformément à la réglementation BCEAO, entrez votre numéro de Carte Nationale d'Identité (CNI) sénégalaise ou de Passeport :
            </Text>

            <Text className="text-xs font-semibold text-gray-600 mb-2">
              Numéro de CNI / Passeport (13 chiffres)
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-lg font-bold text-brand-dark tracking-wider mb-5"
              placeholder="1 757 1995 01234"
              keyboardType="number-pad"
              value={cniNumber}
              onChangeText={setCniNumber}
            />

            <TouchableOpacity
              onPress={handleKycSubmit}
              className="w-full bg-brand-primary active:bg-brand-primaryHover py-4 rounded-2xl items-center shadow-md shadow-blue-500/25"
            >
              <Text className="text-base font-black text-white uppercase tracking-wider">
                VALIDER MES INFORMATIONS
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: UNIFIED PAYMENT METHOD CONFIGURATION SHEET (WAVE / OM / CARTE WHATSAPP) */}
      <Modal visible={isPaymentModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <Text className="text-xl font-black text-brand-dark uppercase">
                Moyen de Paiement & Retrait
              </Text>
              <TouchableOpacity onPress={() => setIsPaymentModalOpen(false)}>
                <Text className="text-xl font-bold text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-500 mb-4 font-medium">
              Sélectionnez l'option de paiement ou de retrait souhaitée :
            </Text>

            {/* 3-Tab Choice Selector */}
            <View className="flex-row space-x-2 mb-5">
              {/* Tab 1: Wave */}
              <TouchableOpacity
                onPress={() => setSelectedProviderTab('wave')}
                className={`flex-1 py-3 px-2 rounded-2xl border items-center ${selectedProviderTab === 'wave'
                  ? 'bg-blue-50 border-blue-400 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <SmartphoneIcon size={20} color={selectedProviderTab === 'wave' ? '#2563EB' : '#9CA3AF'} />
                <Text className="text-[11px] font-black text-brand-dark text-center mt-1">Wave</Text>
              </TouchableOpacity>

              {/* Tab 2: Orange Money */}
              <TouchableOpacity
                onPress={() => setSelectedProviderTab('orange_money')}
                className={`flex-1 py-3 px-2 rounded-2xl border items-center ${selectedProviderTab === 'orange_money'
                  ? 'bg-blue-50 border-blue-400 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <SmartphoneIcon size={20} color={selectedProviderTab === 'orange_money' ? '#2563EB' : '#9CA3AF'} />
                <Text className="text-[11px] font-black text-brand-dark text-center mt-1">Orange Money</Text>
              </TouchableOpacity>

              {/* Tab 3: Carte / Virement */}
              <TouchableOpacity
                onPress={() => setSelectedProviderTab('card')}
                className={`flex-1 py-3 px-2 rounded-2xl border items-center ${selectedProviderTab === 'card'
                  ? 'bg-blue-50 border-blue-400 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <CreditCardIcon size={20} color={selectedProviderTab === 'card' ? '#2563EB' : '#9CA3AF'} />
                <Text className="text-[11px] font-black text-brand-dark text-center mt-1">Carte / Visa</Text>
              </TouchableOpacity>
            </View>

            {/* TAB CONTENT: WAVE OR OM */}
            {selectedProviderTab !== 'card' ? (
              <View>
                <Text className="text-xs font-semibold text-gray-600 mb-2">
                  Numéro de téléphone rattaché ({selectedProviderTab === 'wave' ? 'Wave' : 'Orange Money'})
                </Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-base font-bold text-brand-dark tracking-wider mb-5"
                  placeholder="+221771234567"
                  keyboardType="phone-pad"
                  value={paymentPhoneInput}
                  onChangeText={setPaymentPhoneInput}
                />

                <TouchableOpacity
                  onPress={handleSavePaymentMethod}
                  className="w-full bg-brand-primary active:bg-brand-primaryHover py-4 rounded-2xl items-center shadow-md shadow-blue-500/25"
                >
                  <Text className="text-base font-black text-white uppercase tracking-wider">
                    ENREGISTRER CE MOYEN
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* TAB CONTENT: CARTE BANCAIRE VIA WHATSAPP ADMIN */
              <View className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 mb-3">
                <Text className="text-sm font-extrabold text-emerald-900 mb-1">
                  Retrait & Virement par Carte Bancaire
                </Text>
                <Text className="text-xs text-emerald-800 leading-relaxed mb-4">
                  Pour effectuer un retrait par carte Visa/Mastercard ou configurer un virement bancaire, contactez directement l'administrateur Tontine Express sur WhatsApp.
                </Text>

                <TouchableOpacity
                  onPress={handleContactAdminWhatsApp}
                  activeOpacity={0.85}
                  className="w-full bg-emerald-600 active:bg-emerald-700 py-3.5 rounded-2xl items-center justify-center flex-row space-x-2 shadow-sm"
                >
                  <WhatsAppIcon size={20} color="#FFFFFF" />
                  <Text className="text-xs font-black text-white uppercase tracking-wider">
                    Contacter l'Admin sur WhatsApp
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
