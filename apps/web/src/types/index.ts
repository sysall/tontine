export type NattCategory = 'classique' | 'tekk_tegui' | 'evenement';

export type SubscriptionStatus = 'IN_PROGRESS' | 'ELIGIBLE_PAYOUT' | 'PAID_OUT';

export interface TreasuryMetrics {
  totalBalanceFcfa: number;
  totalCollectedFcfa: number;
  totalPaidOutFcfa: number;
  pendingPayoutsCount: number;
  pendingPayoutsTotalFcfa: number;
  activeClientsCount: number;
  activeSubscriptionsCount: number;
  solvencyRatioPercent: number;
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  joinedDate: string;
  activeNattsCount: number;
  totalContributedFcfa: number;
  totalReceivedFcfa: number;
}

export interface ClientNattSubscription {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  category: NattCategory;
  categoryTitle: string;
  targetAmountFcfa: number;
  contributedAmountFcfa: number;
  progressPercent: number; // calculated as (contributed / target) * 100
  payoutTriggerPercent: number; // Always 70% for Tontine Express
  isEligibleForPayout: boolean; // true if progressPercent >= 70
  status: SubscriptionStatus;
  startDate: string;
  payoutDate?: string;
  payoutTxRef?: string;
}

export interface CotisationTransaction {
  id: string;
  subscriptionId: string;
  clientName: string;
  clientPhone: string;
  nattTitle: string;
  amountFcfa: number;
  provider: 'Wave' | 'Orange Money' | 'Free Money';
  reference: string;
  createdAt: string;
}

export interface PayoutRecord {
  id: string;
  subscriptionId: string;
  clientName: string;
  clientPhone: string;
  nattTitle: string;
  targetAmountFcfa: number;
  contributedAtPayoutFcfa: number;
  progressAtPayoutPercent: number;
  payoutAmountFcfa: number; // 100% of target amount
  provider: 'Wave' | 'Orange Money' | 'Virement';
  reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  triggeredAt: string;
  processedAt?: string;
  approvedBy?: string;
}

export interface EventNattItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  targetAmountFcfa: number;
  subscribersCount: number;
  emoji: string;
  isDeletable?: boolean;
}

export type KycStatus = 'PENDING_MANUAL_CHECK' | 'VERIFIED' | 'REJECTED';

export interface KycRecord {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  documentType: 'CNI_CEDEAO' | 'PASSPORT' | 'PERMIS';
  documentNumber: string;
  extractedNin: string;
  extractedFullName: string;
  extractedBirthDate: string;
  extractedExpiryDate: string;
  ocrConfidencePercent: number;
  ocrStatus: 'OCR_SUCCESS' | 'OCR_INCONCLUSIVE';
  documentFrontUrl: string;
  documentBackUrl: string;
  selfieUrl: string;
  submittedAt: string;
  status: KycStatus;
  adminNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface OverdueContribution {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  nattTitle: string;
  category: NattCategory;
  expectedAmountFcfa: number;
  dueDate: string;
  daysOverdue: number;
  status: 'OVERDUE' | 'REMINDED';
  lastRemindedAt?: string;
}



