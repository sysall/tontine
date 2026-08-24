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
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Auth Mode State: 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Registration Extra Fields
  const [fullName, setFullName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  // Phone Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Step: 'phone' or 'otp'
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  // OTP Form State
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  // React Query Mutations
  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, '');
    const isValid = /^[7][06789]\d{7}$/.test(cleaned);
    if (!isValid) {
      setPhoneError('Numéro invalide (ex: 77 123 45 67)');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const validateName = (name: string): boolean => {
    if (mode === 'register' && name.trim().length < 3) {
      setNameError('Veuillez saisir votre prénom et nom complet');
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleSendOtp = () => {
    if (!validatePhone(phoneNumber)) return;
    if (mode === 'register' && !validateName(fullName)) return;

    const fullPhone = `+221${phoneNumber}`;

    requestOtpMutation.mutate(
      { phoneNumber: fullPhone },
      {
        onSuccess: (data) => {
          setStep('otp');
          setDevOtpCode(data.devOtp || '123456');
          setOtpError(null);
        },
        onError: (err) => {
          setPhoneError(err.message || 'Erreur lors de l\'envoi de l\'OTP');
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
        onSuccess: (res) => {
          // 1. Immediately update Zustand authentication state
          setAuth(
            {
              phoneNumber: fullPhone,
              fullName: fullName.trim() || (mode === 'register' ? 'Nouveau Membre' : 'Fatou Sow'),
              isVerified: true,
            },
            res.token || 'mock_jwt_token_2026'
          );

          // 2. Immediately replace route to /dashboard without window.alert blocking
          router.replace('/dashboard');
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
          className="px-6 py-6"
        >
          {/* Header & Logo */}
          <View className="items-center mt-4 mb-6">
            <TontineLogo size="md" />
            <Text className="text-sm font-semibold text-gray-600 mt-2 text-center">
              Contribuez, recevez et avancez ensemble
            </Text>
          </View>

          {/* Floating Pure White Card Container */}
          <View className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex-1 justify-between mb-4">

            {/* Mode Switcher Tabs */}
            <View className="bg-gray-100 p-1.5 rounded-2xl flex-row mb-6">
              <TouchableOpacity
                onPress={() => {
                  setMode('login');
                  setPhoneError(null);
                  setNameError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl items-center ${mode === 'login' ? 'bg-white shadow-sm' : ''
                  }`}
              >
                <Text
                  className={`text-xs font-extrabold uppercase tracking-wider ${mode === 'login' ? 'text-brand-dark' : 'text-gray-400'
                    }`}
                >
                  Se Connecter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMode('register');
                  setPhoneError(null);
                  setNameError(null);
                }}
                className={`flex-1 py-2.5 rounded-xl items-center ${mode === 'register' ? 'bg-white shadow-sm' : ''
                  }`}
              >
                <Text
                  className={`text-xs font-extrabold uppercase tracking-wider ${mode === 'register' ? 'text-brand-dark' : 'text-gray-400'
                    }`}
                >
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </View>

            {/* STEP 1: PHONE / REGISTRATION ENTRY */}
            {step === 'phone' ? (
              <View className="flex-1 justify-center">
                <Text className="text-2xl font-black text-brand-dark tracking-tight mb-1">
                  {mode === 'login' ? 'Bon retour ! 👋' : 'Créer mon compte '}
                </Text>
                <Text className="text-xs text-gray-500 font-medium mb-6">
                  {mode === 'login'
                    ? 'Connectez-vous pour accéder à vos tontines et épargnes.'
                    : 'Rejoignez des milliers de sénégalais qui épargnent en toute confiance.'}
                </Text>

                {/* Name Input (Only in Registration Mode) */}
                {mode === 'register' && (
                  <View className="mb-4">
                    <Text className="text-xs font-extrabold uppercase text-gray-500 mb-1.5 tracking-wider">
                      Prénom & Nom Complet
                    </Text>
                    <TextInput
                      className="bg-gray-50 border border-gray-300 rounded-2xl p-4 text-base font-semibold text-brand-dark"
                      placeholder="Ex: Fatou Sow"
                      value={fullName}
                      onChangeText={(val) => {
                        setFullName(val);
                        if (nameError) setNameError(null);
                      }}
                    />
                    {nameError && (
                      <Text className="text-xs font-bold text-red-500 mt-1">{nameError}</Text>
                    )}
                  </View>
                )}

                {/* Phone Input Field */}
                <PhoneInput
                  value={phoneNumber}
                  onChangeText={(val) => {
                    setPhoneNumber(val);
                    if (phoneError) setPhoneError(null);
                  }}
                  error={phoneError}
                />

                {/* Action Submit Button */}
                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={requestOtpMutation.isPending}
                  activeOpacity={0.85}
                  className="w-full bg-brand-dark active:bg-brand-darkCard py-4 rounded-2xl items-center justify-center mt-6 shadow-md shadow-black/20 border border-brand-primary/30"
                >
                  {requestOtpMutation.isPending ? (
                    <ActivityIndicator color="#D8C911" />
                  ) : (
                    <Text className="text-base font-black text-brand-primary uppercase tracking-wider">
                      {mode === 'login' ? 'RECEVOIR LE CODE OTP' : 'CRÉER MON COMPTE'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleMode} className="mt-4 py-2 items-center">
                  <Text className="text-xs font-bold text-gray-500">
                    {mode === 'login'
                      ? 'Pas encore de compte ? S\'inscrire'
                      : 'Déjà un compte ? Se connecter'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* STEP 2: OTP VERIFICATION ENTRY */
              <View className="flex-1 justify-center">
                <Text className="text-2xl font-black text-brand-dark tracking-tight mb-1">
                  Vérification OTP 🔒
                </Text>
                <Text className="text-xs text-gray-500 font-medium mb-4">
                  Un code à 6 chiffres a été envoyé par SMS au{' '}
                  <Text className="font-bold text-brand-dark">+221 {phoneNumber}</Text>
                </Text>

                {/* Dev Mode OTP Banner */}
                {devOtpCode && (
                  <View className="bg-[#FAF8D6] border border-[#D8C911] rounded-2xl p-3.5 mb-5 flex-row items-center justify-between">
                    <View>
                      <Text className="text-[11px] font-extrabold text-[#04252D] uppercase">
                        Code OTP Test Dev :
                      </Text>
                      <Text className="text-lg font-black tracking-widest text-[#04252D]">
                        {devOtpCode}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setOtpCode(devOtpCode)}
                      className="px-3.5 py-1.5 bg-[#D8C911] rounded-xl"
                    >
                      <Text className="text-xs font-extrabold text-[#04252D]">Remplir</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* OTP Code Input */}
                <TextInput
                  className="bg-gray-50 border border-gray-300 rounded-2xl p-4 text-2xl font-black tracking-widest text-center text-brand-dark mb-2"
                  placeholder="000000"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={(val) => {
                    setOtpCode(val);
                    if (otpError) setOtpError(null);
                  }}
                />
                {otpError && (
                  <Text className="text-xs font-bold text-red-500 text-center mb-2">
                    {otpError}
                  </Text>
                )}

                {/* Confirm OTP Button */}
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={verifyOtpMutation.isPending}
                  activeOpacity={0.85}
                  className="w-full bg-brand-dark active:bg-brand-darkCard py-4 rounded-2xl items-center justify-center mt-4 shadow-md shadow-black/20 border border-brand-primary/30"
                >
                  {verifyOtpMutation.isPending ? (
                    <ActivityIndicator color="#D8C911" />
                  ) : (
                    <Text className="text-base font-black text-brand-primary uppercase tracking-wider">
                      VALIDER ET CONTINUER
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Modify Phone Link */}
                <TouchableOpacity
                  onPress={() => setStep('phone')}
                  className="mt-4 py-2 items-center"
                >
                  <Text className="text-xs font-extrabold text-[#04252D]">
                    Modifier le numéro de téléphone
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Terms & Footer Info */}
            <View className="mt-6 pt-4 border-t border-gray-100 items-center">
              <Text className="text-[10px] text-gray-400 text-center leading-relaxed">
                En continuant, vous acceptez les{' '}
                <Text className="underline font-bold text-gray-600">Conditions d'utilisation</Text>{' '}
                et la{' '}
                <Text className="underline font-bold text-gray-600">Politique de confidentialité</Text>{' '}
                de Tontine Express
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
