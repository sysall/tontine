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
      {/* Official T+E Monogram Container */}
      <View className="items-center justify-center rounded-2xl bg-[#D8C911] p-2 shadow-md">
        <Svg width={iconSize} height={iconSize} viewBox="0 0 100 100" fill="none">
          {/* Top T-bar & E-loop Monogram Path */}
          <Path
            d="M 12 18 H 82 V 32 H 58 C 70 32 82 40 82 52 C 82 64 70 72 54 72 H 38 C 28 72 24 64 28 54 C 32 46 42 46 54 46 H 68 V 34 H 46 C 26 34 16 48 16 64 C 16 78 30 86 52 86 H 82 V 72 C 82 72 60 72 52 72 C 38 72 30 64 30 52 C 30 40 40 32 54 32 H 34 V 86 H 12 V 18 Z"
            fill="#04252D"
          />
        </Svg>
      </View>

      {showText && (
        <View className="flex-col">
          <Text className={`font-black ${textSize} text-[#04252D] tracking-tight`}>
            TONTINE <Text className="text-[#D8C911]">EXPRESS</Text>
          </Text>
          <Text className="text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
            Épargne & Tontines en ligne
          </Text>
        </View>
      )}
    </View>
  );
};
