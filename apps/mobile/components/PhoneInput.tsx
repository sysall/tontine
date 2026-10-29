import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { COUNTRIES, DEFAULT_COUNTRY, Country } from '../constants/countries';
import { ChevronDownIcon, SearchIcon, CloseIcon, CheckIcon } from './Icons';

export { Country, DEFAULT_COUNTRY, COUNTRIES };

export interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  selectedCountry?: Country;
  onSelectCountry?: (country: Country) => void;
  countryCode?: string;
  onCountryCodeChange?: (dialCode: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  selectedCountry,
  onSelectCountry,
  countryCode,
  onCountryCodeChange,
  error,
  disabled = false,
}) => {
  const [internalCountry, setInternalCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine current active country
  const currentCountry: Country = useMemo(() => {
    if (selectedCountry) return selectedCountry;
    if (countryCode) {
      const match = COUNTRIES.find((c) => c.dialCode === countryCode);
      if (match) return match;
    }
    return internalCountry;
  }, [selectedCountry, countryCode, internalCountry]);

  // Filter countries by name, code, or dial code with accent insensitivity
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!q) return COUNTRIES;
    const cleanQ = q.replace('+', '');
    return COUNTRIES.filter((c) => {
      const normName = c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cleanDial = c.dialCode.replace('+', '');
      return (
        normName.includes(q) ||
        cleanDial.includes(cleanQ) ||
        c.code.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  const handleSelectCountry = (country: Country) => {
    setInternalCountry(country);
    if (onSelectCountry) onSelectCountry(country);
    if (onCountryCodeChange) onCountryCodeChange(country.dialCode);
    setIsModalOpen(false);
    setSearchQuery('');
  };

  const maxLen = currentCountry.maxLength || 15;

  const handleChange = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric.length <= maxLen) {
      onChangeText(numeric);
    }
  };

  const isComplete =
    currentCountry.code === 'SN'
      ? value.length === 9
      : value.length >= 6 && value.length <= maxLen;

  return (
    <View className="w-full my-2">
      <Text className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
        Numéro de téléphone
      </Text>

      <View
        className={`flex-row items-center bg-gray-50 border rounded-2xl px-4 py-3.5 transition-all ${error
            ? 'border-red-500 bg-red-50/20'
            : isComplete
              ? 'border-emerald-500 bg-emerald-50/10'
              : 'border-gray-300 focus:border-brand-dark'
          }`}
      >
        {/* Country Code Prefix Badge / Select Box */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => !disabled && setIsModalOpen(true)}
          disabled={disabled}
          className="flex-row items-center pr-3 border-r border-gray-300 space-x-1.5"
          accessibilityLabel={`Sélectionner un pays. Actuel : ${currentCountry.name} (${currentCountry.dialCode})`}
          accessibilityRole="button"
        >
          <Text className="text-xl">{currentCountry.flag}</Text>
          <Text className="text-base font-bold text-brand-dark ml-1">
            {currentCountry.dialCode}
          </Text>
          <View className="ml-1 opacity-70">
            <ChevronDownIcon size={14} color="#173F73" />
          </View>
        </TouchableOpacity>

        {/* Numeric Phone Number Field */}
        <TextInput
          className="flex-1 text-lg font-semibold text-brand-dark pl-3 tracking-widest"
          placeholder={currentCountry.placeholder || '77 123 45 67'}
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={maxLen}
          value={value}
          onChangeText={handleChange}
          editable={!disabled}
          autoFocus
        />
      </View>

      {/* Operator hints & validation errors */}
      {error ? (
        <Text className="text-xs font-medium text-red-500 mt-1.5 ml-1">{error}</Text>
      ) : (
        <Text className="text-[11px] text-gray-500 mt-1.5 ml-1">
          {currentCountry.code === 'SN'
            ? 'Tous les opérateurs sont acceptés'
            : `Format attendu pour ${currentCountry.name} (${currentCountry.dialCode})`}
        </Text>
      )}

      {/* Country Selection Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)', justifyContent: 'flex-end' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsModalOpen(false)}
            style={{ flex: 1 }}
          />

          <View
            style={{
              maxHeight: '85%',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 12,
              paddingBottom: Platform.OS === 'ios' ? 24 : 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 20,
            }}
          >
            {/* Top Grabber Handle */}
            <View className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />

            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pb-3 border-b border-gray-100">
              <View>
                <Text className="text-lg font-bold text-brand-dark">Sélectionner un pays</Text>
                <Text className="text-xs text-gray-500">
                  {COUNTRIES.length} pays disponibles
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalOpen(false)}
                activeOpacity={0.7}
                className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center"
              >
                <CloseIcon size={18} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Search Input Box */}
            <View className="px-5 pt-3 pb-2">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-3.5 py-2.5 border border-gray-200">
                <SearchIcon size={18} color="#9CA3AF" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Rechercher un pays ou un code (+221)..."
                  placeholderTextColor="#9CA3AF"
                  autoCorrect={false}
                  autoCapitalize="none"
                  clearButtonMode="while-editing"
                  className="flex-1 ml-2.5 text-sm font-semibold text-gray-800"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <CloseIcon size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => `${item.code}-${item.dialCode}`}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={25}
              windowSize={10}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
              renderItem={({ item }) => {
                const isSelected =
                  currentCountry.code === item.code &&
                  currentCountry.dialCode === item.dialCode;

                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelectCountry(item)}
                    className={`flex-row items-center justify-between py-3 px-3.5 rounded-xl my-0.5 ${isSelected
                        ? 'bg-emerald-50 border border-emerald-300'
                        : 'active:bg-gray-50'
                      }`}
                  >
                    <View className="flex-row items-center flex-1 pr-3">
                      <Text className="text-2xl mr-3">{item.flag}</Text>
                      <View className="flex-1">
                        <Text
                          className={`text-sm font-medium ${isSelected ? 'text-emerald-900 font-bold' : 'text-gray-800'
                            }`}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text className="text-[11px] text-gray-400 font-medium">
                          {item.code}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center space-x-2">
                      <Text
                        className={`text-sm font-bold ${isSelected ? 'text-emerald-700' : 'text-brand-dark'
                          }`}
                      >
                        {item.dialCode}
                      </Text>
                      {isSelected && (
                        <View className="ml-2 w-5 h-5 rounded-full bg-emerald-500 items-center justify-center">
                          <CheckIcon size={13} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="py-12 items-center justify-center">
                  <Text className="text-base font-semibold text-gray-700 mb-1">
                    Aucun résultat
                  </Text>
                  <Text className="text-xs text-gray-400 text-center px-6">
                    Aucun pays ne correspond à « {searchQuery} »
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-lg"
                  >
                    <Text className="text-xs font-semibold text-brand-dark">
                      Réinitialiser la recherche
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
