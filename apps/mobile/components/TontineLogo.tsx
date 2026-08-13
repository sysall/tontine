import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface TontineLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const TontineLogo: React.FC<TontineLogoProps> = ({ size = 'md', showText = true }) => {
  const iconSize = size === 'sm' ? 36 : size === 'lg' ? 64 : 48;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <View className="flex-row items-center justify-center space-x-3">
      <View className="items-center justify-center rounded-2xl bg-brand-dark p-2 shadow-md">
        <Svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none">
          {/* Gold vault emblem */}
          <Rect x="6" y="8" width="36" height="32" rx="10" fill="#FFC700" />
          <Circle cx="24" cy="24" r="10" fill="#1A1A1A" />
          <Circle cx="24" cy="24" r="5" fill="#FFC700" />
          <Path d="M24 10 V14 M24 34 V38 M10 24 H14 M34 24 H38" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      </View>
      {showText && (
        <View className="flex-col">
          <Text className={`font-bold ${textSize} text-brand-dark tracking-tight`}>
            TONTINE <Text className="text-amber-500">EXPRESS</Text>
          </Text>
          <Text className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
            Épargne & Tontines en ligne 🇸🇳
          </Text>
        </View>
      )}
    </View>
  );
};
