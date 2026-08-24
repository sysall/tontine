import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Rect, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';

interface IllustrationProps {
  slideIndex: number;
}

export const OnboardingIllustration: React.FC<IllustrationProps> = ({ slideIndex }) => {
  if (slideIndex === 0) {
    // Slide 1: L'UNION FAIT LA FORCE (Grouped pots & Community hands)
    return (
      <View className="items-center justify-center w-full aspect-square max-w-[300px]">
        <Svg width="260" height="260" viewBox="0 0 260 260" fill="none">
          <Defs>
            <LinearGradient id="bgGrad1" x1="0" y1="0" x2="260" y2="260" gradientUnits="userSpaceOnUse">
              <Stop stopColor="#FAF8D6" />
              <Stop offset="1" stopColor="#F8FAF7" stopOpacity="0.8" />
            </LinearGradient>
            <LinearGradient id="brandPot" x1="60" y1="80" x2="200" y2="220" gradientUnits="userSpaceOnUse">
              <Stop stopColor="#04252D" />
              <Stop offset="1" stopColor="#0A333D" />
            </LinearGradient>
          </Defs>
          {/* Background aura circle */}
          <Circle cx="130" cy="130" r="110" fill="url(#bgGrad1)" />
          
          {/* Group Vault Pot / Safe Container */}
          <Rect x="70" y="90" width="120" height="110" rx="24" fill="url(#brandPot)" />
          <Rect x="85" y="75" width="90" height="20" rx="10" fill="#D8C911" />
          
          {/* Lime coins floating into pot */}
          <Circle cx="130" cy="45" r="18" fill="#D8C911" stroke="#FFFFFF" strokeWidth="4" />
          <Path d="M130 36 V54 M124 45 H136" stroke="#04252D" strokeWidth="2.5" strokeLinecap="round" />
          
          <Circle cx="85" cy="60" r="14" fill="#D8C911" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx="175" cy="60" r="14" fill="#D8C911" stroke="#FFFFFF" strokeWidth="3" />

          {/* People unity icons around pot */}
          <G transform="translate(130, 145)">
            <Circle cx="-30" cy="-10" r="14" fill="#FFFFFF" />
            <Circle cx="0" cy="-15" r="18" fill="#D8C911" />
            <Circle cx="30" cy="-10" r="14" fill="#FFFFFF" />
            <Path d="M-45 20 C-45 5, -15 5, -15 20" fill="#D8C911" opacity="0.8" />
            <Path d="M-20 25 C-20 5, 20 5, 20 25" fill="#D8C911" />
            <Path d="M15 20 C15 5, 45 5, 45 20" fill="#D8C911" opacity="0.8" />
          </G>
        </Svg>
      </View>
    );
  }

  if (slideIndex === 1) {
    // Slide 2: ÉCONOMISEZ À VOTRE RYTHME (Savings growth chart & Target)
    return (
      <View className="items-center justify-center w-full aspect-square max-w-[300px]">
        <Svg width="260" height="260" viewBox="0 0 260 260" fill="none">
          <Defs>
            <LinearGradient id="bgGrad2" x1="0" y1="0" x2="260" y2="260" gradientUnits="userSpaceOnUse">
              <Stop stopColor="#FAF8D6" />
              <Stop offset="1" stopColor="#F8FAF7" stopOpacity="0.7" />
            </LinearGradient>
            <LinearGradient id="chartLine" x1="40" y1="180" x2="220" y2="60" gradientUnits="userSpaceOnUse">
              <Stop stopColor="#D8C911" />
              <Stop offset="1" stopColor="#04252D" />
            </LinearGradient>
          </Defs>
          <Circle cx="130" cy="130" r="110" fill="url(#bgGrad2)" />

          {/* Card background */}
          <Rect x="45" y="65" width="170" height="130" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

          {/* Growth Chart Bars */}
          <Rect x="65" y="140" width="20" height="40" rx="6" fill="#E2E8F0" />
          <Rect x="95" y="120" width="20" height="60" rx="6" fill="#D8C911" opacity="0.5" />
          <Rect x="125" y="100" width="20" height="80" rx="6" fill="#D8C911" />
          <Rect x="155" y="80" width="20" height="100" rx="6" fill="#04252D" />

          {/* Upward Growth Arrow Path */}
          <Path d="M55 155 Q 110 130 185 75" stroke="url(#chartLine)" strokeWidth="5" strokeLinecap="round" />
          <Path d="M185 75 H165 M185 75 V95" stroke="#04252D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Target Star Badge */}
          <Circle cx="185" cy="75" r="18" fill="#D8C911" />
          <Path d="M185 67 L187.5 72 L193 72.8 L189 76.7 L190 82 L185 79.3 L180 82 L181 76.7 L177 72.8 L182.5 72 Z" fill="#04252D" />
        </Svg>
      </View>
    );
  }

  // Slide 3: SIMPLE, SÉCURISÉ & TRANSPARENT (Shield & Realtime Checkmarks)
  return (
    <View className="items-center justify-center w-full aspect-square max-w-[300px]">
      <Svg width="260" height="260" viewBox="0 0 260 260" fill="none">
        <Defs>
          <LinearGradient id="bgGrad3" x1="0" y1="0" x2="260" y2="260" gradientUnits="userSpaceOnUse">
            <Stop stopColor="#FAF8D6" />
            <Stop offset="1" stopColor="#E2E8F0" />
          </LinearGradient>
        </Defs>
        <Circle cx="130" cy="130" r="110" fill="url(#bgGrad3)" />

        {/* Security Shield Base */}
        <Path d="M130 45 L190 70 V130 C190 170 130 205 130 205 C130 205 70 170 70 130 V70 L130 45 Z" fill="#04252D" />
        <Path d="M130 55 L180 77 V128 C180 162 130 193 130 193 C130 193 80 162 80 128 V77 L130 55 Z" fill="#D8C911" />

        {/* Inner Lock & Checkmark */}
        <Circle cx="130" cy="115" r="22" fill="#04252D" />
        <Path d="M120 115 L127 122 L142 107" stroke="#D8C911" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Verified Badge Rings */}
        <Circle cx="65" cy="90" r="16" fill="#FFFFFF" />
        <Path d="M59 90 L63 94 L71 86" stroke="#D8C911" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        <Circle cx="195" cy="150" r="16" fill="#FFFFFF" />
        <Path d="M189 150 L193 154 L201 146" stroke="#D8C911" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
};
