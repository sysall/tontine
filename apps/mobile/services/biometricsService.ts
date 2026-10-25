import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { secureStorage } from '../store/secureStorage';

export const biometricsService = {
  /**
   * Vérifie si l'appareil dispose du matériel biométrique et si au moins une empreinte/visage est enregistré.
   */
  async isHardwareAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch {
      return false;
    }
  },

  /**
   * Retourne le type de biométrie supporté (Face ID, Empreinte digitale ou Biométrie générique).
   */
  async getBiometryTitle(): Promise<string> {
    if (Platform.OS === 'web') return 'Biométrie';
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      }
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Empreinte Digitale';
      }
      if (types.length > 0) {
        return 'Biométrie';
      }
      return 'Biométrie';
    } catch {
      return 'Biométrie';
    }
  },

  /**
   * Vérifie si l'utilisateur a activé la biométrie dans les paramètres de son compte.
   */
  async isBiometricsEnabled(): Promise<boolean> {
    try {
      const val = await secureStorage.getItem('biometrics_enabled');
      return val === 'true';
    } catch {
      return false;
    }
  },

  /**
   * Active ou désactive l'authentification biométrique.
   */
  async setBiometricsEnabled(enabled: boolean): Promise<void> {
    await secureStorage.setItem('biometrics_enabled', enabled ? 'true' : 'false');
  },

  /**
   * Déclenche la modale système d'authentification biométrique (Face ID / Empreinte).
   */
  async authenticate(promptMessage: string = 'Déverrouiller Tontine Express'): Promise<boolean> {
    try {
      const available = await this.isHardwareAvailable();
      if (!available) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Utiliser le code PIN',
        cancelLabel: 'Annuler',
        disableDeviceFallback: true,
      });

      return result.success;
    } catch (e) {
      console.warn('Erreur authentification biométrique:', e);
      return false;
    }
  },
};
