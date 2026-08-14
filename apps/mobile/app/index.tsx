import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { useAuthStore } from '../store/useAuthStore';

export default function IndexScreen() {
  const router = useRouter();
  const isCompleted = useOnboardingStore((state) => state.isCompleted);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else if (isCompleted) {
        router.replace('/login');
      } else {
        router.replace('/onboarding');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isCompleted, isAuthenticated, router]);

  return (
    <View className="flex-1 items-center justify-center bg-brand-beige">
      <ActivityIndicator size="large" color="#FFC700" />
    </View>
  );
}
