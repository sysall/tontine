import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Universal secure storage:
 * Uses iOS Keychain / Android KeyStore on native devices via expo-secure-store.
 * Falls back to AsyncStorage on web.
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[secureStorage] Failed to set ${key}:`, e);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS !== 'web') {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[secureStorage] Failed to get ${key}:`, e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[secureStorage] Failed to delete ${key}:`, e);
    }
  },

  /**
   * Hashes a 4-digit PIN with a fixed application salt and stores it in secure storage.
   */
  async savePin(pin: string): Promise<void> {
    const salt = 'tontine_express_pin_salt_v1';
    let hash = 0;
    const combined = `${salt}:${pin.trim()}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    await this.setItem('user_security_pin', hash.toString());
  },

  async verifyPin(enteredPin: string): Promise<boolean> {
    const storedHash = await this.getItem('user_security_pin');
    if (!storedHash) return false;
    const salt = 'tontine_express_pin_salt_v1';
    let hash = 0;
    const combined = `${salt}:${enteredPin.trim()}`;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return storedHash === hash.toString();
  },

  async hasPin(): Promise<boolean> {
    const stored = await this.getItem('user_security_pin');
    return !!stored;
  },

  async removePin(): Promise<void> {
    await this.removeItem('user_security_pin');
  },
};
