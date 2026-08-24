import React from 'react';
import { View } from 'react-native';

interface SegmentedProgressProps {
  totalSteps: number;
  currentStep: number;
}

export const SegmentedProgress: React.FC<SegmentedProgressProps> = ({
  totalSteps,
  currentStep,
}) => {
  return (
    <View className="flex-row items-center justify-between w-full px-6 py-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isActive = index === currentStep;
        const isPast = index < currentStep;

        return (
          <View
            key={index}
            className={`h-2 flex-1 rounded-full mx-1 transition-all duration-300 ${
              isActive
                ? 'bg-brand-primary w-full shadow-sm'
                : isPast
                ? 'bg-brand-primary/60'
                : 'bg-gray-200'
            }`}
          />
        );
      })}
    </View>
  );
};
