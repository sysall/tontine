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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
   * Fetch all backoffice datasets from the NestJS API
   */
  async fetchBackofficeData(): Promise<BackofficeDataResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/backoffice/data`);
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
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/backoffice/payouts/process`, {
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
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/backoffice/events`, {
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
   * Delete Event Natt
   */
  async deleteEventNatt(eventId: string): Promise<BackofficeDataResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/backoffice/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete event natt: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Approve KYC record
   */
  async approveKyc(kycId: string, notes?: string): Promise<BackofficeDataResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/backoffice/kyc/${kycId}/approve`, {
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
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/backoffice/kyc/${kycId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      throw new Error(`Failed to reject KYC: HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Send Overdue Contribution Reminder
   */
  async sendReminder(overdueId: string): Promise<BackofficeDataResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/backoffice/overdue/${overdueId}/remind`, {
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`Failed to send reminder: HTTP ${res.status}`);
    }
    return res.json();
  },
};
