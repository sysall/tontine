import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface TontineSummary {
  totalSavedFcfa: number;
  nextPaymentFcfa: number;
  nextPaymentDueDate: string;
  expectedPayoutFcfa: number;
  myPayoutTurn: number;
  activeTontinesCount: number;
}

export interface EventNattItem {
  eventId: string;
  title: string;
  description: string;
  bannerImageUrl?: string;
  targetAmount: number;
  thresholdAmount: number;
  installmentAmount: number;
  frequency: string;
  subscriptionDeadline: string;
  eventDueDate: string;
  status: string;
}

export interface ActiveTontineItem {
  id: string;
  name: string;
  offerType: 'rotative' | 'projet';
  category: string;
  targetAmountFcfa?: number;
  amountPerCycle: number;
  currentTurn: number;
  totalTours: number;
  totalMembers: number;
  myContributionFcfa: number;
  myPayoutTurn: number;
  nextTurnDate: string;
  status: string;
}

export interface TransactionItem {
  id: string;
  type: 'contribution' | 'payout';
  title: string;
  tontineName: string;
  amountFcfa: number;
  provider: 'wave' | 'orange_money' | 'free_money';
  providerName: string;
  reference: string;
  date: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface OfficialTier {
  id: string;
  name: string;
  amountFcfa: number;
  frequency: string;
  targetDate?: string;
  maxMembers?: number;
}

export interface OfficialOffer {
  id: string;
  type: 'rotative' | 'projet';
  title: string;
  badge: string;
  description: string;
  tiers: OfficialTier[];
}

export interface DashboardResponse {
  success: boolean;
  summary: TontineSummary;
  tontines: ActiveTontineItem[];
}

export interface SubscribeOfferPayload {
  userId?: string;
  userPhone?: string;
  category?: 'PERMANENT' | 'EVENT';
  catalogId?: 'natt_classique' | 'tekk_tegui';
  eventId?: string;
  customTitle?: string;
  offerType?: 'rotative' | 'projet';
  tierId?: string;
  targetAmount?: number;
  amountFcfa?: number;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  initialPaymentAmount?: number;
  paymentMethod?: string;
}

export interface ProcessContributionPayload {
  userNattId: string;
  userId: string;
  amount: number;
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY';
  gatewayReference?: string;
}

export interface JoinTontinePayload {
  inviteCode: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const OFFICIAL_OFFERS: OfficialOffer[] = [
  {
    id: 'rotative',
    type: 'rotative',
    title: 'Natt Classique',
    badge: 'Offre Rotative Mensuelle',
    description: 'Avec 4 membres par groupe et une prise mensuelle sur 4 mois, cette formule vous permet d\’épargner en toute sérénité.',
    tiers: [
      { id: 'natt-250k', name: 'Option 1', amountFcfa: 250000, frequency: 'Mensuel', maxMembers: 4 },
      { id: 'natt-500k', name: 'Option 2', amountFcfa: 500000, frequency: 'Mensuel', maxMembers: 4 },
      { id: 'natt-1M', name: 'Option 3', amountFcfa: 1000000, frequency: 'Mensuel', maxMembers: 4 },
      { id: 'natt-105M', name: 'Option 4', amountFcfa: 1500000, frequency: 'Mensuel', maxMembers: 4 },
      { id: 'natt-2M', name: 'Option 5', amountFcfa: 2000000, frequency: 'Mensuel', maxMembers: 4 },
      { id: 'natt-3M', name: 'Option 6', amountFcfa: 3000000, frequency: 'Mensuel', maxMembers: 4 },
    ],
  },
  {
    id: 'projet',
    type: 'projet',
    title: 'Tekk Tegui',
    badge: 'Offre Rotative Journalière ',
    description: 'Epargnez rapidement avec 10 autres personnes et finisser apres 2 mois 15 jours.',
    tiers: [
      { id: 'tek-100k', name: 'Option 1', amountFcfa: 100000, frequency: 'Journalier', maxMembers: 10 },
      { id: 'tek-150k', name: 'Option 2', amountFcfa: 150000, frequency: 'Journalier', maxMembers: 10 },
      { id: 'tek-250K', name: 'Option 3', amountFcfa: 250000, frequency: 'Journalier', maxMembers: 10 },
      { id: 'tek-500K', name: 'Option 4', amountFcfa: 500000, frequency: 'Journalier', maxMembers: 10 },
      { id: 'tek-750K', name: 'Option 5', amountFcfa: 750000, frequency: 'Journalier', maxMembers: 10 },
      { id: 'tek-1M', name: 'Option 6', amountFcfa: 1000000, frequency: 'Journalier', maxMembers: 10 },
    ],
  },
];

import { apiFetch } from './apiClient';

export const tontineApi = {
  getDashboardSummary: async (userId?: string): Promise<DashboardResponse> => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return apiFetch<DashboardResponse>(`/tontines/dashboard-summary${query}`);
  },

  getTransactions: async (userId?: string): Promise<{ success: boolean; transactions: TransactionItem[] }> => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return apiFetch<{ success: boolean; transactions: TransactionItem[] }>(`/tontines/transactions${query}`);
  },

  subscribeOffer: async (payload: SubscribeOfferPayload) => {
    return apiFetch('/natts/subscribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  joinTontine: async (payload: JoinTontinePayload) => {
    return apiFetch('/tontines/join', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getEventNatts: async (): Promise<{ success: boolean; events: EventNattItem[] }> => {
    try {
      const data = await apiFetch<{ success: boolean; events: EventNattItem[] }>('/natts/events');
      return {
        success: true,
        events: data.events || [],
      };
    } catch (error) {
      console.warn('Event Natts fetch error:', error);
      return {
        success: true,
        events: [],
      };
    }
  },

  processContribution: async (payload: ProcessContributionPayload) => {
    return apiFetch('/payments/process-contribution', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

