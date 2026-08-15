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
} from '../components/Icons';
import { useAuthStore } from '../store/useAuthStore';
import { OFFICIAL_OFFERS, OfficialOffer, OfficialTier, TransactionItem } from '../api/tontineApi';
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

  // Join Code State
  const [inviteCodeInput, setInviteCodeInput] = useState('');

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
    if (!inviteCodeInput || inviteCodeInput.trim().length < 4) {
      Alert.alert('Erreur', 'Veuillez saisir un code d\'invitation valide.');
      return;
    }

    joinTontineMutation.mutate(
      { inviteCode: inviteCodeInput.toUpperCase() },
      {
        onSuccess: (res) => {
          setIsJoinModalOpen(false);
          setInviteCodeInput('');
          Alert.alert('Cercle Rejoint !', res.message);
        },
        onError: (err) => {
          Alert.alert('Erreur', err.message || 'Code d\'invitation introuvable');
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

  const filteredTransactions = rawTransactions.filter((tx) => {
    if (txFilter === 'contribution') return tx.type === 'contribution';
    if (txFilter === 'payout') return tx.type === 'payout';
    return true;
  });

  const activePaymentProvider = user?.defaultPaymentProvider || 'wave';
  const activePaymentPhone = user?.paymentPhoneNumber || user?.phoneNumber || '+221 77 123 45 67';

  return (
    <SafeAreaView className="flex-1 bg-brand-beige justify-between">
      {/* ==================== TAB 1: HOME ==================== */}
      {activeTab === 'home' && (
        <ScrollView className="flex-1 px-5 pt-3 pb-6" showsVerticalScrollIndicator={false}>
          {/* Header Greeting */}
          <View className="flex-row items-center justify-between pb-4 border-b border-gray-200/60">
            <TontineLogo size="sm" showText={false} />
            <View className="flex-1 px-3">
              <Text className="text-xs text-gray-500 font-medium">Bienvenue</Text>
              <Text className="text-base font-extrabold text-brand-dark" numberOfLines={1}>
                {user?.fullName || 'Fatou Sow'}
              </Text>
            </View>
            <View className="px-2.5 py-1 bg-emerald-100 rounded-full border border-emerald-300 flex-row items-center space-x-1">
              <ShieldCheckIcon size={12} color="#065F46" />
              <Text className="text-[10px] font-extrabold text-emerald-800 uppercase">
                {isKycVerified ? 'Vérifié' : 'En attente'}
              </Text>
            </View>
          </View>

          {/* Black Hero Balance Card */}
          <View className="mt-5 bg-brand-dark rounded-3xl p-6 shadow-xl shadow-gray-900/20">
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
                  Mon Épargne Totale Cotisée
                </Text>
                <Text className="text-3xl font-black text-white tracking-tight">
                  {summary.totalSavedFcfa.toLocaleString('fr-FR')} <Text className="text-amber-400 text-xl font-bold">FCFA</Text>
                </Text>
              </View>
              <View className="w-10 h-10 rounded-2xl bg-amber-400/20 items-center justify-center border border-amber-400/40">
                <WalletIcon size={22} color="#FFC700" />
              </View>
            </View>

            <View className="mt-6 pt-4 border-t border-gray-800 flex-row justify-between">
              <View>
                <Text className="text-[11px] text-gray-400 uppercase font-semibold">Prochain Versement</Text>
                <Text className="text-sm font-bold text-amber-300">
                  {summary.nextPaymentFcfa.toLocaleString('fr-FR')} FCFA
                </Text>
                <Text className="text-[10px] text-gray-400">Échéance: 25 Août</Text>
              </View>
              <View className="items-end">
                <Text className="text-[11px] text-gray-400 uppercase font-semibold">Gain Attendu</Text>
                <Text className="text-sm font-bold text-emerald-400">
                  {summary.expectedPayoutFcfa.toLocaleString('fr-FR')} FCFA
                </Text>
                <Text className="text-[10px] text-gray-400">Tour #{summary.myPayoutTurn}</Text>
              </View>
            </View>
          </View>

          {/* Subscribed Tontines Section */}
          <View className="mt-7">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-black text-brand-dark tracking-tight uppercase">
                Mes Tontines Souscrites ({tontines.length})
              </Text>
              <TouchableOpacity onPress={() => refetch()}>
                <Text className="text-xs font-bold text-amber-600">Actualiser</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="small" color="#FFC700" className="my-6" />
            ) : (
              tontines.map((tontine) => (
                <View
                  key={tontine.id}
                  className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-2">
                      <Text className="text-base font-extrabold text-brand-dark">
                        {tontine.name}
                      </Text>
                      <Text className="text-xs text-gray-500 font-medium mt-0.5">
                        {tontine.category} • {tontine.amountPerCycle.toLocaleString('fr-FR')} FCFA / tour
                      </Text>
                    </View>
                    <View className="px-2.5 py-1 bg-emerald-100 rounded-full border border-emerald-300">
                      <Text className="text-[10px] font-extrabold text-emerald-800 uppercase">
                        Actif
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="my-3">
                    <View className="flex-row justify-between text-xs mb-1">
                      <Text className="text-[11px] text-gray-500 font-semibold">
                        Progression des tours
                      </Text>
                      <Text className="text-[11px] font-extrabold text-brand-dark">
                        Tour {tontine.currentTurn} sur {tontine.totalTours}
                      </Text>
                    </View>
                    <View className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <View
                        style={{ width: `${(tontine.currentTurn / tontine.totalTours) * 100}%` }}
                        className="h-full bg-amber-400 rounded-full"
                      />
                    </View>
                  </View>

                  {/* Cotiser Actions */}
                  <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
                    <View>
                      <Text className="text-[10px] text-gray-400 font-semibold uppercase">
                        Mes versements
                      </Text>
                      <Text className="text-xs font-bold text-brand-dark">
                        {tontine.myContributionFcfa.toLocaleString('fr-FR')} FCFA
                      </Text>
                    </View>

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
                      activeOpacity={0.8}
                      className="px-4 py-2 bg-brand-yellow rounded-xl shadow-sm border border-amber-300"
                    >
                      <Text className="text-xs font-black text-brand-dark">COTISER</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ==================== HISTORIQUE DES TRANSACTIONS ==================== */}
          <View className="mt-6 mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-black text-brand-dark tracking-tight uppercase">
                Historique des Transactions
              </Text>
              <TouchableOpacity onPress={() => refetchTx()}>
                <Text className="text-xs font-bold text-amber-600">Actualiser</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Pills */}
            <View className="flex-row space-x-2 mb-4">
              <TouchableOpacity
                onPress={() => setTxFilter('all')}
                className={`px-3 py-1.5 rounded-full border ${
                  txFilter === 'all'
                    ? 'bg-brand-dark border-brand-dark'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-xs font-bold ${txFilter === 'all' ? 'text-amber-400' : 'text-gray-600'}`}>
                  Toutes ({rawTransactions.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTxFilter('contribution')}
                className={`px-3 py-1.5 rounded-full border ${
                  txFilter === 'contribution'
                    ? 'bg-brand-dark border-brand-dark'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-xs font-bold ${txFilter === 'contribution' ? 'text-amber-400' : 'text-gray-600'}`}>
                  Cotisations ↗
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTxFilter('payout')}
                className={`px-3 py-1.5 rounded-full border ${
                  txFilter === 'payout'
                    ? 'bg-brand-dark border-brand-dark'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-xs font-bold ${txFilter === 'payout' ? 'text-amber-400' : 'text-gray-600'}`}>
                  Versements Reçus ↙
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transaction List */}
            {isTxLoading ? (
              <ActivityIndicator size="small" color="#FFC700" className="my-4" />
            ) : filteredTransactions.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center border border-gray-100">
                <Text className="text-sm font-semibold text-gray-500">Aucune transaction trouvée.</Text>
              </View>
            ) : (
              filteredTransactions.map((tx) => {
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
                        className={`w-10 h-10 rounded-2xl items-center justify-center border ${
                          isPayout
                            ? 'bg-emerald-50 border-emerald-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        {isPayout ? (
                          <ArrowDownLeftIcon size={20} color="#10B981" />
                        ) : (
                          <ArrowUpRightIcon size={20} color="#D97706" />
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
                        className={`text-sm font-black ${
                          isPayout ? 'text-emerald-600' : 'text-brand-dark'
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
      )}

      {/* ==================== TAB 2: TONTINES (OFFERS) ==================== */}
      {activeTab === 'tontines' && (
        <ScrollView className="flex-1 px-5 pt-3 pb-6" showsVerticalScrollIndicator={false}>
          <View className="mb-4 pb-3 border-b border-gray-200/60">
            <Text className="text-2xl font-black text-brand-dark uppercase tracking-tight">
              Nos Formules Tontines
            </Text>
            <Text className="text-xs text-gray-500 font-medium mt-1">
              Choisissez l'offre officielle adaptée à vos objectifs financiers
            </Text>
          </View>

          {/* Offer Cards */}
          {OFFICIAL_OFFERS.map((offer) => (
            <View
              key={offer.id}
              className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-amber-100"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-2">
                  <View className="self-start px-2.5 py-1 bg-amber-100 rounded-full mb-2 border border-amber-200">
                    <Text className="text-[10px] font-bold text-amber-900 uppercase">
                      {offer.badge}
                    </Text>
                  </View>
                  <Text className="text-lg font-black text-brand-dark">{offer.title}</Text>
                </View>
              </View>

              <Text className="text-xs text-gray-600 leading-relaxed mb-4">
                {offer.description}
              </Text>

              <TouchableOpacity
                onPress={() => handleOpenSubscribeModal(offer)}
                activeOpacity={0.85}
                className="w-full bg-brand-yellow active:bg-brand-yellowHover py-3.5 rounded-2xl items-center justify-center shadow-sm border border-amber-300 flex-row space-x-2"
              >
                <Text className="text-sm font-black text-brand-dark uppercase tracking-wider">
                  Rejoindre cette formule
                </Text>
                <Text className="text-lg font-bold text-brand-dark">→</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Join Private Circle Banner */}
          <View className="bg-gray-100 rounded-2xl p-5 mb-8 border border-gray-200">
            <View className="flex-row items-center space-x-2 mb-1">
              <JoinIcon size={20} color="#1A1A1A" />
              <Text className="text-sm font-black text-brand-dark">
                Rejoindre un Cercle Privé
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mb-3">
              Vous avez reçu un code d'invitation par SMS ou de vos proches ?
            </Text>
            <TouchableOpacity
              onPress={() => setIsJoinModalOpen(true)}
              className="w-full bg-brand-dark py-3 rounded-xl items-center"
            >
              <Text className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Saisir un Code d'Invitation
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ==================== TAB 3: PROFILE ==================== */}
      {activeTab === 'profile' && (
        <ScrollView className="flex-1 px-5 pt-3 pb-6" showsVerticalScrollIndicator={false}>
          <View className="mb-6 pb-3 border-b border-gray-200/60">
            <Text className="text-2xl font-black text-brand-dark uppercase tracking-tight">
              Mon Profil & Sécurité
            </Text>
            <Text className="text-xs text-gray-500 font-medium mt-1">
              Gestion de votre compte Tontine Express
            </Text>
          </View>

          {/* Profile Card */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100 items-center">
            <View className="w-20 h-20 rounded-full bg-brand-dark items-center justify-center mb-3 shadow-md border-2 border-amber-400">
              <UserIcon size={38} color="#FFC700" focused />
            </View>
            <Text className="text-xl font-black text-brand-dark">
              {user?.fullName || 'Fatou Sow'}
            </Text>
            <Text className="text-sm font-bold text-amber-600 mt-0.5">
              {user?.phoneNumber || '+221 77 123 45 67'}
            </Text>

            <View className="mt-4 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-200 flex-row items-center space-x-1.5">
              <ShieldCheckIcon size={14} color="#065F46" />
              <Text className="text-xs font-bold text-emerald-800">
                Membre Vérifié BCEAO
              </Text>
            </View>
          </View>

          {/* SECTION: CONFIGURATION DU MOYEN DE PAIEMENT UNIFIÉE */}
          <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100">
            <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Moyen de Paiement pour Retraits & Versements
            </Text>

            <View className="flex-row items-center justify-between p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 mb-3">
              <View className="flex-row items-center space-x-3">
                <SmartphoneIcon size={22} color="#D97706" />
                <View>
                  <Text className="text-sm font-extrabold text-brand-dark">
                    {activePaymentProvider === 'wave' ? 'Wave Sénégal' : 'Orange Money'}
                  </Text>
                  <Text className="text-xs font-semibold text-gray-600">
                    Compte : {activePaymentPhone}
                  </Text>
                </View>
              </View>
              <View className="px-2.5 py-1 bg-amber-200 rounded-full">
                <Text className="text-[10px] font-extrabold text-amber-900 uppercase">Actif</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsPaymentModalOpen(true)}
              className="w-full bg-brand-yellow py-3.5 rounded-2xl items-center shadow-sm border border-amber-300"
            >
              <Text className="text-xs font-black text-brand-dark uppercase tracking-wider">
                Configurer mon moyen de paiement
              </Text>
            </TouchableOpacity>
          </View>

          {/* Actions List */}
          <View className="bg-white rounded-3xl p-2 mb-6 shadow-sm border border-gray-100">
            {/* KYC Identity Verification Button */}
            <TouchableOpacity
              onPress={() => setIsKycModalOpen(true)}
              className="p-4 border-b border-gray-100 flex-row justify-between items-center"
            >
              <View className="flex-row items-center space-x-3">
                <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center border border-amber-200">
                  <ShieldCheckIcon size={18} color="#D97706" />
                </View>
                <View>
                  <Text className="text-sm font-extrabold text-brand-dark">
                    Vérification d'Identité (KYC)
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {isKycVerified ? 'CNI / Passeport validé ✓' : 'Pièce d\'identité requise'}
                  </Text>
                </View>
              </View>
              <Text className="text-base text-gray-400 font-bold">›</Text>
            </TouchableOpacity>

            {/* Notification Preferences */}
            <TouchableOpacity
              onPress={() => Alert.alert('Notifications', 'Alertes SMS et WhatsApp activées.')}
              className="p-4 flex-row justify-between items-center"
            >
              <View className="flex-row items-center space-x-3">
                <View className="w-9 h-9 rounded-xl bg-amber-50 items-center justify-center border border-amber-200">
                  <BellIcon size={18} color="#D97706" />
                </View>
                <View>
                  <Text className="text-sm font-extrabold text-brand-dark">
                    Notifications SMS & WhatsApp
                  </Text>
                  <Text className="text-xs text-gray-500">Rappels de versement activés</Text>
                </View>
              </View>
              <Text className="text-base text-gray-400 font-bold">›</Text>
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className="w-full bg-red-50 active:bg-red-100 py-4 rounded-2xl items-center justify-center border border-red-200 flex-row space-x-2"
          >
            <LogOutIcon size={18} color="#DC2626" />
            <Text className="text-base font-black text-red-600 uppercase tracking-wider">
              Déconnexion
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* ==================== MODERN SLEEK BOTTOM NAVIGATION DOCK ==================== */}
      <View className="bg-white border-t border-gray-100 px-4 py-2 flex-row justify-around items-center shadow-xl">
        {/* Tab 1: HOME */}
        <TouchableOpacity
          onPress={() => setActiveTab('home')}
          activeOpacity={0.85}
          className={`flex-1 flex-row items-center justify-center py-2.5 px-3 mx-1 rounded-2xl space-x-2 ${
            activeTab === 'home'
              ? 'bg-amber-400/20 border border-amber-300'
              : 'bg-transparent'
          }`}
        >
          <HomeIcon
            size={22}
            color={activeTab === 'home' ? '#1A1A1A' : '#9CA3AF'}
            focused={activeTab === 'home'}
          />
          {activeTab === 'home' && (
            <Text className="text-xs font-black text-brand-dark">Accueil</Text>
          )}
        </TouchableOpacity>

        {/* Tab 2: TONTINES */}
        <TouchableOpacity
          onPress={() => setActiveTab('tontines')}
          activeOpacity={0.85}
          className={`flex-1 flex-row items-center justify-center py-2.5 px-3 mx-1 rounded-2xl space-x-2 ${
            activeTab === 'tontines'
              ? 'bg-amber-400/20 border border-amber-300'
              : 'bg-transparent'
          }`}
        >
          <TontineIcon
            size={22}
            color={activeTab === 'tontines' ? '#1A1A1A' : '#9CA3AF'}
            focused={activeTab === 'tontines'}
          />
          {activeTab === 'tontines' && (
            <Text className="text-xs font-black text-brand-dark">Tontines</Text>
          )}
        </TouchableOpacity>

        {/* Tab 3: PROFILE */}
        <TouchableOpacity
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.85}
          className={`flex-1 flex-row items-center justify-center py-2.5 px-3 mx-1 rounded-2xl space-x-2 ${
            activeTab === 'profile'
              ? 'bg-amber-400/20 border border-amber-300'
              : 'bg-transparent'
          }`}
        >
          <UserIcon
            size={22}
            color={activeTab === 'profile' ? '#1A1A1A' : '#9CA3AF'}
            focused={activeTab === 'profile'}
          />
          {activeTab === 'profile' && (
            <Text className="text-xs font-black text-brand-dark">Profil</Text>
          )}
        </TouchableOpacity>
      </View>

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
                    className={`p-4 rounded-2xl mb-3 border ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 shadow-sm'
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
                      <Text className="text-lg font-black text-amber-600">
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
              className="w-full bg-brand-yellow py-4 rounded-2xl items-center shadow-md shadow-amber-400/30"
            >
              {subscribeOfferMutation.isPending ? (
                <ActivityIndicator color="#1A1A1A" />
              ) : (
                <Text className="text-base font-black text-brand-dark uppercase tracking-wider">
                  CONFIRMER MA SOUSCRIPTION
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: JOIN VIA INVITATION CODE */}
      <Modal visible={isJoinModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <Text className="text-xl font-black text-brand-dark uppercase">
                Rejoindre un Cercle Officiel
              </Text>
              <TouchableOpacity onPress={() => setIsJoinModalOpen(false)}>
                <Text className="text-xl font-bold text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-semibold text-gray-600 mb-2">
              Code d'invitation (ex: THIES2026)
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-xl font-black tracking-widest text-center text-brand-dark uppercase mb-5"
              placeholder="THIES2026"
              value={inviteCodeInput}
              onChangeText={(val) => setInviteCodeInput(val.toUpperCase())}
            />

            <TouchableOpacity
              onPress={handleJoinSubmit}
              disabled={joinTontineMutation.isPending}
              className="w-full bg-brand-yellow py-4 rounded-2xl items-center shadow-md shadow-amber-400/30"
            >
              {joinTontineMutation.isPending ? (
                <ActivityIndicator color="#1A1A1A" />
              ) : (
                <Text className="text-base font-black text-brand-dark uppercase tracking-wider">
                  REJOINDRE LE CERCLE
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
                    className={`w-14 h-14 rounded-full items-center justify-center mb-2 border ${
                      selectedTxModal.type === 'payout'
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-amber-50 border-amber-300'
                    }`}
                  >
                    {selectedTxModal.type === 'payout' ? (
                      <ArrowDownLeftIcon size={28} color="#10B981" />
                    ) : (
                      <ArrowUpRightIcon size={28} color="#D97706" />
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
                    <Text className="text-xs font-mono font-bold text-amber-700">{selectedTxModal.reference}</Text>
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
              <Text className="text-base font-black text-amber-400 uppercase tracking-wider">
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
              className="w-full bg-brand-yellow py-4 rounded-2xl items-center shadow-md shadow-amber-400/30"
            >
              <Text className="text-base font-black text-brand-dark uppercase tracking-wider">
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
                className={`flex-1 py-3 px-2 rounded-2xl border items-center ${
                  selectedProviderTab === 'wave'
                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <SmartphoneIcon size={20} color={selectedProviderTab === 'wave' ? '#D97706' : '#9CA3AF'} />
                <Text className="text-[11px] font-black text-brand-dark text-center mt-1">Wave</Text>
              </TouchableOpacity>

              {/* Tab 2: Orange Money */}
              <TouchableOpacity
                onPress={() => setSelectedProviderTab('orange_money')}
                className={`flex-1 py-3 px-2 rounded-2xl border items-center ${
                  selectedProviderTab === 'orange_money'
                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <SmartphoneIcon size={20} color={selectedProviderTab === 'orange_money' ? '#D97706' : '#9CA3AF'} />
                <Text className="text-[11px] font-black text-brand-dark text-center mt-1">Orange Money</Text>
              </TouchableOpacity>

              {/* Tab 3: Carte / Virement */}
              <TouchableOpacity
                onPress={() => setSelectedProviderTab('card')}
                className={`flex-1 py-3 px-2 rounded-2xl border items-center ${
                  selectedProviderTab === 'card'
                    ? 'bg-amber-50 border-amber-400 shadow-sm'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <CreditCardIcon size={20} color={selectedProviderTab === 'card' ? '#D97706' : '#9CA3AF'} />
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
                  className="w-full bg-brand-yellow py-4 rounded-2xl items-center shadow-md shadow-amber-400/30 border border-amber-300"
                >
                  <Text className="text-base font-black text-brand-dark uppercase tracking-wider">
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
