import { Platform } from 'react-native';
import { auth as webAuth } from '../config/firebase';

const rawApiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!rawApiUrl && typeof __DEV__ !== 'undefined' && !__DEV__) {
  console.warn('[SECURITY WARNING] EXPO_PUBLIC_API_URL non configuré en production.');
}
const API_BASE_URL = rawApiUrl || 'http://localhost:3000/api/v1';

/**
 * Returns a valid, fresh Firebase ID token.
 * Firebase automatically refreshes expired tokens under the hood when getIdToken() is called.
 */
export async function getFreshIdToken(): Promise<string | null> {
  try {
    if (Platform.OS !== 'web') {
      try {
        const rnfbAuth = require('@react-native-firebase/auth').default;
        const nativeUser = rnfbAuth().currentUser;
        if (nativeUser) {
          return await nativeUser.getIdToken();
        }
      } catch (e) {
        // Fallback to JS SDK if native module not ready
      }
    }

    if (webAuth?.currentUser) {
      return await webAuth.currentUser.getIdToken();
    }
  } catch (error) {
    console.warn('Erreur lors de la récupération du token Firebase:', error);
  }
  return null;
}

/**
 * Authorized HTTP fetch wrapper:
 * 1. Injects Authorization: Bearer <fresh Firebase ID token>
 * 2. Parses JSON responses
 * 3. Rejects with proper server error messages
 */
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getFreshIdToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data && (Array.isArray(data.message) ? data.message.join(', ') : data.message);
    throw new Error(errorMsg || `Erreur API (${response.status})`);
  }

  return data as T;
}

export { API_BASE_URL };
