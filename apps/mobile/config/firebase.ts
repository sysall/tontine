import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const getAuthPersistence = () => {
  if (Platform.OS === 'web') {
    return browserLocalPersistence;
  }
  const getRnPersistence = (FirebaseAuth as any).getReactNativePersistence;
  if (typeof getRnPersistence === 'function') {
    return getRnPersistence(AsyncStorage);
  }
  return inMemoryPersistence;
};

let authInstance;
try {
  authInstance = initializeAuth(app, {
    persistence: getAuthPersistence(),
  });
} catch (e) {
  authInstance = getAuth(app);
}

export const auth = authInstance;
export default app;
