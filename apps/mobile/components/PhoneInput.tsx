import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  error,
  disabled = false,
}) => {
  // Format input strictly for numeric Sénégal phone (ex: 77 123 45 67)
  const handleChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= 9) {
      onChangeText(numeric);
    }
  };

  return (
    <View className="w-full my-2">
      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
        Numéro de téléphone
      </Text>
      
      <View
        className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-3.5 transition-all ${
          error
            ? 'border-red-500 bg-red-50/20'
            : value.length === 9
            ? 'border-emerald-500 bg-emerald-50/10'
            : 'border-gray-300 focus:border-brand-dark'
        }`}
      >
        {/* Country Code Prefix Badge */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center pr-3 border-r border-gray-300 space-x-1.5"
        >
          <Text className="text-xl">🇸🇳</Text>
          <Text className="text-base font-bold text-brand-dark">+221</Text>
        </TouchableOpacity>

        {/* Numeric Phone Number Field */}
        <TextInput
          className="flex-1 text-lg font-semibold text-brand-dark pl-3 tracking-widest"
          placeholder="77 123 45 67"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={9}
          value={value}
          onChangeText={handleChange}
          editable={!disabled}
          autoFocus
        />

        {/* Format guide icon when valid */}
        {value.length === 9 && (
          <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
        )}
      </View>

      {/* Operator hints & validation errors */}
      {error ? (
        <Text className="text-xs font-medium text-red-500 mt-1.5 ml-1">{error}</Text>
      ) : (
        <Text className="text-[11px] text-gray-500 mt-1.5 ml-1">
          Opérateurs acceptés : Orange (77/78), Free (76), Expresso (70), Promobile (75)
        </Text>
      )}
    </View>
  );
};
