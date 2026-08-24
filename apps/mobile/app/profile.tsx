import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  UserIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  LogOutIcon,
  CreditCardIcon,
  WhatsAppIcon,
  JoinIcon,
} from '../components/Icons';
import { useAuthStore } from '../store/useAuthStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updatePaymentMethod, logout } = useAuthStore();

  const isKycVerified = user?.isVerified || false;
  const activePaymentProvider = user?.defaultPaymentProvider || 'wave';
  const activePaymentPhone = user?.paymentPhoneNumber || user?.phoneNumber || '+221 77 123 45 67';

  // KYC Modal State
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [cniNumber, setCniNumber] = useState('');

  // Payment Method Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedProviderTab, setSelectedProviderTab] = useState<'wave' | 'orange_money' | 'card'>('wave');
  const [paymentPhoneInput, setPaymentPhoneInput] = useState(activePaymentPhone);

  // Change PIN Secret Modal State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleInviteFriend = () => {
    Alert.alert(
      'Inviter un Ami 🎁',
      'Votre code parrainage Tontine Express : FATOU2026\n\nPartagez le lien avec vos proches pour épargner ensemble !',
      [
        {
          text: 'Copier le Lien',
          onPress: () => Alert.alert('Lien copié !', 'Le lien d\'invitation https://tontine-express.sn/invite?ref=FATOU2026 a été copié.'),
        },
        { text: 'Fermer', style: 'cancel' },
      ]
    );
  };

  const handleContactSupport = () => {
    const phone = '221771234567';
    const msg = encodeURIComponent('Bonjour Service Client Tontine Express, j\'ai une question concernant mon compte.');
    const url = `https://wa.me/${phone}?text=${msg}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Service Client', 'Support joignable au +221 77 123 45 67 (9h - 19h).');
    });
  };

  const handleChangePinSubmit = () => {
    if (newPin.trim().length < 4) {
      Alert.alert('Code Secret Invalide', 'Veuillez saisir un code secret à 4 chiffres.');
      return;
    }
    setIsPinModalOpen(false);
    setOldPin('');
    setNewPin('');
    Alert.alert('Code Secret Mis à Jour', 'Votre nouveau code secret à 4 chiffres a été enregistré avec succès.');
  };

  const handleKycSubmit = () => {
    if (!cniNumber || cniNumber.trim().length < 9) {
      Alert.alert('Numéro CNI', 'Veuillez saisir un numéro de CNI/Passeport valide.');
      return;
    }
    setIsKycModalOpen(false);
    Alert.alert('CNI Enregistrée', 'Vos informations CNI ont été envoyées avec succès pour validation BCEAO.');
  };

  const handleSavePaymentMethod = () => {
    if (selectedProviderTab !== 'card' && (!paymentPhoneInput || paymentPhoneInput.trim().length < 9)) {
      Alert.alert('Numéro invalide', 'Veuillez renseigner le numéro de téléphone associé.');
      return;
    }

    updatePaymentMethod(
      selectedProviderTab === 'card' ? 'wave' : selectedProviderTab,
      paymentPhoneInput.trim()
    );

    setIsPaymentModalOpen(false);
    Alert.alert(
      'Moyen de Paiement Mis à Jour',
      `Votre moyen de paiement par défaut a été configuré avec succès.`
    );
  };

  const handleContactAdminWhatsApp = () => {
    const message = `Bonjour Admin Tontine Express, je souhaite obtenir de l'aide pour configurer mon virement / carte bancaire pour le compte ${user?.phoneNumber || ''}.`;
    const url = `whatsapp://send?phone=221770000000&text=${encodeURIComponent(message)}`;

    Alert.alert(
      'Contact WhatsApp Admin',
      'Ouverture de WhatsApp pour joindre le support Tontine Express...',
      [
        { text: 'Continuer', onPress: () => { } },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const handleLogout = () => {
    const doLogout = () => {
      logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm) {
        const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter de Tontine Express ?');
        if (confirmed) {
          doLogout();
        }
      } else {
        doLogout();
      }
      return;
    }

    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter de Tontine Express ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: doLogout,
        },
      ]
    );
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
            Mon Profil & Sécurité
          </Text>
          <Text className="text-[11px] text-gray-500 font-semibold">
            Paramètres Tontine Express
          </Text>
        </View>

        <View className="w-10" />
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1 px-5 pt-4 pb-8" showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View className="bg-white rounded-3xl p-6 mb-5 shadow-sm border border-gray-100 items-center">
          <View className="w-20 h-20 rounded-full bg-[#04252D] items-center justify-center mb-3 shadow-md border-2 border-[#D8C911]">
            <UserIcon size={38} color="#D8C911" focused />
          </View>
          <Text className="text-xl font-black text-brand-dark">
            {user?.fullName || 'Fatou Sow'}
          </Text>
          <Text className="text-sm font-extrabold text-[#04252D] mt-0.5">
            {user?.phoneNumber || '+221 77 123 45 67'}
          </Text>

          <View className="mt-4 px-4 py-1.5 bg-[#FAF8D6] rounded-full border border-[#D8C911] flex-row items-center space-x-1.5">
            <ShieldCheckIcon size={14} color="#04252D" />
            <Text className="text-xs font-black text-[#04252D]">
              Membre Vérifié BCEAO
            </Text>
          </View>
        </View>

        {/* SECTION: CONFIGURATION DU MOYEN DE PAIEMENT UNIFIÉE */}
        <View className="bg-white rounded-3xl p-5 mb-5 shadow-sm border border-gray-100">
          <Text className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Moyen de Paiement pour Retraits & Versements
          </Text>

          <View className="flex-row items-center justify-between p-3.5 bg-[#FAF8D6]/80 rounded-2xl border border-[#D8C911] mb-3">
            <View className="flex-row items-center space-x-3">
              <SmartphoneIcon size={22} color="#04252D" />
              <View>
                <Text className="text-sm font-extrabold text-brand-dark">
                  {activePaymentProvider === 'wave' ? 'Wave Sénégal' : 'Orange Money'}
                </Text>
                <Text className="text-xs font-semibold text-gray-600">
                  Compte : {activePaymentPhone}
                </Text>
              </View>
            </View>
            <View className="px-2.5 py-1 bg-[#D8C911] rounded-full">
              <Text className="text-[10px] font-extrabold text-[#04252D] uppercase">Actif</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setIsPaymentModalOpen(true)}
            className="w-full bg-[#04252D] active:bg-[#0A333D] py-3.5 rounded-2xl items-center shadow-md shadow-black/20 border border-[#D8C911]/30"
          >
            <Text className="text-xs font-black text-[#D8C911] uppercase tracking-wider">
              Configurer mon moyen de paiement
            </Text>
          </TouchableOpacity>
        </View>

        {/* Actions List */}
        <View className="bg-white rounded-3xl p-2 mb-6 shadow-sm border border-gray-100">
          {/* 1. KYC Identity Verification Button */}
          <TouchableOpacity
            onPress={() => setIsKycModalOpen(true)}
            className="p-4 border-b border-gray-100 flex-row justify-between items-center"
          >
            <View className="flex-row items-center space-x-3">
              <View className="w-9 h-9 rounded-xl bg-[#FAF8D6] items-center justify-center border border-[#D8C911]">
                <ShieldCheckIcon size={18} color="#04252D" />
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

          {/* 2. Inviter un ami à rejoindre Tontine Express */}
          <TouchableOpacity
            onPress={handleInviteFriend}
            className="p-4 border-b border-gray-100 flex-row justify-between items-center"
          >
            <View className="flex-row items-center space-x-3">
              <View className="w-9 h-9 rounded-xl bg-[#FAF8D6] items-center justify-center border border-[#D8C911]">
                <JoinIcon size={18} color="#04252D" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-sm font-extrabold text-brand-dark">
                  Inviter un ami à rejoindre
                </Text>
                <Text className="text-xs text-gray-500">Parrainage</Text>
              </View>
            </View>
            <Text className="text-base text-gray-400 font-bold">›</Text>
          </TouchableOpacity>

          {/* 3. Contacter le service client */}
          <TouchableOpacity
            onPress={handleContactSupport}
            className="p-4 border-b border-gray-100 flex-row justify-between items-center"
          >
            <View className="flex-row items-center space-x-3">
              <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center border border-slate-200">
                <WhatsAppIcon size={18} color="#04252D" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-sm font-extrabold text-brand-dark">
                  Contacter le service client
                </Text>
                <Text className="text-xs text-gray-500">Assistance 7j/7 sur WhatsApp</Text>
              </View>
            </View>
            <Text className="text-base text-gray-400 font-bold">›</Text>
          </TouchableOpacity>

          {/* 4. Modifier votre code secret */}
          <TouchableOpacity
            onPress={() => setIsPinModalOpen(true)}
            className="p-4 flex-row justify-between items-center"
          >
            <View className="flex-row items-center space-x-3">
              <View className="w-9 h-9 rounded-xl bg-slate-100 items-center justify-center border border-slate-200">
                <ShieldCheckIcon size={18} color="#04252D" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-sm font-extrabold text-brand-dark">
                  Modifier votre code secret
                </Text>
                <Text className="text-xs text-gray-500">Sécurisez l'accès à votre compte</Text>
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

      {/* MODAL 1: KYC IDENTITY VERIFICATION SHEET */}
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

      {/* MODAL 2: UNIFIED PAYMENT METHOD CONFIGURATION SHEET */}
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
                  ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <SmartphoneIcon size={20} color={selectedProviderTab === 'wave' ? '#059669' : '#9CA3AF'} />
                <Text className="text-[11px] font-black text-brand-dark text-center mt-1">Wave</Text>
              </TouchableOpacity>

              {/* Tab 2: Orange Money */}
              <TouchableOpacity
                onPress={() => setSelectedProviderTab('orange_money')}
                className={`flex-1 py-3 px-2 rounded-2xl border items-center ${selectedProviderTab === 'orange_money'
                  ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <SmartphoneIcon size={20} color={selectedProviderTab === 'orange_money' ? '#059669' : '#9CA3AF'} />
                <Text className="text-[11px] font-black text-brand-dark text-center mt-1">Orange Money</Text>
              </TouchableOpacity>

              {/* Tab 3: Carte / Virement */}
              <TouchableOpacity
                onPress={() => setSelectedProviderTab('card')}
                className={`flex-1 py-3 px-2 rounded-2xl border items-center ${selectedProviderTab === 'card'
                  ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                  : 'bg-gray-50 border-gray-200'
                  }`}
              >
                <CreditCardIcon size={20} color={selectedProviderTab === 'card' ? '#059669' : '#9CA3AF'} />
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

      {/* MODAL 3: CHANGE SECRET PIN SHEET */}
      <Modal visible={isPinModalOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <Text className="text-lg font-black text-brand-dark uppercase">
                Modifier mon Code Secret 🔒
              </Text>
              <TouchableOpacity onPress={() => setIsPinModalOpen(false)}>
                <Text className="text-xl font-bold text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-500 mb-4 font-medium">
              Veuillez confirmer votre code secret actuel puis saisir votre nouveau code à 4 chiffres :
            </Text>

            <Text className="text-xs font-semibold text-gray-600 mb-1.5">Ancien code secret (4 chiffres)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-xl font-black text-center text-brand-dark tracking-widest mb-4"
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={oldPin}
              onChangeText={setOldPin}
            />

            <Text className="text-xs font-semibold text-gray-600 mb-1.5">Nouveau code secret (4 chiffres)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-xl font-black text-center text-brand-dark tracking-widest mb-6"
              placeholder="••••"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
              value={newPin}
              onChangeText={setNewPin}
            />

            <TouchableOpacity
              onPress={handleChangePinSubmit}
              activeOpacity={0.85}
              className="w-full bg-[#04252D] active:bg-[#0A333D] py-4 rounded-2xl items-center shadow-md border border-[#D8C911]/30"
            >
              <Text className="text-xs font-black text-[#D8C911] uppercase tracking-wider">
                ENREGISTRER LE NOUVEAU CODE SECRET
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
