import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FirestoreService } from '../firestore/firestore.service';

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

export type NattCategory = 'classique' | 'tekk_tegui' | 'evenement';
export type SubscriptionStatus = 'IN_PROGRESS' | 'ELIGIBLE_PAYOUT' | 'PAID_OUT';

export interface ClientNattSubscription {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  category: NattCategory;
  categoryTitle: string;
  targetAmountFcfa: number;
  contributedAmountFcfa: number;
  progressPercent: number;
  payoutTriggerPercent: number;
  isEligibleForPayout: boolean;
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
  payoutAmountFcfa: number;
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

@Injectable()
export class AdminBackofficeService {
  private readonly logger = new Logger(AdminBackofficeService.name);

  // Pure dynamic state populated strictly from Cloud Firestore
  private treasury: TreasuryMetrics = {
    totalBalanceFcfa: 0,
    totalCollectedFcfa: 0,
    totalPaidOutFcfa: 0,
    pendingPayoutsCount: 0,
    pendingPayoutsTotalFcfa: 0,
    activeClientsCount: 0,
    activeSubscriptionsCount: 0,
    solvencyRatioPercent: 0,
  };

  private clients: Client[] = [];
  private subscriptions: ClientNattSubscription[] = [];
  private cotisations: CotisationTransaction[] = [];
  private payoutHistory: PayoutRecord[] = [];
  private eventNattsList: EventNattItem[] = [];
  private kycRecords: KycRecord[] = [];
  private overdueContributions: OverdueContribution[] = [];

  constructor(private readonly firestoreService: FirestoreService) {}

  /**
   * Sync directly with Cloud Firestore collections (/users, /user_natts, /event_natts, /transactions, /kyc_documents, /treasury)
   */
  async syncWithFirestore() {
    try {
      // 1. Fetch Users from Cloud Firestore (/users)
      const usersSnap = await this.firestoreService.users().get();
      if (!usersSnap.empty) {
        this.clients = usersSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            fullName: d.fullName || d.phoneNumber || 'Membre',
            phone: d.phoneNumber || d.phone || '',
            email: d.email || 'Non renseigné',
            kycStatus: d.kycStatus || 'PENDING',
            joinedDate: d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : 'Compte récent',
            activeNattsCount: d.activeNattsCount || 0,
            totalContributedFcfa: d.totalContributedFcfa || 0,
            totalReceivedFcfa: d.totalReceivedFcfa || 0,
          };
        });
      } else {
        this.clients = [];
      }

      // 2. Fetch UserNatts (Subscriptions) from Cloud Firestore (/user_natts)
      const nattsSnap = await this.firestoreService.userNatts().get();
      if (!nattsSnap.empty) {
        this.subscriptions = nattsSnap.docs.map((doc) => {
          const d = doc.data();
          const targetAmountFcfa = d.targetAmount || 1000000;
          const contributedAmountFcfa = d.totalPaid || 0;
          const progressPercent = Math.min(100, Math.round((contributedAmountFcfa / targetAmountFcfa) * 100 * 10) / 10);
          const isEligibleForPayout = d.payoutEligible || progressPercent >= 70;

          let status: SubscriptionStatus = 'IN_PROGRESS';
          if (d.payoutStatus === 'PAID' || d.status === 'COMPLETED') status = 'PAID_OUT';
          else if (isEligibleForPayout) status = 'ELIGIBLE_PAYOUT';

          return {
            id: doc.id,
            clientId: d.userId || 'user-default',
            clientName: d.clientName || 'Client Tontine',
            clientPhone: d.clientPhone || '+221 77 000 00 00',
            category: (d.category === 'EVENT' ? 'evenement' : d.catalogId === 'tekk_tegui' ? 'tekk_tegui' : 'classique') as NattCategory,
            categoryTitle: d.title || 'Natt Express',
            targetAmountFcfa,
            contributedAmountFcfa,
            progressPercent,
            payoutTriggerPercent: 70,
            isEligibleForPayout,
            status,
            startDate: d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : 'Souscription récente',
            payoutDate: d.eventDueDate,
            payoutTxRef: d.payoutTxRef,
          };
        });
      } else {
        this.subscriptions = [];
      }

