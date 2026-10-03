import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { kycApi, KycUploadResponse } from '../api/kycApi';

interface KycUploadModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  clientName: string;
  clientPhone: string;
  onKycCompleted?: (result: KycUploadResponse) => void;
}

export const KycUploadModal: React.FC<KycUploadModalProps> = ({
  visible,
  onClose,
  userId,
  clientName,
  clientPhone,
  onKycCompleted,
}) => {
  const [docType, setDocType] = useState<'CNI_CEDEAO' | 'PASSPORT'>('CNI_CEDEAO');

  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [kycResult, setKycResult] = useState<KycUploadResponse | null>(null);

  // Demander les permissions appareil photo
  const requestPermissions = async () => {
    if (Platform.OS === 'web') return true;
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      const libraryPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraPerm?.status !== 'granted' || libraryPerm?.status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'accès à l\'appareil photo et à la galerie est requis pour capturer vos pièces d\'identité.'
        );
        return false;
      }
    } catch (e) {
      return true;
    }
    return true;
  };

  // 1. Prendre photo CNI / Passeport (Caméra)
  const takeDocumentPhoto = async (target: 'front' | 'back') => {
    const hasPerm = await requestPermissions();
    if (!hasPerm) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        if (target === 'front') setFrontImage(base64Data);
        else setBackImage(base64Data);
      }
    } catch (e: any) {
      Alert.alert('Erreur Caméra', e.message || 'Impossible de prendre la photo.');
    }
  };

  // 2. Prendre un Selfie (Caméra Avant)
  const takeSelfie = async () => {
    const hasPerm = await requestPermissions();
    if (!hasPerm) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setSelfieImage(base64Data);
      }
    } catch (e: any) {
      Alert.alert('Erreur Selfie', e.message || 'Impossible de prendre le selfie.');
    }
  };

  // 4. Soumission et Traitement Backend + Google Cloud Vision OCR
  const handleSubmitKyc = async () => {
    if (!frontImage) {
      Alert.alert('Photo manquante', 'Veuillez prendre une photo du recto de votre pièce d\'identité.');
      return;
    }

    if (!selfieImage) {
      Alert.alert('Selfie manquant', 'Veuillez prendre un selfie pour vérifier votre identité.');
      return;
    }

    setIsLoading(true);
    setKycResult(null);

    try {
      const response = await kycApi.uploadKyc({
        userId: userId || 'user_demo_1',
        clientName: clientName || 'Client Express',
        clientPhone: clientPhone || '770000000',
        documentType: docType,
        documentFrontBase64: frontImage,
        documentBackBase64: backImage || undefined,
        selfieBase64: selfieImage,
      });

      setKycResult(response);
      if (onKycCompleted) {
        onKycCompleted(response);
      }
    } catch (err: any) {
      Alert.alert('Erreur KYC', err.message || 'Le téléversement a échoué. Veuillez réespérer.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFrontImage(null);
    setBackImage(null);
    setSelfieImage(null);
    setKycResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-[32px] p-6 max-h-[92%] shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <View>
              <Text className="text-xl font-black text-brand-dark uppercase tracking-tight">
                Vérification KYC & CNI
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
              <Text className="text-lg font-bold text-gray-500">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {kycResult ? (
              /* Résultat du téléversement KYC pour vérification manuelle */
              <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-4">
                <Text className="text-emerald-800 text-lg font-black mb-2">
                  ⏳ Documents Soumis avec Succès
                </Text>

                <Text className="text-xs text-emerald-700 mb-4 font-medium leading-relaxed">
                  {kycResult.message || 'Vos pièces d\'identité et votre selfie ont été sauvegardés. L\'équipe d\'administration va vérifier vos documents sous peu pour valider votre compte.'}
                </Text>

                <TouchableOpacity
                  onPress={resetForm}
                  className="w-full bg-brand-primary py-3.5 rounded-xl items-center shadow-sm"
                >
                  <Text className="text-white font-bold text-sm uppercase">TERMINER</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Choix du Type de Document */}
                <Text className="text-xs font-bold text-gray-600 mb-2 uppercase">
                  1. Type de pièce d'identité
                </Text>
                <View className="flex-row gap-2 mb-4">
                  <TouchableOpacity
                    onPress={() => setDocType('CNI_CEDEAO')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border items-center ${docType === 'CNI_CEDEAO' ? 'bg-brand-primary/10 border-brand-primary' : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <Text className={`text-xs font-bold ${docType === 'CNI_CEDEAO' ? 'text-brand-primary' : 'text-gray-600'}`}>
                      CNI CEDEAO
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setDocType('PASSPORT')}
                    className={`flex-1 py-2.5 px-3 rounded-xl border items-center ${docType === 'PASSPORT' ? 'bg-brand-primary/10 border-brand-primary' : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <Text className={`text-xs font-bold ${docType === 'PASSPORT' ? 'text-brand-primary' : 'text-gray-600'}`}>
                      PASSEPORT
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Photo Recto CNI / Passeport */}
                <Text className="text-xs font-bold text-gray-600 mb-2 uppercase">
                  2. Photo Recto du Document *
                </Text>
                <View className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 mb-4 items-center">
                  {frontImage ? (
                    <View className="w-full items-center">
                      <Image source={{ uri: frontImage }} className="w-full h-36 rounded-xl mb-3" resizeMode="cover" />
                      <TouchableOpacity
                        onPress={() => takeDocumentPhoto('front')}
                        className="bg-brand-primary/10 py-1.5 px-3 rounded-lg"
                      >
                        <Text className="text-xs font-bold text-brand-primary">Refaire Photo Recto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="w-full items-center py-2">
                      <Text className="text-sm font-semibold text-gray-600 mb-3">
                        Prenez en photo le recto lisible de votre {docType}
                      </Text>
                      <TouchableOpacity
                        onPress={() => takeDocumentPhoto('front')}
                        className="w-full bg-brand-primary py-3 rounded-xl items-center shadow-sm"
                      >
                        <Text className="text-white text-xs font-bold uppercase tracking-wider">PRENDRE PHOTO RECTO</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* 3. Photo Verso (Si CNI) */}
                {docType === 'CNI_CEDEAO' && (
                  <>
                    <Text className="text-xs font-bold text-gray-600 mb-2 uppercase">
                      3. Photo Verso du Document
                    </Text>
                    <View className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 mb-4 items-center">
                      {backImage ? (
                        <View className="w-full items-center">
                          <Image source={{ uri: backImage }} className="w-full h-36 rounded-xl mb-3" resizeMode="cover" />
                          <TouchableOpacity
                            onPress={() => takeDocumentPhoto('back')}
                            className="bg-brand-primary/10 py-1.5 px-3 rounded-lg"
                          >
                            <Text className="text-xs font-bold text-brand-primary">Refaire Photo Verso</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View className="w-full items-center py-2">
                          <Text className="text-xs text-gray-500 mb-2">Photo du verso de la carte CNI</Text>
                          <TouchableOpacity
                            onPress={() => takeDocumentPhoto('back')}
                            className="w-full bg-gray-200 py-2.5 rounded-xl items-center"
                          >
                            <Text className="text-gray-700 text-xs font-bold">PRENDRE PHOTO VERSO</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* 4. Prise d'un Selfie */}
                <Text className="text-xs font-bold text-gray-600 mb-2 uppercase">
                  {docType === 'CNI_CEDEAO' ? '4' : '3'}. Selfie Visage de Contrôle *
                </Text>
                <View className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-4 mb-5 items-center">
                  {selfieImage ? (
                    <View className="items-center">
                      <Image source={{ uri: selfieImage }} className="w-24 h-24 rounded-full mb-3" resizeMode="cover" />
                      <TouchableOpacity
                        onPress={takeSelfie}
                        className="bg-brand-primary/10 py-1.5 px-3 rounded-lg"
                      >
                        <Text className="text-xs font-bold text-brand-primary">Refaire Selfie</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="w-full items-center py-2">
                      <Text className="text-xs text-gray-500 mb-3 text-center">
                        Prenez un selfie rapide pour la comparaison de sécurité visuelle avec la photo CNI.
                      </Text>
                      <TouchableOpacity
                        onPress={takeSelfie}
                        className="w-full bg-emerald-600 py-3 rounded-xl items-center shadow-sm"
                      >
                        <Text className="text-white text-xs font-bold">PRENDRE UN SELFIE</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Bouton de Soumission */}
                <TouchableOpacity
                  onPress={handleSubmitKyc}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl items-center shadow-md ${isLoading ? 'bg-gray-400' : 'bg-brand-primary active:bg-brand-primaryHover'
                    }`}
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text className="text-white font-bold text-sm uppercase">
                        ANALYSE OCR VISION EN COURS...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-base font-black text-white uppercase tracking-wider">
                      TRANSMETTRE & VALIDER PAR OCR
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
