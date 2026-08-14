import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TontineLogo } from '../components/TontineLogo';
import { PhoneInput } from '../components/PhoneInput';
import { useRequestOtp, useVerifyOtp } from '../api/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  
  // Auth Mode State: 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Registration Extra Fields
  const [fullName, setFullName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  // Phone Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // OTP Verification Step State
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // React Query Mutations
  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const validatePhone = (phone: string): boolean => {
    if (!phone || phone.trim() === '') {
      setPhoneError('Veuillez saisir votre numéro de téléphone');
      return false;
    }
    if (phone.length < 9) {
      setPhoneError('Le numéro doit comporter 9 chiffres');
      return false;
    }
    const validPrefixes = ['70', '75', '76', '77', '78'];
    const prefix = phone.substring(0, 2);
    
    if (!validPrefixes.includes(prefix)) {
      setPhoneError('Indiquez un numéro valide (ex: 77, 78, 76, 70, 75)');
      return false;
    }

    setPhoneError(null);
    return true;
  };

  const validateName = (name: string): boolean => {
    if (mode === 'register' && (!name || name.trim().length < 2)) {
      setNameError('Veuillez entrer votre prénom et nom complet');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleRequestOtp = () => {
    const isPhoneValid = validatePhone(phoneNumber);
    const isNameValid = validateName(fullName);

    if (!isPhoneValid || !isNameValid) {
      return;
    }

    const fullPhone = `+221${phoneNumber}`;

    requestOtpMutation.mutate(
      { phoneNumber: fullPhone },
      {
        onSuccess: (data) => {
          setDevOtpHint(data.devOtp || '123456');
          setStep('otp');
          const title = mode === 'register' ? 'Création de compte Tontine' : 'Code OTP Envoyé';
          const alertMsg = mode === 'register'
            ? `Un code de confirmation a été envoyé au ${fullPhone} pour finaliser l'inscription de ${fullName || 'votre compte'}.${data.devOtp ? `\n\nCode de test DEV: ${data.devOtp}` : ''}`
            : `Un code de confirmation a été envoyé au ${fullPhone}.${data.devOtp ? `\n\nCode de test DEV: ${data.devOtp}` : ''}`;
          
          Alert.alert(title, alertMsg);
        },
        onError: (err) => {
          setPhoneError(err.message || 'Erreur de connexion au serveur');
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Le code doit comporter 6 chiffres');
      return;
    }

    const fullPhone = `+221${phoneNumber}`;

    verifyOtpMutation.mutate(
      { phoneNumber: fullPhone, code: otpCode },
      {
        onSuccess: () => {
          const title = mode === 'register' ? 'Compte Créé avec Succès ! 🎉' : 'Bienvenue sur Tontine Express ! 🇸🇳';
          const msg = mode === 'register'
            ? `Félicitations ${fullName ? fullName : ''} ! Votre compte Tontine Express est prêt.`
            : 'Authentification réussie. Votre compte est prêt.';
          
          Alert.alert(title, msg, [
            { text: 'Accéder à mon tableau de bord', onPress: () => router.replace('/dashboard') },
          ]);
        },
        onError: (err) => {
          setOtpError(err.message || 'Code OTP invalide');
        },
      }
    );
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setPhoneError(null);
    setNameError(null);
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-beige">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        >
          {/* Top Brand Decorative Header */}
          <View className="items-center pt-8 pb-6 px-6">
            <TontineLogo size="lg" showText />
            <Text className="text-sm font-medium text-gray-500 mt-2 text-center">
              Votre plateforme d'épargne rotative & tontine en toute confiance 🇸🇳
            </Text>
          </View>

          {/* Spacer */}
          <View className="flex-1 justify-end">
            {/* White Floating Bottom Sheet Card */}
            <View className="bg-brand-card rounded-t-[36px] px-8 pt-8 pb-10 shadow-2xl border-t border-amber-100">
              
              {step === 'phone' ? (
                /* STEP 1: LOGIN / REGISTER INPUT */
                <View>
                  <View className="items-center mb-6">
                    <Text className="text-2xl font-black text-brand-dark tracking-tight uppercase">
                      {mode === 'register' ? "S'INSCRIRE" : 'SE CONNECTER'}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1 text-center">
                      {mode === 'register'
                        ? 'Créez votre compte pour rejoindre vos tontines et coffres'
                        : 'Entrez votre numéro mobile pour recevoir votre code OTP'}
                    </Text>
                  </View>

                  {/* Mode Tab Switcher (CONNEXION / INSCRIPTION) */}
                  <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-5">
                    <TouchableOpacity
                      onPress={() => setMode('login')}
                      className={`flex-1 py-2.5 rounded-xl items-center ${
                        mode === 'login' ? 'bg-white shadow-sm' : ''
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider ${
                          mode === 'login' ? 'text-brand-dark font-extrabold' : 'text-gray-500'
                        }`}
                      >
                        Se Connecter
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setMode('register')}
                      className={`flex-1 py-2.5 rounded-xl items-center ${
                        mode === 'register' ? 'bg-white shadow-sm' : ''
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider ${
                          mode === 'register' ? 'text-amber-600 font-extrabold' : 'text-gray-500'
                        }`}
                      >
                        S'inscrire
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Additional Name Field for Registration */}
                  {mode === 'register' && (
                    <View className="mb-3">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                        Prénom & Nom complet
                      </Text>
                      <TextInput
                        className={`bg-gray-50 border rounded-2xl px-4 py-3.5 text-base font-semibold text-brand-dark ${
                          nameError ? 'border-red-500 bg-red-50/20' : 'border-gray-300'
                        }`}
                        placeholder="Ex: Fatou Sow"
                        placeholderTextColor="#9CA3AF"
                        value={fullName}
                        onChangeText={(val) => {
                          setFullName(val);
                          if (nameError) setNameError(null);
                        }}
                      />
                      {nameError && (
                        <Text className="text-xs font-medium text-red-500 mt-1.5 ml-1">
                          {nameError}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Phone Input Field Component */}
                  <PhoneInput
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      if (phoneError) setPhoneError(null);
                    }}
                    error={phoneError}
                    disabled={requestOtpMutation.isPending}
                  />

                  {/* Main Action Button */}
                  <TouchableOpacity
                    onPress={handleRequestOtp}
                    disabled={requestOtpMutation.isPending}
                    activeOpacity={0.85}
                    className={`w-full py-4 rounded-2xl items-center justify-center mt-6 flex-row space-x-2 shadow-md ${
                      requestOtpMutation.isPending
                        ? 'bg-amber-200'
                        : 'bg-brand-yellow active:bg-brand-yellowHover shadow-amber-400/30'
                    }`}
                  >
                    {requestOtpMutation.isPending ? (
                      <ActivityIndicator size="small" color="#1A1A1A" />
                    ) : (
                      <>
                        <Text className="text-lg font-black text-brand-dark tracking-wider uppercase">
                          {mode === 'register' ? 'CRÉER MON COMPTE' : 'VÉRIFIER'}
                        </Text>
                        <Text className="text-2xl font-black text-brand-dark leading-none">
                          ›
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Secondary Mode Switch Link */}
                  <View className="flex-row justify-center items-center mt-6">
                    <Text className="text-sm text-gray-500 font-medium">
                      {mode === 'register' ? 'Déjà un compte ? ' : 'Pas encore de compte ? '}
                    </Text>
                    <TouchableOpacity onPress={toggleMode}>
                      <Text className="text-sm font-extrabold text-amber-600 underline">
                        {mode === 'register' ? 'Se connecter' : "S'inscrire"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* STEP 2: OTP CODE VERIFICATION */
                <View>
                  <TouchableOpacity
                    onPress={() => setStep('phone')}
                    className="mb-4 flex-row items-center space-x-1"
                  >
                    <Text className="text-amber-600 font-bold text-base">‹ Modifier le numéro</Text>
                  </TouchableOpacity>

                  <View className="items-center mb-6">
                    <Text className="text-2xl font-black text-brand-dark tracking-tight uppercase">
                      CODE DE VÉRIFICATION
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1 text-center">
                      Code envoyé au <Text className="font-bold text-brand-dark">+221 {phoneNumber}</Text>
                    </Text>
                  </View>

                  {/* OTP Code Input */}
                  <View className="my-2">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                      Code OTP à 6 chiffres
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3.5 text-2xl font-bold text-center text-brand-dark tracking-[12px]"
                      placeholder="123456"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otpCode}
                      onChangeText={(val) => {
                        setOtpCode(val);
                        if (otpError) setOtpError(null);
                      }}
                      autoFocus
                    />
                    {otpError && (
                      <Text className="text-xs text-red-500 mt-1 font-medium text-center">{otpError}</Text>
                    )}

                    {devOtpHint && (
                      <View className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <Text className="text-xs text-amber-800 font-semibold text-center">
                          💡 Code de test DEV : <Text className="font-black text-base">{devOtpHint}</Text>
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Confirm OTP Button */}
                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={verifyOtpMutation.isPending}
                    activeOpacity={0.85}
                    className="w-full bg-brand-yellow active:bg-brand-yellowHover py-4 rounded-2xl items-center justify-center mt-6 shadow-md shadow-amber-400/30 flex-row space-x-2"
                  >
                    {verifyOtpMutation.isPending ? (
                      <ActivityIndicator size="small" color="#1A1A1A" />
                    ) : (
                      <Text className="text-lg font-black text-brand-dark tracking-wider uppercase">
                        {mode === 'register' ? "CONFIRMER L'INSCRIPTION" : 'CONFIRMER LA CONNEXION'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Security guarantee footer */}
              <View className="mt-8 pt-4 border-t border-gray-100 items-center flex-row justify-center space-x-2">
                <Text className="text-xs">🔒</Text>
                <Text className="text-xs text-gray-400 font-medium">
                  Données chiffrées & Conformes aux exigences BCEAO
                </Text>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
