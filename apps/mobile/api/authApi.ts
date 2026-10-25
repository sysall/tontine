import { apiFetch } from './apiClient';

export interface FirebaseLoginPayload {
  idToken: string;
  fullName?: string;
  role?: 'MEMBER' | 'ADMIN';
}

export interface FirebaseLoginResponse {
  success: boolean;
  user: any;
  token: string;
}

export const authApi = {
  firebaseLogin: async (payload: FirebaseLoginPayload): Promise<FirebaseLoginResponse> => {
    return apiFetch<FirebaseLoginResponse>('/auth/firebase-login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateProfileName: async (fullName: string) => {
    return apiFetch('/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify({ fullName }),
    });
  },

  updatePaymentMethod: async (
    defaultPaymentProvider: 'wave' | 'orange_money',
    paymentPhoneNumber: string,
  ) => {
    return apiFetch('/auth/update-payment-method', {
      method: 'POST',
      body: JSON.stringify({
        defaultPaymentProvider,
        paymentPhoneNumber,
      }),
    });
  },
};
