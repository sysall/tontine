import React from 'react';
import { View, Image, Text } from 'react-native';

interface TontineLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const TontineLogo: React.FC<TontineLogoProps> = ({ size = 'md', showText = true }) => {
  const iconDimensions = size === 'sm' ? { width: 38, height: 38 } : size === 'lg' ? { width: 68, height: 68 } : { width: 52, height: 52 };
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <View className="flex-row items-center justify-center space-x-3">
      {/* Official App Icon Badge */}
      <Image
        source={require('../assets/images/icon-cropped.png')}
        style={{ width: iconDimensions.width, height: iconDimensions.height, borderRadius: 12 }}
        resizeMode="contain"
      />

      {showText && (
        <View className="flex-col">
          <Text className={`font-black ${textSize} text-[#173F73] tracking-tight`}>
            TONTINE <Text className="text-[#19A66A]">EXPRESS</Text>
          </Text>
          <Text className="text-[10px] uppercase tracking-widest text-gray-500 font-extrabold">
            Together Further
          </Text>
        </View>
      )}
    </View>
  );
};

