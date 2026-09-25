export interface RequestOtpPayload {
  phoneNumber: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  phoneNumber: string;
  expiresInSeconds: number;
}

export interface VerifyOtpPayload {
  phoneNumber: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user: {
    phoneNumber: string;
    isVerified: boolean;
  };
  token: string;
}

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

// Configurable gateway URL (supports local dev server, Android emulator 10.0.2.2, localhost 3000)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const authApi = {
  firebaseLogin: async (payload: FirebaseLoginPayload): Promise<FirebaseLoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/firebase-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Échec de l\'authentification Firebase';
      throw new Error(errorMsg);
    }

    return data;
  },

  requestOtp: async (payload: RequestOtpPayload): Promise<RequestOtpResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Échec de l\'envoi du code OTP';
      throw new Error(errorMsg);
    }

    return data;
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Code OTP invalide';
      throw new Error(errorMsg);
    }

    return data;
  },
};
