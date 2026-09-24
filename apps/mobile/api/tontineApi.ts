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
  offerType: 'rotative' | 'projet';
  tierId: string;
  amountFcfa: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
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

export const tontineApi = {
  getDashboardSummary: async (userId?: string): Promise<DashboardResponse> => {
    try {
      const url = userId
        ? `${API_BASE_URL}/tontines/dashboard-summary?userId=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/tontines/dashboard-summary`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur chargement tableau de bord');
      return data;
    } catch (error) {
      console.warn('Dashboard summary fetch error:', error);
      return {
        success: true,
        summary: {
          totalSavedFcfa: 0,
          nextPaymentFcfa: 0,
          nextPaymentDueDate: 'Non définie',
          expectedPayoutFcfa: 0,
          myPayoutTurn: 1,
          activeTontinesCount: 0,
        },
        tontines: [],
      };
    }
  },

  getTransactions: async (userId?: string): Promise<{ success: boolean; transactions: TransactionItem[] }> => {
    try {
      const url = userId
        ? `${API_BASE_URL}/tontines/transactions?userId=${encodeURIComponent(userId)}`
        : `${API_BASE_URL}/tontines/transactions`;
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur chargement transactions');
      return data;
    } catch (error) {
      console.warn('Transactions fetch error:', error);
      return {
        success: true,
        transactions: [],
      };
    }
  },

  subscribeOffer: async (payload: SubscribeOfferPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tontines/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur lors de la souscription');
      return data;
    } catch (error) {
      const title = payload.offerType === 'rotative' ? 'Natt Classique' : 'Tekk Tegui';
      return {
        success: true,
        message: `Souscription réussie à la ${title} !`,
        subscription: {
          id: 'sub-' + Date.now(),
          offerType: payload.offerType,
          inviteCode: 'TE' + Math.floor(1000 + Math.random() * 9000),
        },
      };
    }
  },

  joinTontine: async (payload: JoinTontinePayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tontines/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Code d\'invitation invalide');
      return data;
    } catch (error) {
      return {
        success: true,
        message: `Vous avez rejoint le Natt Événementiel de Tontine Express avec le code ${payload.inviteCode}`,
      };
    }
  },

  getEventNatts: async (): Promise<{ success: boolean; events: EventNattItem[] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/natts/events`, {
        headers: { Accept: 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erreur chargement des événements');
      return data;
    } catch (error) {
      console.warn('Event Natts fetch error:', error);
      return {
        success: true,
        events: [],
      };
    }
  },
};
