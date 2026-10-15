import { 
  TreasuryMetrics, 
  Client, 
  ClientNattSubscription, 
  CotisationTransaction, 
  PayoutRecord, 
  EventNattItem, 
  KycRecord, 
  OverdueContribution 
} from '../types';
import { auth } from '../config/firebase';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

/**
 * fetch wrapper that attaches the current admin's Firebase ID token.
 */
async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Session administrateur expirée. Veuillez vous reconnecter.');
  }
  const idToken = await user.getIdToken();
  return fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export interface AdminProfile {
  uid: string;
  email: string | null;
  fullName: string;
  role: string;
  active: boolean;
}

export interface BackofficeDataResponse {
  success: boolean;
  treasury: TreasuryMetrics;
  clients: Client[];
  subscriptions: ClientNattSubscription[];
  cotisations: CotisationTransaction[];
  payoutHistory: PayoutRecord[];
  eventNattsList: EventNattItem[];
  kycRecords: KycRecord[];
  overdueContributions: OverdueContribution[];
}

export const adminApi = {
  /**
   * Verify the signed-in user is an authorized admin (Firestore `admins/{uid}`)
   */
  async getMe(): Promise<AdminProfile> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/backoffice/me`);
    if (res.status === 401 || res.status === 403) {
      throw new Error('Ce compte n’est pas autorisé à accéder au backoffice.');
    }
    if (!res.ok) {
      throw new Error(`Impossible de vérifier l’accès administrateur (HTTP ${res.status}).`);
    }
    const data = await res.json();
    return data.admin;
  },
  /**
   * Fetch all backoffice datasets from the NestJS API
   */
  async fetchBackofficeData(): Promise<BackofficeDataResponse> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/backoffice/data`);
    if (!res.ok) {
      throw new Error(`Failed to fetch backoffice data: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Confirm payout at 70% threshold
   */
  async processPayout(
    subscriptionId: string, 
    provider: 'Wave' | 'Orange Money' | 'Virement'
  ): Promise<BackofficeDataResponse> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/backoffice/payouts/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId, provider }),
    });
    if (!res.ok) {
      throw new Error(`Failed to process payout: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Create custom Event Natt
   */
  async addEventNatt(
    newEvent: Omit<EventNattItem, 'id' | 'subscribersCount'>
  ): Promise<BackofficeDataResponse> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/backoffice/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });
    if (!res.ok) {
      throw new Error(`Failed to create event natt: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Delete / Deactivate Event Natt
   */
  async deleteEventNatt(eventId: string): Promise<BackofficeDataResponse> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/backoffice/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete event natt: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Toggle Event Natt Status (ACTIVE <-> INACTIVE)
   */
  async toggleEventNattStatus(eventId: string, status?: 'ACTIVE' | 'INACTIVE'): Promise<BackofficeDataResponse> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/backoffice/events/${eventId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw new Error(`Failed to toggle event natt status: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Approve KYC record
   */
  async approveKyc(kycId: string, notes?: string): Promise<BackofficeDataResponse> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/backoffice/kyc/${kycId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      throw new Error(`Failed to approve KYC: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Reject KYC record
   */
  async rejectKyc(kycId: string, notes: string): Promise<BackofficeDataResponse> {
    const res = await authFetch(`${API_BASE_URL}/api/v1/admin/backoffice/kyc/${kycId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      throw new Error(`Failed to reject KYC: HTTP ${res.status}`);
    }
    return res.json();
  },
};
