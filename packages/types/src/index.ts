/**
 * Core Data Models & TypeScript Interfaces for Tontine Express
 * Centralized shared definitions across Mobile App & NestJS API
 */

export type NattFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type PermanentCatalogId = 'natt_classique' | 'tekk_tegui';
export type EventNattStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DELETED';
export type UserNattCategory = 'PERMANENT' | 'EVENT';
export type UserNattStatus = 'ACTIVE' | 'PAYOUT_UNLOCKED' | 'PAYOUT_SENT' | 'COMPLETED' | 'DEFAULTED';
export type PayoutStatus = 'NOT_ELIGIBLE' | 'PENDING' | 'PAID';
export type PaymentGateway = 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'VIREMENT';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type TransactionType = 'NATT_CONTRIBUTION' | 'NATT_PAYOUT';

/**
 * 1. NattCatalogItem — Modèles d'épargne permanents (Natt Classique, Tekk Tegui)
 */
export interface NattCatalogItem {
  catalogId: PermanentCatalogId;
  type: 'PERMANENT';
  name: string;
  description: string;
  minTargetAmount: number;
  maxTargetAmount: number;
  allowedFrequencies: NattFrequency[];
  thresholdPayoutPercentage: 70;
}

/**
 * 2. EventNatt — Collection dynamique (/event_natts/{eventId})
 * Campagnes créées et administrées par le Back-Office Web
 */
export interface EventNatt {
  eventId: string;
  title: string;
  description: string;
  bannerImageUrl?: string;
  targetAmount: number;
  thresholdAmount: number; // 70% de targetAmount
  installmentAmount: number;
  frequency: NattFrequency;
  subscriptionDeadline: string; // ISO String
  eventDueDate: string; // ISO String
  status: EventNattStatus;
  createdBy: string; // Admin UID
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

/**
 * 3. UserNatt — Souscriptions individuelles des clients (/user_natts/{userNattId})
 */
export interface UserNatt {
  userNattId: string;
  userId: string;
  category: UserNattCategory;
  catalogId?: PermanentCatalogId;
  eventId?: string | null;
  title: string;
  targetAmount: number;
  thresholdAmount: number; // 70% du montant cible
  totalPaid: number;
  remainingBalance: number;
  frequency: NattFrequency;
  installmentAmount: number;
  totalInstallments: number;
  paidInstallmentsCount: number;
  nextDueDate: string;
  eventDueDate?: string;
  status: UserNattStatus;
  payoutEligible: boolean;
  payoutStatus: PayoutStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 4. NattPayment — Sous-collection des paiements (/user_natts/{userNattId}/payments/{paymentId})
 */
export interface NattPayment {
  paymentId: string;
  userNattId: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentGateway;
  status: PaymentStatus;
  paidAt: string;
}

/**
 * 5. Treasury — Trésorerie Centrale Unique (/treasury/main_vault)
 */
export interface Treasury {
  vaultId: string;
  totalCollected: number;
  totalDisbursed: number;
  currentCashBalance: number;
  outstandingAdvances: number; // Montants cagnottes versés à 70% dont les 30% restent à être récupérés
  updatedAt: string;
}

/**
 * 6. Transaction — Historique des flux financiers (/transactions/{transactionId})
 */
export interface Transaction {
  transactionId: string;
  userId: string;
  userNattId: string;
  type: TransactionType;
  amount: number;
  gateway: PaymentGateway;
  gatewayReference: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 7. User & Authentication Models (/users/{uid})
 */
export type UserRole = 'MEMBER' | 'ADMIN';

export interface UserDocument {
  uid: string;
  phoneNumber?: string | null;
  email?: string | null;
  fullName?: string | null;
  role: UserRole;
  isVerified: boolean;
  balanceFcfa: number;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseAuthSyncDto {
  idToken: string;
  fullName?: string;
  role?: UserRole;
}

export interface AuthResponse {
  success: boolean;
  user: UserDocument;
  token: string;
}