      // 3. Fetch Event Natts from Cloud Firestore (/event_natts)
      const eventsSnap = await this.firestoreService.eventNatts().get();
      if (!eventsSnap.empty) {
        this.eventNattsList = eventsSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            title: d.title,
            description: d.description,
            eventDate: d.eventDueDate ? new Date(d.eventDueDate).toLocaleDateString('fr-FR') : 'Échéance à définir',
            targetAmountFcfa: d.targetAmount,
            subscribersCount: d.subscribersCount || 0,
            emoji: '🎉',
            isDeletable: true,
          };
        });
      } else {
        this.eventNattsList = [];
      }

      // 4. Fetch Treasury from Cloud Firestore (/treasury/main_vault)
      const treasurySnap = await this.firestoreService.treasury().doc('main_vault').get();
      if (treasurySnap.exists) {
        const d = treasurySnap.data();
        if (d) {
          this.treasury.totalBalanceFcfa = d.currentCashBalance || 0;
          this.treasury.totalCollectedFcfa = d.totalCollected || 0;
          this.treasury.totalPaidOutFcfa = d.totalDisbursed || 0;
        }
      }

      // 5. Fetch Transactions from Cloud Firestore (/transactions)
      const txSnap = await this.firestoreService.transactions().get();
      if (!txSnap.empty) {
        const cotisations: CotisationTransaction[] = [];
        const payouts: PayoutRecord[] = [];

        txSnap.docs.forEach((doc) => {
          const tx = doc.data();
          const createdAtFormatted = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('fr-FR') : 'Transaction récente';

          if (tx.type === 'NATT_PAYOUT') {
            payouts.push({
              id: doc.id,
              subscriptionId: tx.userNattId || '',
              clientName: tx.clientName || 'Client Tontine',
              clientPhone: tx.clientPhone || '',
              nattTitle: tx.nattTitle || 'Versement Natt',
              targetAmountFcfa: tx.amount || 0,
              contributedAtPayoutFcfa: Math.round((tx.amount || 0) * 0.7),
              progressAtPayoutPercent: 70,
              payoutAmountFcfa: tx.amount || 0,
              provider: (tx.gateway === 'ORANGE_MONEY' ? 'Orange Money' : tx.gateway === 'VIREMENT' ? 'Virement' : 'Wave') as any,
              reference: tx.gatewayReference || doc.id,
              status: tx.status === 'FAILED' ? 'FAILED' : 'SUCCESS',
              triggeredAt: createdAtFormatted,
              processedAt: createdAtFormatted,
              approvedBy: 'Admin Trésorerie',
            });
          } else {
            cotisations.push({
              id: doc.id,
              subscriptionId: tx.userNattId || '',
              clientName: tx.clientName || 'Membre',
              clientPhone: tx.clientPhone || '',
              nattTitle: tx.nattTitle || 'Cotisation Natt',
              amountFcfa: tx.amount || 0,
              provider: (tx.gateway === 'ORANGE_MONEY' ? 'Orange Money' : tx.gateway === 'FREE_MONEY' ? 'Free Money' : 'Wave') as any,
              reference: tx.gatewayReference || doc.id,
              createdAt: createdAtFormatted,
            });
          }
        });

        this.cotisations = cotisations;
        this.payoutHistory = payouts;
      } else {
        this.cotisations = [];
        this.payoutHistory = [];
      }

      // 6. Fetch KYC Documents from Cloud Firestore (/kyc_documents)
      const kycSnap = await this.firestoreService.kyc().get();
      if (!kycSnap.empty) {
        this.kycRecords = kycSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            clientId: d.clientId || '',
            clientName: d.clientName || 'Client',
            clientPhone: d.clientPhone || '',
            clientEmail: d.clientEmail || '',
            documentType: d.documentType || 'CNI_CEDEAO',
            documentNumber: d.documentNumber || '',
            extractedNin: d.extractedNin || '',
            extractedFullName: d.extractedFullName || d.clientName || '',
            extractedBirthDate: d.extractedBirthDate || '',
            extractedExpiryDate: d.extractedExpiryDate || '',
            ocrConfidencePercent: d.ocrConfidencePercent || 80,
            ocrStatus: d.ocrConfidencePercent && d.ocrConfidencePercent >= 80 ? 'OCR_SUCCESS' : 'OCR_INCONCLUSIVE',
            documentFrontUrl: d.documentFrontUrl || '',
            documentBackUrl: d.documentBackUrl || '',
            selfieUrl: d.selfieUrl || '',
            submittedAt: d.submittedAt ? new Date(d.submittedAt).toLocaleDateString('fr-FR') : 'Récemment',
            status: d.status || 'PENDING_MANUAL_CHECK',
            adminNotes: d.adminNotes,
            verifiedAt: d.verifiedAt,
            verifiedBy: d.verifiedBy,
          };
        });
      } else {
        this.kycRecords = [];
      }
    } catch (err: any) {
      this.logger.error(`Error syncing Cloud Firestore collections: ${err.message}`);
    }
  }

  /**
   * Get all backoffice datasets directly from Firestore
   */
  async getBackofficeData() {
    await this.syncWithFirestore();

    // Calculate dynamic metrics
    const pendingPayouts = this.subscriptions.filter((s) => s.status === 'ELIGIBLE_PAYOUT');
    this.treasury.pendingPayoutsCount = pendingPayouts.length;
    this.treasury.pendingPayoutsTotalFcfa = pendingPayouts.reduce((acc, curr) => acc + curr.targetAmountFcfa, 0);
    this.treasury.activeClientsCount = this.clients.length;
    this.treasury.activeSubscriptionsCount = this.subscriptions.length;
    if (this.treasury.totalCollectedFcfa > 0) {
      this.treasury.solvencyRatioPercent = Math.round((this.treasury.totalBalanceFcfa / this.treasury.totalCollectedFcfa) * 100 * 10) / 10;
    } else {
      this.treasury.solvencyRatioPercent = 100;
    }

    return {
      success: true,
      treasury: this.treasury,
      clients: this.clients,
      subscriptions: this.subscriptions,
      cotisations: this.cotisations,
      payoutHistory: this.payoutHistory,
      eventNattsList: this.eventNattsList,
      kycRecords: this.kycRecords,
      overdueContributions: this.overdueContributions,
    };
  }

  /**
   * Action: Confirm payout at 70% threshold in Firestore
   */
  async processPayout(subscriptionId: string, provider: 'Wave' | 'Orange Money' | 'Virement') {
    const targetSub = this.subscriptions.find((s) => s.id === subscriptionId);
    if (!targetSub) {
      throw new NotFoundException(`Souscription ${subscriptionId} introuvable.`);
    }

    const payoutAmount = targetSub.targetAmountFcfa;
    const txRef = `${provider === 'Wave' ? 'WV' : provider === 'Orange Money' ? 'OM' : 'VIR'}-PAYOUT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // 1. Update subscription in Firestore
      await this.firestoreService.userNatts().doc(subscriptionId).set({
        payoutStatus: 'PAID',
        status: 'COMPLETED',
        payoutTxRef: txRef,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // 2. Add Transaction in Firestore
      const txId = `tx-payout-${Date.now()}`;
      await this.firestoreService.transactions().doc(txId).set({
        transactionId: txId,
        userId: targetSub.clientId,
        userNattId: subscriptionId,
        clientName: targetSub.clientName,
        clientPhone: targetSub.clientPhone,
        nattTitle: targetSub.categoryTitle,
        type: 'NATT_PAYOUT',
        amount: payoutAmount,
        gateway: provider === 'Orange Money' ? 'ORANGE_MONEY' : provider === 'Virement' ? 'VIREMENT' : 'WAVE',
        gatewayReference: txRef,
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      });

      // 3. Update Treasury Vault in Firestore
      const newCashBalance = Math.max(0, this.treasury.totalBalanceFcfa - payoutAmount);
      const newTotalDisbursed = this.treasury.totalPaidOutFcfa + payoutAmount;

      await this.firestoreService.treasury().doc('main_vault').set({
        currentCashBalance: newCashBalance,
        totalDisbursed: newTotalDisbursed,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      this.logger.log(`Payout processed for ${targetSub.clientName} (${payoutAmount} FCFA) via ${provider}`);
    } catch (err: any) {
      this.logger.error(`Failed to process payout in Firestore: ${err.message}`);
    }

    return this.getBackofficeData();
  }

  /**
   * Action: Add custom Event Natt in Firestore
   */
  async addEventNatt(newEvent: Omit<EventNattItem, 'id' | 'subscribersCount'>) {
    const eventId = `evt-${Date.now()}`;

    try {
      await this.firestoreService.eventNatts().doc(eventId).set({
        eventId,
        title: newEvent.title,
        description: newEvent.description,
        targetAmount: newEvent.targetAmountFcfa,
        thresholdAmount: Math.round(newEvent.targetAmountFcfa * 0.7),
        eventDueDate: newEvent.eventDate,
        subscribersCount: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
      this.logger.log(`Created new Event Natt in Firestore: ${newEvent.title}`);
    } catch (err: any) {
      this.logger.error(`Failed to save new event natt to Firestore: ${err.message}`);
    }

    return this.getBackofficeData();
  }

  /**
   * Action: Delete Event Natt in Firestore
   */
  async deleteEventNatt(eventId: string) {
    try {
      await this.firestoreService.eventNatts().doc(eventId).delete();
      this.logger.log(`Deleted Event Natt from Firestore: ${eventId}`);
    } catch (err: any) {
      this.logger.error(`Failed to delete event natt from Firestore: ${err.message}`);
    }

    return this.getBackofficeData();
  }

  /**
   * Action: Approve KYC in Firestore
   */
  async approveKyc(kycId: string, notes?: string) {
    const kycDocRef = this.firestoreService.kyc().doc(kycId);
    let clientId = this.kycRecords.find((k) => k.id === kycId)?.clientId;

    try {
      const kycSnap = await kycDocRef.get();
      if (kycSnap.exists && kycSnap.data()?.clientId) {
        clientId = kycSnap.data()?.clientId;
      }
      if (!clientId && kycId.startsWith('kyc_')) {
        clientId = kycId.replace('kyc_', '');
      }

      await kycDocRef.set({
        status: 'VERIFIED',
        adminNotes: notes || 'Approuvé par Admin Web Backoffice',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Admin Web Backoffice',
      }, { merge: true });

      if (clientId) {
        await this.firestoreService.users().doc(clientId).set({
          kycStatus: 'VERIFIED',
          isVerified: true,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      this.logger.log(`Approved KYC ${kycId} for client ${clientId} in Firestore`);
    } catch (err: any) {
      this.logger.error(`Failed to approve KYC in Firestore: ${err.message}`);
    }

    return this.getBackofficeData();
  }

  /**
   * Action: Reject KYC in Firestore
   */
  async rejectKyc(kycId: string, notes: string) {
    const kycDocRef = this.firestoreService.kyc().doc(kycId);
    let clientId = this.kycRecords.find((k) => k.id === kycId)?.clientId;

    try {
      const kycSnap = await kycDocRef.get();
      if (kycSnap.exists && kycSnap.data()?.clientId) {
        clientId = kycSnap.data()?.clientId;
      }
      if (!clientId && kycId.startsWith('kyc_')) {
        clientId = kycId.replace('kyc_', '');
      }

      await kycDocRef.set({
        status: 'REJECTED',
        adminNotes: notes || 'Document non conforme.',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'Admin Web Backoffice',
      }, { merge: true });

      if (clientId) {
        await this.firestoreService.users().doc(clientId).set({
          kycStatus: 'REJECTED',
          isVerified: false,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
      this.logger.log(`Rejected KYC ${kycId} for client ${clientId} in Firestore`);
    } catch (err: any) {
      this.logger.error(`Failed to reject KYC in Firestore: ${err.message}`);
    }

    return this.getBackofficeData();
  }

  /**
   * Action: Send Overdue Reminder
   */
  async sendReminder(overdueId: string) {
    const nowStr = `${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

    this.overdueContributions = this.overdueContributions.map((o) => {
      if (o.id === overdueId) {
        return {
          ...o,
          status: 'REMINDED',
          lastRemindedAt: nowStr,
        };
      }
      return o;
    });

    return this.getBackofficeData();
  }
}
