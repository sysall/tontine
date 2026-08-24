import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { SegmentedProgress } from '../components/SegmentedProgress';
import { OnboardingIllustration } from '../components/OnboardingIllustration';
import { TontineLogo } from '../components/TontineLogo';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'slide-1',
    title: "L'UNION FAIT LA FORCE !",
    subtitle: 'Créez des coffres groupés et tontines avec vos proches en toute simplicité.',
    badge: 'Coffres Groupés',
  },
  {
    id: 'slide-2',
    title: 'ÉCONOMISEZ À VOTRE RYTHME',
    subtitle: 'Planifiez vos cotisations et atteignez vos objectifs financiers plus rapidement.',
    badge: 'Objectifs d\'Épargne',
  },
  {
    id: 'slide-3',
    title: 'SIMPLE, SÉCURISÉ & TRANSPARENT',
    subtitle: 'Suivez vos versements en temps réel et recevez vos gains en toute sécurité.',
    badge: '100% Sécurisé',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { currentSlideIndex, setSlideIndex, nextSlide, completeOnboarding } = useOnboardingStore();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(contentOffsetX / width);
    if (pageIndex !== currentSlideIndex && pageIndex >= 0 && pageIndex < SLIDES.length) {
      setSlideIndex(pageIndex);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      const nextIdx = currentSlideIndex + 1;
      nextSlide();
      scrollViewRef.current?.scrollTo({ x: nextIdx * width, animated: true });
    } else {
      completeOnboarding();
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-beige justify-between">
      {/* Header section with Logo & Skip link */}
      <View className="px-6 pt-2 flex-row items-center justify-between">
        <TontineLogo size="sm" showText />
        <TouchableOpacity
          onPress={handleSkip}
          activeOpacity={0.7}
          className="px-3 py-1.5 rounded-full bg-gray-100"
        >
          <Text className="text-xs font-semibold text-gray-600">Passer</Text>
        </TouchableOpacity>
      </View>

      {/* Top Segmented Progress Bar */}
      <SegmentedProgress totalSteps={SLIDES.length} currentStep={currentSlideIndex} />

      {/* Center Carousel Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide, index) => (
          <View
            key={slide.id}
            style={{ width }}
            className="flex-1 items-center justify-center px-8 py-4"
          >
            {/* Category Tag Badge */}
            <View className="mb-4 px-3.5 py-1 bg-amber-100 rounded-full border border-amber-300">
              <Text className="text-xs font-black text-amber-900 uppercase tracking-wider">
                {slide.badge}
              </Text>
            </View>

            {/* Central SVG Illustration */}
            <OnboardingIllustration slideIndex={index} />

            {/* Title & Description text */}
            <View className="mt-8 items-center">
              <Text className="text-2xl font-extrabold text-brand-dark text-center tracking-tight uppercase mb-3">
                {slide.title}
              </Text>
              <Text className="text-base text-gray-600 text-center leading-relaxed max-w-[320px]">
                {slide.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Action Section */}
      <View className="px-6 pb-6 pt-2">
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          className="w-full bg-brand-dark active:bg-brand-darkCard py-4 rounded-2xl items-center justify-center shadow-lg shadow-black/20 flex-row space-x-2 border border-brand-primary/30"
        >
          <Text className="text-lg font-black text-brand-primary tracking-wider uppercase">
            {currentSlideIndex === SLIDES.length - 1 ? 'COMMENCER' : 'SUIVANT'}
          </Text>
          <Text className="text-xl font-bold text-brand-primary">→</Text>
        </TouchableOpacity>

        {/* Dynamic page hint */}
        <Text className="text-center text-xs text-gray-400 font-medium mt-3">
          Étape {currentSlideIndex + 1} sur {SLIDES.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}
