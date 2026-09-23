export type NattFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type PermanentCatalogId = 'natt_classique' | 'tekk_tegui';
export type EventNattStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DELETED';
export type UserNattCategory = 'PERMANENT' | 'EVENT';
export type UserNattStatus = 'ACTIVE' | 'PAYOUT_UNLOCKED' | 'PAYOUT_SENT' | 'COMPLETED' | 'DEFAULTED';
export type PayoutStatus = 'NOT_ELIGIBLE' | 'PENDING' | 'PAID';
export type PaymentGateway = 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY' | 'VIREMENT';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type TransactionType = 'NATT_CONTRIBUTION' | 'NATT_PAYOUT';
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
export interface EventNatt {
    eventId: string;
    title: string;
    description: string;
    bannerImageUrl?: string;
    targetAmount: number;
    thresholdAmount: number;
    installmentAmount: number;
    frequency: NattFrequency;
    subscriptionDeadline: string;
    eventDueDate: string;
    status: EventNattStatus;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface UserNatt {
    userNattId: string;
    userId: string;
    category: UserNattCategory;
    catalogId?: PermanentCatalogId;
    eventId?: string | null;
    title: string;
    targetAmount: number;
    thresholdAmount: number;
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
export interface NattPayment {
    paymentId: string;
    userNattId: string;
    userId: string;
    amount: number;
    paymentMethod: PaymentGateway;
    status: PaymentStatus;
    paidAt: string;
}
export interface Treasury {
    vaultId: string;
    totalCollected: number;
    totalDisbursed: number;
    currentCashBalance: number;
    outstandingAdvances: number;
    updatedAt: string;
}
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
