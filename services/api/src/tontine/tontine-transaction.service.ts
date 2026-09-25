import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirestoreService } from '../firestore/firestore.service';
import { 
  NattCatalogItem, 
  EventNatt, 
  UserNatt, 
  NattPayment, 
  Treasury, 
  Transaction,
  EventNattStatus
} from '@tontine/types';
import { CreateEventNattDto } from './dtos/create-event-natt.dto';
import { UpdateEventNattDto } from './dtos/update-event-natt.dto';
import { SubscribeNattDto } from './dtos/subscribe-natt.dto';
import { ProcessContributionDto } from './dtos/process-contribution.dto';

@Injectable()
export class TontineTransactionService {
  private readonly logger = new Logger(TontineTransactionService.name);

  // 1. Permanent Catalogs Storage
  private readonly permanentCatalogs: Map<string, NattCatalogItem> = new Map([
    [
      'natt_classique',
      {
        catalogId: 'natt_classique',
        type: 'PERMANENT',
        name: 'Natt Classique',
        description: 'Épargne fixe périodique mensuelle adaptée aux projets réguliers.',
        minTargetAmount: 250000,
        maxTargetAmount: 3000000,
        allowedFrequencies: ['MONTHLY'],
        thresholdPayoutPercentage: 70,
      },
    ],
    [
      'tekk_tegui',
      {
        catalogId: 'tekk_tegui',
        type: 'PERMANENT',
        name: 'Tekk Tegui',
        description: 'Épargne rapide progressive (journalière ou hebdomadaire) pour commerçants et entrepreneurs.',
        minTargetAmount: 100000,
        maxTargetAmount: 3000000,
        allowedFrequencies: ['DAILY', 'WEEKLY'],
        thresholdPayoutPercentage: 70,
      },
    ],
  ]);

  // 2. Event Natts Collection (/event_natts)
  private readonly eventNatts: Map<string, EventNatt> = new Map();

  // 3. User Subscriptions Collection (/user_natts)
  private readonly userNatts: Map<string, UserNatt> = new Map();

  // 4. Payments Sub-collection (/user_natts/{userNattId}/payments)
  private readonly payments: Map<string, NattPayment[]> = new Map();

  // 5. Central Treasury Document (/treasury/main_vault)
  private treasury: Treasury = {
    vaultId: 'main_vault',
    totalCollected: 125000000,
    totalDisbursed: 76500000,
    currentCashBalance: 48500000,
    outstandingAdvances: 22500000,
    updatedAt: new Date().toISOString(),
  };

  // 6. Global Financial Transactions (/transactions)
  private readonly transactions: Transaction[] = [];

  constructor(private readonly firestoreService: FirestoreService) {}

  // --- CATALOG & EVENT METHODS ---

  getPermanentCatalogs(): NattCatalogItem[] {
    return Array.from(this.permanentCatalogs.values());
  }

  async getActiveEventNatts(): Promise<EventNatt[]> {
    try {
      const snapshot = await this.firestoreService.eventNatts().where('status', '==', 'ACTIVE').get();
      if (!snapshot.empty) {
        const events = snapshot.docs.map(doc => doc.data() as EventNatt);
        for (const e of events) {
          this.eventNatts.set(e.eventId, e);
        }
        return events;
      }
      return Array.from(this.eventNatts.values()).filter(e => e.status === 'ACTIVE');
    } catch (err: any) {
      this.logger.error(`Error fetching eventNatts from Firestore: ${err.message}`);
      return Array.from(this.eventNatts.values()).filter(e => e.status === 'ACTIVE');
    }
  }

