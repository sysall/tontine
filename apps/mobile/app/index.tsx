import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../store/useOnboardingStore';

export default function IndexScreen() {
  const router = useRouter();
  const isCompleted = useOnboardingStore((state) => state.isCompleted);

  useEffect(() => {
    // Redirect to onboarding or login based on store state
    const timer = setTimeout(() => {
      if (isCompleted) {
        router.replace('/login');
      } else {
        router.replace('/onboarding');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isCompleted, router]);

  return (
    <View className="flex-1 items-center justify-center bg-brand-beige">
      <ActivityIndicator size="large" color="#FFC700" />
    </View>
  );
}
