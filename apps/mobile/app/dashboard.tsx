import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
import { OFFICIAL_OFFERS, OfficialOffer, OfficialTier, TransactionItem, ActiveTontineItem, EventNattItem } from '../api/tontineApi';
import {
  useDashboardSummary,
  useTransactionHistory,
  useEventNatts,
  useSubscribeOffer,
  useJoinTontine,
} from '../api/useTontine';

type TabType = 'home' | 'tontines' | 'profile';
type TxFilterType = 'all' | 'contribution' | 'payout';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isAuthenticated, updatePaymentMethod, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
    }
  }, [isAuthenticated, user, router]);

  // Active Bottom Tab State
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Transaction Filter State
  const [txFilter, setTxFilter] = useState<TxFilterType>('all');
  const [selectedTxModal, setSelectedTxModal] = useState<TransactionItem | null>(null);

  const userPhoneOrId = user?.phoneNumber || user?.paymentPhoneNumber;

  // React Query Hooks
  const { data: dashboardData, isLoading, refetch } = useDashboardSummary(userPhoneOrId);
  const { data: txData, isLoading: isTxLoading, refetch: refetchTx } = useTransactionHistory(userPhoneOrId);
  const { data: eventsData, isLoading: isEventsLoading } = useEventNatts();
  const subscribeOfferMutation = useSubscribeOffer();
  const joinTontineMutation = useJoinTontine();

  const activeEventNatts: EventNattItem[] = eventsData?.events || [];

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
    user?.paymentPhoneNumber || user?.phoneNumber || ''
  );

  // Selected Tier State for Subscription Modal
  const [selectedTier, setSelectedTier] = useState<OfficialTier | null>(null);

  // Natt Événement Selection State (Dynamic Event ID)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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

    const offerTitle = selectedOfferModal.title;
    const offerType = selectedOfferModal.type;
    const tierId = selectedTier.id;
    const amountFcfa = selectedTier.amountFcfa;
    const frequency = selectedTier.frequency || 'Mensuel';

    setSelectedOfferModal(null);
    setSelectedTier(null);

    router.push({
      pathname: '/natt-recap',
      params: {
        offerTitle,
        offerType,
        tierId,
        amountFcfa: amountFcfa.toString(),
        frequency,
        category: 'PERMANENT',
      },
    });
  };

  const handleJoinSubmit = () => {
    const effectiveEventId = selectedEventId || (activeEventNatts.length > 0 ? activeEventNatts[0].eventId : null);
    if (!effectiveEventId) {
      Alert.alert('Information', 'Aucun Natt Événement disponible pour le moment.');
      return;
    }

    const selectedEvt = activeEventNatts.find((e) => e.eventId === effectiveEventId);
    if (!selectedEvt) {
      Alert.alert('Erreur', 'L\'événement sélectionné est introuvable.');
      return;
    }

    setIsJoinModalOpen(false);

    router.push({
      pathname: '/natt-recap',
      params: {
        eventId: selectedEvt.eventId,
        offerTitle: selectedEvt.title,
        amountFcfa: selectedEvt.targetAmount.toString(),
        installmentAmount: selectedEvt.installmentAmount.toString(),
        frequency: selectedEvt.frequency || 'Mensuelle',
        category: 'EVENT',
      },
    });
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
    totalSavedFcfa: 0,
    nextPaymentFcfa: 0,
    nextPaymentDueDate: 'Non définie',
    expectedPayoutFcfa: 0,
    myPayoutTurn: 0,
    activeTontinesCount: 0,
  };

  const tontines = dashboardData?.tontines || [];
  const rawTransactions = txData?.transactions || [];

  const filteredTransactions = rawTransactions.filter((tx: TransactionItem) => {
    if (txFilter === 'contribution') return tx.type === 'contribution';
    if (txFilter === 'payout') return tx.type === 'payout';
    return true;
  });

  const activePaymentProvider = user?.defaultPaymentProvider || 'wave';
  const activePaymentPhone = user?.paymentPhoneNumber || user?.phoneNumber || '';

  return (
    <SafeAreaView className="flex-1 bg-brand-beige justify-between">
      <ScrollView className="flex-1 px-5 pt-3 pb-6" showsVerticalScrollIndicator={false}>
        {/* Header Greeting */}
        <View className="flex-row items-center justify-between pb-4 border-b border-gray-200/60">
          <TontineLogo size="sm" showText={false} />
          <View className="flex-1 pl-3">
            <Text className="text-xs text-gray-500 font-medium">Bienvenue</Text>
            <Text className="text-base font-extrabold text-brand-dark" numberOfLines={1}>
              {user?.fullName || user?.phoneNumber || 'Membre'}
            </Text>
          </View>
        </View>

        {/* Official Brand Hero Balance Card */}
        <View className="mt-5 shadow-xl shadow-[#0E284A]/40 rounded-[24px] bg-[#0E284A]">
          <LinearGradient
            colors={['#1E4D8C', '#173F73', '#0E284A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 22,
              borderWidth: 1,
              borderColor: 'rgba(25, 166, 106, 0.35)',
              overflow: 'hidden',
            }}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-xs uppercase tracking-widest text-[#19A66A] font-extrabold mb-1">
                  Mon Épargne Totale Cotisée
                </Text>
                <Text className="text-3xl font-black text-white tracking-tight">
                  {summary.totalSavedFcfa.toLocaleString('fr-FR')} <Text className="text-[#19A66A] text-xl font-black">FCFA</Text>
                </Text>
              </View>
              <View className="w-10 h-10 rounded-2xl bg-[#19A66A]/20 items-center justify-center border border-[#19A66A]/40">
                <WalletIcon size={22} color="#19A66A" />
              </View>
            </View>

            <View className="mt-6 pt-4 border-t border-white/10 flex-row justify-between">
              <View>
                <Text className="text-[11px] text-gray-300 uppercase font-semibold">Prochain Versement</Text>
                <Text className="text-sm font-black text-[#19A66A]">
                  {summary.nextPaymentFcfa.toLocaleString('fr-FR')} FCFA
                </Text>
                <Text className="text-[10px] text-gray-300/80">Échéance: {summary.nextPaymentDueDate || 'Non définie'}</Text>
              </View>
              <View className="items-end">
                <Text className="text-[11px] text-gray-300 uppercase font-semibold">Gain Attendu</Text>
                <Text className="text-sm font-black text-white">
                  {summary.expectedPayoutFcfa.toLocaleString('fr-FR')} FCFA
                </Text>
                <Text className="text-[10px] text-[#19A66A]">Tour #{summary.myPayoutTurn}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ==================== 3D FINANCIAL ICONS QUICK ACTIONS GRID ==================== */}
        <View className="my-5 bg-[#FBF9F4] rounded-[28px] p-[20px] border border-[#ECE7DA]">
          <Text className="text-[16px] font-bold text-[#2B3A2E] mb-[18px]">
            Services & actions rapides
          </Text>

          {/* 3-column Centered Grid with 3D Icons */}
          <View className="flex-row flex-wrap justify-between" style={{ rowGap: 20 }}>
            {/* 1. Natt Classique */}
            <TouchableOpacity
              onPress={() => {
                const offer = OFFICIAL_OFFERS.find((o) => o.id === 'rotative') || OFFICIAL_OFFERS[0];
                setSelectedOfferModal(offer);
              }}
              activeOpacity={0.75}
              style={{ width: '31.5%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Image
                source={require('../assets/images/3d/natt-classique.png')}
                style={{ width: 82, height: 82, marginBottom: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#0F172A', fontWeight: '700', fontSize: 13, textAlign: 'center', lineHeight: 16, letterSpacing: -0.1 }}>
                Natt Classique
              </Text>
            </TouchableOpacity>

            {/* 2. Tekk Tegui */}
            <TouchableOpacity
              onPress={() => {
                const offer = OFFICIAL_OFFERS.find((o) => o.id === 'projet') || OFFICIAL_OFFERS[1];
                setSelectedOfferModal(offer);
              }}
              activeOpacity={0.75}
              style={{ width: '31.5%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Image
                source={require('../assets/images/3d/tekk-tegui.png')}
                style={{ width: 82, height: 82, marginBottom: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#0F172A', fontWeight: '700', fontSize: 13, textAlign: 'center', lineHeight: 16, letterSpacing: -0.1 }}>
                Tekk Tegui
              </Text>
            </TouchableOpacity>

            {/* 3. Natt Événement */}
            <TouchableOpacity
              onPress={() => setIsJoinModalOpen(true)}
              activeOpacity={0.75}
              style={{ width: '31.5%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Image
                source={require('../assets/images/3d/natt-evenement.png')}
                style={{ width: 82, height: 82, marginBottom: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#0F172A', fontWeight: '700', fontSize: 13, textAlign: 'center', lineHeight: 16, letterSpacing: -0.1 }}>
                Natt Événement
              </Text>
            </TouchableOpacity>

            {/* 4. Cotiser */}
            <TouchableOpacity
              onPress={() => router.push('/contribute')}
              activeOpacity={0.75}
              style={{ width: '31.5%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Image
                source={require('../assets/images/3d/cotiser.png')}
                style={{ width: 82, height: 82, marginBottom: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#0F2F67', fontWeight: '800', fontSize: 13, textAlign: 'center', lineHeight: 16, letterSpacing: -0.1 }}>
                Cotiser
              </Text>
            </TouchableOpacity>

            {/* 5. Mes tontines */}
            <TouchableOpacity
              onPress={() => router.push('/my-tontines')}
              activeOpacity={0.75}
              style={{ width: '31.5%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Image
                source={require('../assets/images/3d/mes-tontines.png')}
                style={{ width: 82, height: 82, marginBottom: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#0F172A', fontWeight: '700', fontSize: 13, textAlign: 'center', lineHeight: 16, letterSpacing: -0.1 }}>
                Mes tontines
              </Text>
            </TouchableOpacity>

            {/* 6. Paramètres */}
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              activeOpacity={0.75}
              style={{ width: '31.5%', alignItems: 'center', justifyContent: 'center' }}
            >
              <Image
                source={require('../assets/images/3d/parametres.png')}
                style={{ width: 82, height: 82, marginBottom: 6 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#0F172A', fontWeight: '700', fontSize: 13, textAlign: 'center', lineHeight: 16, letterSpacing: -0.1 }}>
                Paramètres
              </Text>
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
              <Text className="text-xs font-extrabold text-[#173F73]">Actualiser</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Pills */}
          <View className="flex-row space-x-2 mb-4">
            <TouchableOpacity
              onPress={() => setTxFilter('all')}
              className={`px-3.5 py-1.5 rounded-full border ${txFilter === 'all'
                ? 'bg-[#173F73] border-[#173F73]'
                : 'bg-white border-gray-200'
                }`}
            >
              <Text className={`text-xs font-extrabold ${txFilter === 'all' ? 'text-[#19A66A]' : 'text-gray-600'}`}>
                Toutes ({rawTransactions.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTxFilter('contribution')}
              className={`px-3.5 py-1.5 rounded-full border ${txFilter === 'contribution'
                ? 'bg-[#173F73] border-[#173F73]'
                : 'bg-white border-gray-200'
                }`}
            >
              <Text className={`text-xs font-extrabold ${txFilter === 'contribution' ? 'text-[#19A66A]' : 'text-gray-600'}`}>
                Cotisations ↗
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTxFilter('payout')}
              className={`px-3.5 py-1.5 rounded-full border ${txFilter === 'payout'
                ? 'bg-[#173F73] border-[#173F73]'
                : 'bg-white border-gray-200'
                }`}
            >
              <Text className={`text-xs font-extrabold ${txFilter === 'payout' ? 'text-[#19A66A]' : 'text-gray-600'}`}>
                Versements ↙
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transaction List */}
          {isTxLoading ? (
            <ActivityIndicator size="small" color="#19A66A" className="my-4" />
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
                        ? 'bg-[#D4F2E4] border-[#19A66A]'
                        : 'bg-slate-100 border-slate-200'
                        }`}
                    >
                      {isPayout ? (
                        <ArrowDownLeftIcon size={20} color="#173F73" />
                      ) : (
                        <ArrowUpRightIcon size={20} color="#173F73" />
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
              Choisissez l'événement créé par l'administration pour lequel vous souhaitez cotiser :
            </Text>

            {/* Event Options */}
            <View className="mb-5">
              {isEventsLoading ? (
                <ActivityIndicator size="small" color="#19A66A" className="my-4" />
              ) : activeEventNatts.length === 0 ? (
                <View className="bg-gray-50 rounded-2xl p-6 border border-gray-200/80 items-center justify-center my-2">
                  <Text className="text-2xl mb-2">📅</Text>
                  <Text className="text-sm font-bold text-gray-700 text-center mb-1">
                    Aucun Natt Événement disponible
                  </Text>
                  <Text className="text-xs text-gray-500 text-center">
                    Les campagnes événementielles créées par l'administrateur s'afficheront ici.
                  </Text>
                </View>
              ) : (
                activeEventNatts.map((evt) => {
                  const isSelected = (selectedEventId || activeEventNatts[0]?.eventId) === evt.eventId;
                  return (
                    <TouchableOpacity
                      key={evt.eventId}
                      onPress={() => setSelectedEventId(evt.eventId)}
                      activeOpacity={0.8}
                      className={`p-4 rounded-2xl border flex-row items-center justify-between mb-3 ${
                        isSelected
                          ? 'bg-blue-50 border-brand-primary shadow-sm'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <View className="flex-row items-center space-x-3 flex-1 pr-2">
                        <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center">
                          <Text className="text-lg">🎉</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-extrabold text-brand-dark" numberOfLines={1}>
                            {evt.title}
                          </Text>
                          <Text className="text-xs text-brand-primary font-bold">
                            Cible: {evt.targetAmount.toLocaleString('fr-FR')} FCFA ({evt.installmentAmount.toLocaleString('fr-FR')} FCFA / {evt.frequency})
                          </Text>
                          {evt.description ? (
                            <Text className="text-[11px] text-gray-500 mt-0.5" numberOfLines={1}>
                              {evt.description}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      <View className={`w-5 h-5 rounded-full border items-center justify-center ${
                        isSelected ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <Text className="text-white text-xs font-bold">✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            <TouchableOpacity
              onPress={handleJoinSubmit}
              disabled={joinTontineMutation.isPending || activeEventNatts.length === 0}
              className={`w-full py-4 rounded-2xl items-center shadow-md ${
                activeEventNatts.length === 0 ? 'bg-gray-300' : 'bg-brand-primary active:bg-brand-primaryHover shadow-blue-500/25'
              }`}
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
                      <ArrowDownLeftIcon size={28} color="#19A66A" />
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