  async getAllEventNattsForAdmin(): Promise<EventNatt[]> {
    try {
      const snapshot = await this.firestoreService.eventNatts().get();
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => doc.data() as EventNatt);
      }
      return Array.from(this.eventNatts.values());
    } catch (err: any) {
      return Array.from(this.eventNatts.values());
    }
  }

  async getEventNattById(eventId: string): Promise<EventNatt> {
    const memoryEvent = this.eventNatts.get(eventId);
    if (memoryEvent) return memoryEvent;

    try {
      const doc = await this.firestoreService.eventNatts().doc(eventId).get();
      if (doc.exists) {
        const event = doc.data() as EventNatt;
        this.eventNatts.set(eventId, event);
        return event;
      }
    } catch (err: any) {
      this.logger.error(`Error fetching event ${eventId} from Firestore: ${err.message}`);
    }

    throw new NotFoundException(`Natt Événement avec l'ID ${eventId} introuvable.`);
  }

  /**
   * A. Admin: Create Event Natt
   */
  async createEventNatt(dto: CreateEventNattDto, adminUid: string = 'admin-default'): Promise<EventNatt> {
    const thresholdAmount = Math.round(dto.targetAmount * 0.70);
    const eventId = `evt-${Date.now()}`;
    const now = new Date().toISOString();

    const newEvent: EventNatt = {
      eventId,
      title: dto.title,
      description: dto.description,
      bannerImageUrl: dto.bannerImageUrl,
      targetAmount: dto.targetAmount,
      thresholdAmount,
      installmentAmount: dto.installmentAmount,
      frequency: dto.frequency,
      subscriptionDeadline: dto.subscriptionDeadline,
      eventDueDate: dto.eventDueDate,
      status: 'ACTIVE',
      createdBy: adminUid,
      createdAt: now,
      updatedAt: now,
    };

    this.eventNatts.set(eventId, newEvent);

    this.firestoreService.eventNatts().doc(eventId).set(newEvent).catch(err => {
      this.logger.error(`Failed to save eventNatt ${eventId} to Firestore: ${err.message}`);
    });

    this.logger.log(`[ADMIN] Created new Event Natt: ${newEvent.title} (ID: ${eventId}, Threshold: ${thresholdAmount} FCFA)`);
    return newEvent;
  }

  /**
   * A. Admin: Update Event Natt
   */
  async updateEventNatt(eventId: string, dto: UpdateEventNattDto): Promise<EventNatt> {
    const existing = await this.getEventNattById(eventId);
    const targetAmount = dto.targetAmount ?? existing.targetAmount;
    const thresholdAmount = Math.round(targetAmount * 0.70);
    const now = new Date().toISOString();

    const updated: EventNatt = {
      ...existing,
      ...dto,
      targetAmount,
      thresholdAmount,
      updatedAt: now,
    };

    this.eventNatts.set(eventId, updated);

    this.firestoreService.eventNatts().doc(eventId).set(updated, { merge: true }).catch(err => {
      this.logger.error(`Failed to update eventNatt ${eventId} in Firestore: ${err.message}`);
    });

    this.logger.log(`[ADMIN] Updated Event Natt ID: ${eventId}`);
    return updated;
  }

  /**
   * A. Admin: Delete / Soft Delete Event Natt
   * Blocking new subscriptions without interrupting existing contracts
   */
  async deleteEventNatt(eventId: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.getEventNattById(eventId);

    // Check if users are subscribed to this event
    const activeSubscribers = Array.from(this.userNatts.values()).filter(
      u => u.eventId === eventId && u.status !== 'COMPLETED'
    );

    // Soft delete / archive to block new subscriptions while preserving existing user contracts
    existing.status = 'DELETED';
    existing.updatedAt = new Date().toISOString();
    this.eventNatts.set(eventId, existing);

    this.firestoreService.eventNatts().doc(eventId).update({ status: 'DELETED', updatedAt: existing.updatedAt }).catch(err => {
      this.logger.error(`Failed to soft-delete eventNatt ${eventId} in Firestore: ${err.message}`);
    });

    this.logger.log(`[ADMIN] Event Natt ${eventId} marked as DELETED. Active subscribers preserved: ${activeSubscribers.length}`);

    return {
      success: true,
      message: activeSubscribers.length > 0
        ? `L'événement a été marqué comme DELETED. Les souscriptions existantes (${activeSubscribers.length}) continuent normalement mais les nouvelles adhésions sont bloquées.`
        : `L'événement ${existing.title} a été supprimé avec succès.`,
    };
  }

  // --- CLIENT SUBSCRIPTION METHOD ---

  /**
   * B. Client Subscription (POST /api/v1/natts/subscribe)
   */
  async subscribeClientToNatt(dto: SubscribeNattDto): Promise<UserNatt> {
    const userNattId = `user-natt-${Date.now()}`;
    const now = new Date();

    let targetAmount: number;
    let thresholdAmount: number;
    let installmentAmount: number;
    let frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    let title: string;
    let eventDueDate: string | undefined;

    if (dto.category === 'EVENT') {
      if (!dto.eventId) {
        throw new BadRequestException('eventId est requis pour la souscription à un Natt Événement.');
      }
      const event = await this.getEventNattById(dto.eventId);
      if (event.status !== 'ACTIVE') {
        throw new ForbiddenException(`Ce Natt Événement n'est plus actif (Statut: ${event.status}).`);
      }

      if (new Date(event.subscriptionDeadline) < now) {
        throw new ForbiddenException(`La date limite d'adhésion pour cet événement est dépassée.`);
      }

      targetAmount = event.targetAmount;
      thresholdAmount = event.thresholdAmount;
      installmentAmount = event.installmentAmount;
      frequency = event.frequency;
      title = event.title;
      eventDueDate = event.eventDueDate;
    } else {
      if (!dto.catalogId) {
        throw new BadRequestException('catalogId est requis pour un Natt permanent (natt_classique ou tekk_tegui).');
      }

      const catalog = this.permanentCatalogs.get(dto.catalogId);
      if (!catalog) {
        throw new NotFoundException(`Catalogue permanent ${dto.catalogId} introuvable.`);
      }

      targetAmount = dto.targetAmount || catalog.minTargetAmount;
      if (targetAmount < catalog.minTargetAmount || targetAmount > catalog.maxTargetAmount) {
        throw new BadRequestException(`Le montant cible doit être compris entre ${catalog.minTargetAmount} FCFA et ${catalog.maxTargetAmount} FCFA.`);
      }

      frequency = dto.frequency || catalog.allowedFrequencies[0];
      if (!catalog.allowedFrequencies.includes(frequency)) {
        throw new BadRequestException(`La fréquence ${frequency} n'est pas autorisée pour ce Natt.`);
      }

      // Calculate default installment amount (e.g. 10 installments)
      installmentAmount = Math.round(targetAmount / 10);
      thresholdAmount = Math.round(targetAmount * 0.70);
      title = dto.customTitle || catalog.name;
    }

    const totalInstallments = Math.ceil(targetAmount / installmentAmount);

    // Calculate next due date
    const nextDueDateObj = new Date(now);
    if (frequency === 'DAILY') nextDueDateObj.setDate(nextDueDateObj.getDate() + 1);
    else if (frequency === 'WEEKLY') nextDueDateObj.setDate(nextDueDateObj.getDate() + 7);
    else nextDueDateObj.setMonth(nextDueDateObj.getMonth() + 1);

    const userNatt: UserNatt = {
      userNattId,
      userId: dto.userId,
      category: dto.category,
      catalogId: dto.catalogId,
      eventId: dto.eventId,
      title,
      targetAmount,
      thresholdAmount,
      totalPaid: 0,
      remainingBalance: targetAmount,
      frequency,
      installmentAmount,
      totalInstallments,
      paidInstallmentsCount: 0,
      nextDueDate: nextDueDateObj.toISOString(),
      eventDueDate,
      status: 'ACTIVE',
      payoutEligible: false,
      payoutStatus: 'NOT_ELIGIBLE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.userNatts.set(userNattId, userNatt);
    this.payments.set(userNattId, []);

    this.firestoreService.userNatts().doc(userNattId).set(userNatt).catch((err) => {
      this.logger.error(`Failed to save userNatt ${userNattId} to Firestore: ${err.message}`);
    });

    this.logger.log(`Client ${dto.userId} subscribed to ${title} (UserNattId: ${userNattId}, Target: ${targetAmount} FCFA)`);
    return userNatt;
  }

  // --- TRANSACTIONAL PAYMENT & 70% RULE LOGIC ---

  /**
   * 3. Webhook / Payment Transaction Processing & 70% Threshold Rule Execution
   */
  processContribution(dto: ProcessContributionDto): {
    userNatt: UserNatt;
    payment: NattPayment;
    payoutTriggered: boolean;
    payoutTransaction?: Transaction;
    treasury: Treasury;
  } {
    const userNatt = this.userNatts.get(dto.userNattId);
    if (!userNatt) {
      throw new NotFoundException(`Souscription UserNatt ${dto.userNattId} introuvable.`);
    }

    if (userNatt.status === 'COMPLETED' || userNatt.status === 'DEFAULTED') {
      throw new BadRequestException(`Impossible d'effectuer un versement sur une souscription terminée ou en défaut.`);
    }

    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Transactional Update on UserNatt
    userNatt.totalPaid += dto.amount;
    userNatt.remainingBalance = Math.max(0, userNatt.targetAmount - userNatt.totalPaid);
    userNatt.paidInstallmentsCount += 1;
    userNatt.updatedAt = nowIso;

    // 2. Create Payment record in sub-collection
    const paymentId = `pay-${Date.now()}`;
    const payment: NattPayment = {
      paymentId,
      userNattId: dto.userNattId,
      userId: dto.userId,
      amount: dto.amount,
      paymentMethod: dto.paymentMethod,
      status: 'SUCCESS',
      paidAt: nowIso,
    };

    const userPayments = this.payments.get(dto.userNattId) || [];
    userPayments.push(payment);
    this.payments.set(dto.userNattId, userPayments);

    // Record Contribution Transaction
    const contribTxId = `tx-contrib-${Date.now()}`;
    const contribTx: Transaction = {
      transactionId: contribTxId,
      userId: dto.userId,
      userNattId: dto.userNattId,
      type: 'NATT_CONTRIBUTION',
      amount: dto.amount,
      gateway: dto.paymentMethod,
      gatewayReference: dto.gatewayReference || `GATEWAY-REF-${Date.now()}`,
      status: 'SUCCESS',
      createdAt: nowIso,
    };
    this.transactions.push(contribTx);

    // 3. Update Treasury Vault (Cash In)
    this.treasury.totalCollected += dto.amount;
    this.treasury.currentCashBalance += dto.amount;
    this.treasury.updatedAt = nowIso;

    // --- 70% THRESHOLD RULE CHECK ---
    let payoutTriggered = false;

    const progressRatio = userNatt.totalPaid / userNatt.targetAmount;
    if (progressRatio >= 0.70 && userNatt.payoutStatus === 'NOT_ELIGIBLE') {
      payoutTriggered = true;
      userNatt.payoutEligible = true;
      userNatt.status = 'PAYOUT_UNLOCKED';
      userNatt.payoutStatus = 'PENDING';

      this.logger.log(`🎯 [70% THRESHOLD REACHED] User ${dto.userId} (UserNatt ${dto.userNattId}) reached 70% (${userNatt.totalPaid} / ${userNatt.targetAmount} FCFA). Placed in Admin Payout Queue for manual disbursement.`);
    }

    if (userNatt.remainingBalance === 0 && userNatt.payoutStatus === 'PAID') {
      userNatt.status = 'COMPLETED';
    }

    this.userNatts.set(dto.userNattId, userNatt);

    return {
      userNatt,
      payment,
      payoutTriggered,
      treasury: this.treasury,
    };
  }

  /**
   * Admin Manual Trigger of 100% Payout for 70% Eligible Clients
   * (POST /api/v1/admin/payouts/process)
   */
  processAdminPayout(userNattId: string, provider: 'Wave' | 'Orange Money' | 'Virement'): {
    userNatt: UserNatt;
    payoutTransaction: Transaction;
    treasury: Treasury;
  } {
    const userNatt = this.userNatts.get(userNattId);
    if (!userNatt) {
      throw new NotFoundException(`Souscription UserNatt ${userNattId} introuvable.`);
    }

    if (!userNatt.payoutEligible || userNatt.payoutStatus !== 'PENDING') {
      throw new BadRequestException(`Cette souscription n'est pas en attente de versement admin (Statut: ${userNatt.payoutStatus}, Éligible: ${userNatt.payoutEligible}).`);
    }

    const nowIso = new Date().toISOString();
    const payoutAmount = userNatt.targetAmount;
    const payoutTxId = `tx-payout-${Date.now()}`;
    const gateway = provider === 'Wave' ? 'WAVE' : provider === 'Orange Money' ? 'ORANGE_MONEY' : 'VIREMENT';

    const payoutTransaction: Transaction = {
      transactionId: payoutTxId,
      userId: userNatt.userId,
      userNattId,
      type: 'NATT_PAYOUT',
      amount: payoutAmount,
      gateway,
      gatewayReference: `ADMIN-DISBURSED-${provider.toUpperCase().replace(/\s+/g, '')}-${Date.now()}`,
      status: 'SUCCESS',
      createdAt: nowIso,
    };

    this.transactions.push(payoutTransaction);

    // Update UserNatt Status
    userNatt.payoutStatus = 'PAID';
    userNatt.status = userNatt.remainingBalance === 0 ? 'COMPLETED' : 'PAYOUT_SENT';
    userNatt.updatedAt = nowIso;
    this.userNatts.set(userNattId, userNatt);

    // Update Treasury Vault (Cash Out & Advance Accounting)
    this.treasury.totalDisbursed += payoutAmount;
    this.treasury.currentCashBalance -= payoutAmount;

    // The remaining 30% to be collected is accounted as outstanding advances
    const advanceAmount = Math.max(0, payoutAmount - userNatt.totalPaid);
    this.treasury.outstandingAdvances += advanceAmount;
    this.treasury.updatedAt = nowIso;

    this.logger.log(`💸 [ADMIN PAYOUT EXECUTED] 100% Payout of ${payoutAmount} FCFA disbursed via ${provider} to User ${userNatt.userId} for Natt ${userNatt.title}!`);

    return {
      userNatt,
      payoutTransaction,
      treasury: this.treasury,
    };
  }

  getEligiblePayoutsForAdmin(): UserNatt[] {
    return Array.from(this.userNatts.values()).filter(
      u => u.payoutEligible && u.payoutStatus === 'PENDING'
    );
  }

  /**
   * Admin: Override payout date / grant exemption for a user subscription
   */
  async overrideUserNattPayoutDate(
    userNattId: string,
    customPayoutDate: string,
    grantExemption: boolean = true
  ): Promise<UserNatt> {
    const userNatt = this.userNatts.get(userNattId);
    if (!userNatt) {
      throw new NotFoundException(`Souscription UserNatt ${userNattId} introuvable.`);
    }

    userNatt.eventDueDate = customPayoutDate;
    if (grantExemption) {
      userNatt.payoutEligible = true;
      userNatt.payoutStatus = 'PENDING';
      userNatt.status = 'PAYOUT_UNLOCKED';
    }
    userNatt.updatedAt = new Date().toISOString();

    this.userNatts.set(userNattId, userNatt);

    this.firestoreService.userNatts().doc(userNattId).set(userNatt, { merge: true }).catch(err => {
      this.logger.error(`Failed to update payout date override for ${userNattId} in Firestore: ${err.message}`);
    });

    this.logger.log(`[ADMIN EXEMPTION] Override payout date for UserNatt ${userNattId} set to ${customPayoutDate} (Exemption: ${grantExemption})`);
    return userNatt;
  }

  // --- TREASURY & TRANSACTION QUERY METHODS ---

  getTreasuryVault(): Treasury {
    return this.treasury;
  }

  getUserNattsByUserId(userId: string): UserNatt[] {
    return Array.from(this.userNatts.values()).filter(u => u.userId === userId);
  }

  getAllUserNatts(): UserNatt[] {
    return Array.from(this.userNatts.values());
  }

  getPaymentsByNattId(userNattId: string): NattPayment[] {
    return this.payments.get(userNattId) || [];
  }

  getAllTransactions(): Transaction[] {
    return this.transactions;
  }

  /**
   * Fetch Dashboard Summary directly from Cloud Firestore
   */
  async getDashboardSummary(userId?: string): Promise<{
    success: boolean;
    summary: {
      totalSavedFcfa: number;
      nextPaymentFcfa: number;
      nextPaymentDueDate: string;
      expectedPayoutFcfa: number;
      myPayoutTurn: number;
      activeTontinesCount: number;
    };
    tontines: any[];
  }> {
    try {
      let query: any = this.firestoreService.userNatts();
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      const snapshot = await query.get();

      let userNattsList: UserNatt[] = [];

      if (!snapshot.empty) {
        userNattsList = snapshot.docs.map((doc: any) => doc.data() as UserNatt);
        for (const natt of userNattsList) {
          this.userNatts.set(natt.userNattId, natt);
        }
      }

      let totalSavedFcfa = 0;
      let expectedPayoutFcfa = 0;
      let activeTontinesCount = 0;
      let nextPaymentFcfa = 0;
      let nextPaymentDueDate = 'Non définie';
      let earliestNextDueDate: Date | null = null;
      let myPayoutTurn = 0;

      for (const natt of userNattsList) {
        totalSavedFcfa += natt.totalPaid || 0;
        if (natt.status === 'ACTIVE' || natt.status === 'PAYOUT_UNLOCKED') {
          activeTontinesCount++;
          expectedPayoutFcfa += natt.targetAmount || 0;

          if (natt.nextDueDate) {
            const dueDate = new Date(natt.nextDueDate);
            if (!earliestNextDueDate || dueDate < earliestNextDueDate) {
              earliestNextDueDate = dueDate;
              nextPaymentFcfa = natt.installmentAmount || 0;
              myPayoutTurn = (natt.paidInstallmentsCount || 0) + 1;
              const formattedDay = dueDate.getDate();
              const months = [
                'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
              ];
              const formattedMonth = months[dueDate.getMonth()];
              nextPaymentDueDate = `${formattedDay} ${formattedMonth}`;
            }
          }
        }
      }

      const tontines = userNattsList.map((natt) => {
        const dueDate = natt.nextDueDate ? new Date(natt.nextDueDate) : new Date();
        const months = [
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        const formattedNextTurnDate = `${dueDate.getDate()} ${months[dueDate.getMonth()]} ${dueDate.getFullYear()}`;

        return {
          id: natt.userNattId,
          name: natt.title,
          offerType: natt.category === 'EVENT' ? 'projet' : 'rotative',
          category: natt.frequency === 'MONTHLY' ? 'Rotative Mensuelle' : 'Rotative Journalière',
          amountPerCycle: natt.installmentAmount,
          currentTurn: natt.paidInstallmentsCount || 1,
          totalTours: natt.totalInstallments || 10,
          totalMembers: 4,
          myContributionFcfa: natt.totalPaid || 0,
          myPayoutTurn: Math.ceil((natt.totalInstallments || 10) / 2),
          nextTurnDate: formattedNextTurnDate,
          status: natt.status || 'ACTIVE',
        };
      });

      return {
        success: true,
        summary: {
          totalSavedFcfa,
          nextPaymentFcfa,
          nextPaymentDueDate,
          expectedPayoutFcfa,
          myPayoutTurn,
          activeTontinesCount,
        },
        tontines,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching dashboard summary from Firestore: ${error.message}`);
      return {
        success: true,
        summary: {
          totalSavedFcfa: 0,
          nextPaymentFcfa: 0,
          nextPaymentDueDate: 'Non définie',
          expectedPayoutFcfa: 0,
          myPayoutTurn: 0,
          activeTontinesCount: 0,
        },
        tontines: [],
      };
    }
  }

  /**
   * Fetch Transaction History directly from Cloud Firestore
   */
  async getTransactionsFromFirestore(userId?: string): Promise<{
    success: boolean;
    transactions: any[];
  }> {
    try {
      let query: any = this.firestoreService.transactions();
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      const snapshot = await query.get();

      if (snapshot.empty) {
        return {
          success: true,
          transactions: [],
        };
      }

      const txList = snapshot.docs.map((doc: any) => doc.data() as Transaction);

      const formattedTxs = txList.map((tx) => {
        const isPayout = tx.type === 'NATT_PAYOUT';
        const dateObj = new Date(tx.createdAt);
        const months = [
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} à ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

        return {
          id: tx.transactionId,
          type: isPayout ? 'payout' : 'contribution',
          title: isPayout ? 'Versement du Natt' : 'Cotisation Natt',
          tontineName: tx.userNattId ? 'Natt Express' : 'Cotisation',
          amountFcfa: tx.amount,
          provider: tx.gateway ? tx.gateway.toLowerCase().replace('_', '') : 'wave',
          providerName: tx.gateway === 'ORANGE_MONEY' ? 'Orange Money' : 'Wave Sénégal',
          reference: tx.gatewayReference || tx.transactionId,
          date: formattedDate,
          status: tx.status || 'SUCCESS',
        };
      });

      return {
        success: true,
        transactions: formattedTxs,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching transactions from Firestore: ${error.message}`);
      return {
        success: true,
        transactions: [],
      };
    }
  }
}
