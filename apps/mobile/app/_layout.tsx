import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '../api/queryClient';
import { useAuthStore } from '../store/useAuthStore';
import { secureStorage } from '../store/secureStorage';
import { useAppLockStore } from '../store/useAppLockStore';
import { AppLockOverlay } from '../components/AppLockOverlay';
import '../global.css';

function NavigationStack() {
  const segments = useSegments();
  const router = useRouter();
  const { isAuthenticated, isLoaded } = useAuthStore();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Ne vérifier les redirections qu'une fois la session sécurisée réhydratée
    if (!isLoaded) return;

    const currentScreen = segments[0] as string | undefined;
    const publicScreens = ['index', 'onboarding', 'login', undefined];
    const isPublic = publicScreens.includes(currentScreen);

    if (!isPublic && !isAuthenticated) {
      router.replace('/login');
    }
  }, [segments, isAuthenticated, isLoaded, router]);

  // Écouter le passage en arrière-plan et le retour au premier plan pour verrouiller l'application
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (isAuthenticated) {
          const hasPin = await secureStorage.hasPin();
          if (hasPin) {
            useAppLockStore.getState().setLocked(true);
          }
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FDFBF7' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="my-tontines" />
      <Stack.Screen name="natt-recap" />
      <Stack.Screen name="contribute" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor="#FDFBF7" />
        <NavigationStack />
        <AppLockOverlay />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

