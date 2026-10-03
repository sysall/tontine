const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export interface KycUploadPayload {
  userId: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  documentType: 'CNI_CEDEAO' | 'PASSPORT';
  documentFrontBase64?: string;
  documentBackBase64?: string;
  selfieBase64?: string;
}

export interface KycUploadResponse {
  success: boolean;
  kycId: string;
  status: 'PENDING_MANUAL_CHECK' | 'VERIFIED' | 'REJECTED';
  message: string;
}

export const kycApi = {
  uploadKyc: async (payload: KycUploadPayload): Promise<KycUploadResponse> => {
    const response = await fetch(`${API_BASE_URL}/kyc/upload`, {
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
        : data.message || 'Échec du téléversement des pièces KYC.';
      throw new Error(errorMsg);
    }

    return data;
  },

  getKycStatus: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/kyc/status/${userId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Impossible de récupérer le statut KYC.');
    }

    return data;
  },
};
