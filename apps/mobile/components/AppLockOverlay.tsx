import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheckIcon, FingerprintIcon } from './Icons';
import { TontineLogo } from './TontineLogo';
import { useAppLockStore } from '../store/useAppLockStore';
import { useAuthStore } from '../store/useAuthStore';
import { secureStorage } from '../store/secureStorage';
import { biometricsService } from '../services/biometricsService';

export const AppLockOverlay: React.FC = () => {
  const { isLocked, unlock } = useAppLockStore();
  const { user, logout } = useAuthStore();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [biometryTitle, setBiometryTitle] = useState('Biométrie');
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  // Vérifier la disponibilité de la biométrie
  useEffect(() => {
    let mounted = true;
    (async () => {
      const isAvailable = await biometricsService.isHardwareAvailable();
      const isEnabled = await biometricsService.isBiometricsEnabled();
      const title = await biometricsService.getBiometryTitle();

      if (mounted) {
        setBiometryTitle(title);
        setCanUseBiometrics(isAvailable && isEnabled);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isLocked]);

  // Déclencher automatiquement la biométrie quand l'écran se verrouille
  const triggerBiometrics = useCallback(async () => {
    if (!canUseBiometrics) return;
    const success = await biometricsService.authenticate(`Déverrouiller avec ${biometryTitle}`);
    if (success) {
      setPin('');
      setErrorMsg(null);
      unlock();
    }
  }, [canUseBiometrics, biometryTitle, unlock]);

  useEffect(() => {
    if (isLocked && canUseBiometrics) {
      triggerBiometrics();
    }
  }, [isLocked, canUseBiometrics, triggerBiometrics]);

  // Vérification du PIN saisi
  const handleVerifyPin = async (inputPin: string) => {
    if (inputPin.length !== 4) return;
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const isValid = await secureStorage.verifyPin(inputPin);
      if (isValid) {
        setPin('');
        setErrorMsg(null);
        unlock();
      } else {
        setErrorMsg('Code secret incorrect. Veuillez réessayer.');
        setPin('');
      }
    } catch {
      setErrorMsg('Erreur de validation du code secret.');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handleVerifyPin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg(null);
    }
  };

  if (!isLocked) return null;

  return (
    <Modal visible={isLocked} animationType="fade" transparent={false}>
      <SafeAreaView className="flex-1 bg-[#173F73] justify-between px-6 py-8">
        {/* Top Header & Brand */}
        <View className="items-center mt-6">
          <TontineLogo size="lg" />
          <Text className="text-xl font-black text-white mt-4 uppercase tracking-wider">
            Tontine Express 🔒
          </Text>
          <Text className="text-xs text-emerald-400 font-semibold mt-1">
            {user?.fullName || user?.phoneNumber || 'Session Protégée'}
          </Text>
        </View>

        {/* PIN Code Dots Container */}
        <View className="items-center my-6">
          <Text className="text-sm font-bold text-gray-200 mb-6 text-center">
            Saisissez votre code secret à 4 chiffres
          </Text>

          {/* 4 Dots */}
          <View className="flex-row space-x-5 mb-4">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <View
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 ${
                    isFilled
                      ? 'bg-emerald-400 border-emerald-400 shadow-md shadow-emerald-400/50'
                      : 'border-white/40 bg-white/10'
                  }`}
                />
              );
            })}
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <Text className="text-xs font-bold text-red-300 text-center mt-2 px-4">
              {errorMsg}
            </Text>
          ) : isVerifying ? (
            <ActivityIndicator size="small" color="#34D399" className="mt-2" />
          ) : null}
        </View>

        {/* Custom Numeric Keypad */}
        <View className="items-center px-4 mb-4">
          <View className="w-full max-w-[280px]">
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              ['bio', '0', 'del'],
            ].map((row, rowIdx) => (
              <View key={rowIdx} className="flex-row justify-between mb-3">
                {row.map((btn) => {
                  if (btn === 'bio') {
                    return canUseBiometrics ? (
                      <TouchableOpacity
                        key={btn}
                        onPress={triggerBiometrics}
                        activeOpacity={0.7}
                        className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/40 items-center justify-center"
                      >
                        <FingerprintIcon size={26} color="#34D399" />
                      </TouchableOpacity>
                    ) : (
                      <View key={btn} className="w-16 h-16" />
                    );
                  }

                  if (btn === 'del') {
                    return (
                      <TouchableOpacity
                        key={btn}
                        onPress={handleDelete}
                        activeOpacity={0.7}
                        className="w-16 h-16 rounded-full bg-white/10 items-center justify-center"
                      >
                        <Text className="text-lg font-bold text-white">⌫</Text>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={btn}
                      onPress={() => handleKeyPress(btn)}
                      activeOpacity={0.7}
                      className="w-16 h-16 rounded-full bg-white/10 active:bg-white/25 items-center justify-center border border-white/10"
                    >
                      <Text className="text-2xl font-black text-white">{btn}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Footer Actions */}
        <View className="items-center pt-2">
          {canUseBiometrics && (
            <TouchableOpacity
              onPress={triggerBiometrics}
              activeOpacity={0.8}
              className="flex-row items-center space-x-2 py-2 mb-2"
            >
              <FingerprintIcon size={18} color="#34D399" />
              <Text className="text-xs font-bold text-emerald-400">
                Déverrouiller avec {biometryTitle}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.7}
            className="py-2"
          >
            <Text className="text-xs font-semibold text-white/50 underline">
              Se déconnecter de ce compte
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
