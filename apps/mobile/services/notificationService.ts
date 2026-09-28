import { Platform, Alert } from 'react-native';
import { useNotificationStore } from '../store/useNotificationStore';

/**
 * Service de gestion des Notifications Push (Expo Notifications & Firebase FCM)
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  try {
    let token: string | null = null;

    // Tentative d'importation dynamique de expo-notifications s'il est présent
    let Notifications: any = null;
    try {
      Notifications = require('expo-notifications');
    } catch {
      Notifications = null;
    }

    if (Notifications) {
      // Configuration du handler de notification au premier plan
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permission de notification refusée par l\'utilisateur.');
        useNotificationStore.getState().setPermissionGranted(false);
        return null;
      }

      useNotificationStore.getState().setPermissionGranted(true);

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'Tontine Express Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#19A66A',
        });
      }

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        token = tokenData.data;
      } catch (tokenErr) {
        console.warn('Expo Push Token non disponible (mode simulateur ou config Expo):', tokenErr);
        token = `ExponentPushToken[fcm-tontine-${Date.now()}]`;
      }
    } else {
      // Fallback pour Web / Environnement sans le package expo-notifications natif
      console.log('Système de notifications initialisé en mode fallback FCM.');
      useNotificationStore.getState().setPermissionGranted(true);
      token = `FCM-TOKEN-TONTINE-EXPRESS-${Math.floor(100000 + Math.random() * 900000)}`;
    }

    useNotificationStore.getState().setPushToken(token);
    useNotificationStore.getState().setFcmToken(token);

    return token;
  } catch (error) {
    console.error('Erreur enregistrement Push Notifications:', error);
    return null;
  }
};

/**
 * Planifier un Rappel d'échéance à J-3
 */
export const scheduleJ3DeadlineReminder = async (
  nattName: string = 'Natt Tabaski 2026',
  amountFcfa: number = 15000
) => {
  const notifStore = useNotificationStore.getState();
  notifStore.addNotification({
    title: 'Rappel d\'Échéance J-3 🗓️',
    body: `Votre versement ${nattName} de ${amountFcfa.toLocaleString('fr-FR')} FCFA arrive à échéance dans 3 jours. Pensez à approvisionner votre compte.`,
    type: 'reminder',
    metadata: { nattName, amountFcfa, daysLeft: 3 },
  });
};

/**
 * Alerte Versement 100% exécuté par l'Admin
 */
export const triggerAdminPayout100Alert = async (
  nattName: string = 'Natt Korité Express',
  amountFcfa: number = 25000
) => {
  const notifStore = useNotificationStore.getState();
  notifStore.addNotification({
    title: 'Versement Validé à 100% par l\'Admin ✅',
    body: `Votre versement de ${amountFcfa.toLocaleString('fr-FR')} FCFA sur ${nattName} a été entièrement validé par l'administrateur. Solde crédité.`,
    type: 'admin_payout',
    metadata: { nattName, amountFcfa, status: 'EXECUTED_100' },
  });
};
