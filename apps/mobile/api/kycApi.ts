import { apiFetch } from './apiClient';

export interface KycUploadPayload {
  userId?: string;
  clientName?: string;
  clientPhone?: string;
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
    return apiFetch<KycUploadResponse>('/kyc/upload', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getKycStatus: async (userId: string) => {
    return apiFetch(`/kyc/status/${encodeURIComponent(userId)}`, {
      method: 'GET',
    });
  },
};
