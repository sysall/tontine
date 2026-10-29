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
import { AuthenticatedUser, belongsToUser, userIdentifiers, normalizePhoneNumber, phonesMatch } from '../auth/user-identity';
import { NotificationsService } from '../notifications/notifications.service';

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

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /** Next installment date: one period after the current due date (keeps the schedule if the user is late). */
  private advanceDueDate(currentDueIso: string | undefined, frequency: string | undefined): string {
    const base = currentDueIso ? new Date(currentDueIso) : new Date();
    const next = Number.isNaN(base.getTime()) ? new Date() : base;
    if (frequency === 'DAILY') next.setDate(next.getDate() + 1);
    else if (frequency === 'WEEKLY') next.setDate(next.getDate() + 7);
    else next.setMonth(next.getMonth() + 1);
    return next.toISOString();
  }

  // --- CATALOG & EVENT METHODS ---

  getPermanentCatalogs(): NattCatalogItem[] {
    return Array.from(this.permanentCatalogs.values());
  }

  async getActiveEventNatts(): Promise<EventNatt[]> {
    try {
      const snapshot = await this.firestoreService.eventNatts().get();
      if (!snapshot.empty) {
        const events = snapshot.docs
          .map(doc => {
            const d = doc.data() as EventNatt;
            const targetAmount = d.targetAmount || 1000000;
            const installmentAmount = d.installmentAmount || Math.round(targetAmount / 10);
            return {
              ...d,
              eventId: doc.id,
              targetAmount,
              installmentAmount,
              frequency: d.frequency || 'DAILY',
              status: d.status || 'ACTIVE',
            };
          })
          .filter(e => e.status !== 'INACTIVE' && e.status !== 'DELETED');

        for (const e of events) {
          this.eventNatts.set(e.eventId, e);
        }
        return events;
      }
      return Array.from(this.eventNatts.values()).filter(e => e.status !== 'INACTIVE' && e.status !== 'DELETED');
    } catch (err: any) {
      this.logger.error(`Error fetching eventNatts from Firestore: ${err.message}`);
      return Array.from(this.eventNatts.values()).filter(e => e.status !== 'INACTIVE' && e.status !== 'DELETED');
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

      targetAmount = dto.targetAmount || event.targetAmount;
      thresholdAmount = Math.round(targetAmount * 0.70);
      installmentAmount = dto.initialPaymentAmount || Math.round(targetAmount / 10);
      frequency = dto.frequency || event.frequency || 'DAILY';
      title = dto.customTitle || event.title;
      eventDueDate = event.eventDueDate;

      // Increment subscribersCount for this event in Firestore
      try {
        const eventRef = this.firestoreService.eventNatts().doc(dto.eventId);
        const eventSnap = await eventRef.get();
        const currentCount = eventSnap.exists ? (eventSnap.data()?.subscribersCount || 0) : 0;
        await eventRef.set({ subscribersCount: currentCount + 1, updatedAt: now.toISOString() }, { merge: true });
        this.logger.log(`Incremented subscribersCount for Event Natt ${dto.eventId} to ${currentCount + 1}`);
      } catch (evtErr: any) {
        this.logger.warn(`Failed to increment subscribersCount for Event Natt ${dto.eventId}: ${evtErr.message}`);
      }
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

      // Calculate default installment amount & total tours based on catalog:
      // - natt_classique: 4 tours (mensuels) -> targetAmount / 4 (ex: 250 000 / 4 = 62 500 FCFA)
      // - tekk_tegui: 10 tours (journaliers) -> targetAmount / 10
      const defaultTours = dto.catalogId === 'natt_classique' ? 4 : 10;
      installmentAmount = dto.initialPaymentAmount || Math.round(targetAmount / defaultTours);
      thresholdAmount = Math.round(targetAmount * 0.70);
      title = dto.customTitle || catalog.name;
    }

    const defaultTours = dto.category === 'EVENT' ? 10 : (dto.catalogId === 'natt_classique' ? 4 : 10);
    const totalInstallments = defaultTours;
    const initialPaid = dto.initialPaymentAmount || 0;
    const paidCount = initialPaid > 0 ? 1 : 0;
    const remainingBalance = Math.max(0, targetAmount - initialPaid);

    // Calculate next due date
    const nextDueDateObj = new Date(now);
    if (frequency === 'DAILY') nextDueDateObj.setDate(nextDueDateObj.getDate() + 1);
    else if (frequency === 'WEEKLY') nextDueDateObj.setDate(nextDueDateObj.getDate() + 7);
    else nextDueDateObj.setMonth(nextDueDateObj.getMonth() + 1);

    const userNatt: UserNatt = {
      userNattId,
      userId: dto.userId,
      userPhone: dto.userPhone || dto.userId,
      category: dto.category,
      catalogId: dto.catalogId || null as any,
      eventId: dto.eventId || null as any,
      title,
      targetAmount,
      thresholdAmount,
      totalPaid: initialPaid,
      remainingBalance,
      frequency,
      installmentAmount,
      totalInstallments,
      paidInstallmentsCount: paidCount,
      nextDueDate: nextDueDateObj.toISOString(),
      eventDueDate: eventDueDate || null as any,
      status: 'ACTIVE',
      payoutEligible: initialPaid / targetAmount >= 0.70,
      payoutStatus: initialPaid / targetAmount >= 0.70 ? 'PENDING' : 'NOT_ELIGIBLE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.userNatts.set(userNattId, userNatt);
    this.payments.set(userNattId, []);

    // Await Firestore write so subscription is guaranteed to be persisted before API response
    try {
      await this.firestoreService.userNatts().doc(userNattId).set(userNatt);
    } catch (err: any) {
      this.logger.error(`Failed to save userNatt ${userNattId} to Firestore: ${err.message}`);
    }

    if (initialPaid > 0) {
      const paymentId = `pay-${Date.now()}`;
      const payment: NattPayment = {
        paymentId,
        userNattId,
        userId: dto.userId,
        amount: initialPaid,
        paymentMethod: (dto.paymentMethod || 'wave') as any,
        status: 'SUCCESS',
        paidAt: now.toISOString(),
      };
      this.payments.set(userNattId, [payment]);

      const txId = `tx-${Date.now()}`;
      const contribTx: Transaction = {
        transactionId: txId,
        userId: dto.userId,
        userNattId,
        type: 'NATT_CONTRIBUTION',
        amount: initialPaid,
        gateway: ((dto.paymentMethod || 'WAVE').toUpperCase()) as any,
        gatewayReference: `INIT-SUB-${Date.now()}`,
        status: 'SUCCESS',
        createdAt: now.toISOString(),
      };
      this.transactions.push(contribTx);

      this.firestoreService.userNatts().doc(userNattId).collection('payments').doc(paymentId).set(payment).catch(err => {
        this.logger.error(`Failed to save initial payment ${paymentId} to Firestore: ${err.message}`);
      });

      this.firestoreService.transactions().doc(txId).set(contribTx).catch(err => {
        this.logger.error(`Failed to save initial transaction ${txId} to Firestore: ${err.message}`);
      });
    }

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
    userNatt.nextDueDate = this.advanceDueDate(userNatt.nextDueDate, userNatt.frequency);
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

    // Persist changes to Firestore
    this.firestoreService.userNatts().doc(dto.userNattId).set(userNatt, { merge: true }).catch(err => {
      this.logger.error(`Failed to update userNatt ${dto.userNattId} in Firestore: ${err.message}`);
    });

    this.firestoreService.userNatts().doc(dto.userNattId).collection('payments').doc(paymentId).set(payment).catch(err => {
      this.logger.error(`Failed to save payment ${paymentId} in Firestore: ${err.message}`);
    });

    this.firestoreService.transactions().doc(contribTxId).set(contribTx).catch(err => {
      this.logger.error(`Failed to save transaction ${contribTxId} in Firestore: ${err.message}`);
    });

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

    this.firestoreService.userNatts().doc(userNattId).set(userNatt, { merge: true }).catch(err => {
      this.logger.error(`Failed to update userNatt ${userNattId} in Firestore: ${err.message}`);
    });

    this.firestoreService.transactions().doc(payoutTxId).set(payoutTransaction).catch(err => {
      this.logger.error(`Failed to save payout transaction ${payoutTxId} in Firestore: ${err.message}`);
    });

    this.logger.log(`💸 [ADMIN PAYOUT EXECUTED] 100% Payout of ${payoutAmount} FCFA disbursed via ${provider} to User ${userNatt.userId} for Natt ${userNatt.title}!`);

    this.notificationsService
      .notifyPayout({
        userId: userNatt.userId,
        userPhone: userNatt.userPhone,
        userNattId,
        nattTitle: userNatt.title,
        amountFcfa: payoutAmount,
        provider,
        reference: payoutTransaction.gatewayReference,
        transactionId: payoutTxId,
      })
      .catch(err => this.logger.error(`Failed to notify payout ${payoutTxId}: ${err.message}`));

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

  async getUserNattById(userNattId: string): Promise<UserNatt> {
    const memory = this.userNatts.get(userNattId);
    if (memory) return memory;
    try {
      const doc = await this.firestoreService.userNatts().doc(userNattId).get();
      if (doc.exists) {
        const data = doc.data() as UserNatt;
        this.userNatts.set(userNattId, data);
        return data;
      }
    } catch (e: any) {
      this.logger.error(`Error loading userNatt ${userNattId} from Firestore: ${e.message}`);
    }
    throw new NotFoundException(`Souscription UserNatt ${userNattId} introuvable.`);
  }

  async getUserNattsForUser(user: AuthenticatedUser): Promise<UserNatt[]> {
    try {
      const snapshot = await this.firestoreService.userNatts().get();
      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          const d = doc.data() as UserNatt;
          if (d && d.userNattId) {
            this.userNatts.set(d.userNattId, d);
          }
        }
      }
    } catch (e: any) {
      this.logger.warn(`Could not sync userNatts from Firestore: ${e.message}`);
    }
    return Array.from(this.userNatts.values()).filter(u => belongsToUser(u, user));
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
  async getDashboardSummary(userOrId?: AuthenticatedUser | string): Promise<{
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
      // Merge both in-memory userNatts Map and Firestore documents (deduplicated by userNattId)
      const mergedMap = new Map<string, UserNatt>();

      // 1. Put in-memory items
      for (const [id, item] of this.userNatts.entries()) {
        mergedMap.set(id, item);
      }

      // 2. Put Firestore items
      const snapshot = await this.firestoreService.userNatts().get();
      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          const data = doc.data() as UserNatt;
          if (data && data.userNattId) {
            mergedMap.set(data.userNattId, data);
          }
        }
      }

      let userNattsList: UserNatt[] = Array.from(mergedMap.values());

      // Filter userNatts list for specific userOrId if provided
      if (userOrId) {
        if (typeof userOrId === 'object' && userOrId !== null) {
          userNattsList = userNattsList.filter(natt => belongsToUser(natt, userOrId));
        } else if (typeof userOrId === 'string' && userOrId.trim()) {
          const rawId = userOrId.trim();
          const searchTokens = new Set<string>();
          searchTokens.add(rawId);
          const clean = rawId.replace(/\D/g, '');
          if (clean) {
            const local9 = clean.slice(-9);
            searchTokens.add(clean);
            searchTokens.add(local9);
            searchTokens.add(`+221${local9}`);
            searchTokens.add(`221${local9}`);
            searchTokens.add(`user_${clean}`);
            searchTokens.add(`user_${local9}`);
            searchTokens.add(`mem-${clean}`);
            searchTokens.add(`mem-${local9}`);
          }

          userNattsList = userNattsList.filter((natt) => {
            const uId = natt.userId || '';
            const uPhone = natt.userPhone || '';
            const uIdClean = uId.replace(/\D/g, '');
            const uPhoneClean = uPhone.replace(/\D/g, '');
            const local9 = clean.slice(-9);

            return (
              searchTokens.has(uId) ||
              searchTokens.has(uPhone) ||
              (local9.length >= 9 && (uIdClean.endsWith(local9) || uPhoneClean.endsWith(local9)))
            );
          });
        }
      }

      for (const natt of userNattsList) {
        this.userNatts.set(natt.userNattId, natt);
      }

      let totalSavedFcfa = 0;
      let expectedPayoutFcfa = 0;
      let activeTontinesCount = 0;
      let nextPaymentFcfa = 0;
      let nextPaymentDueDate = '';
      let earliestNextDueDate: Date | null = null;
      let myPayoutTurn = 0;

      for (const natt of userNattsList) {
        totalSavedFcfa += natt.totalPaid || 0;
        if (natt.status === 'ACTIVE' || natt.status === 'PAYOUT_UNLOCKED') {
          activeTontinesCount++;
          expectedPayoutFcfa += natt.targetAmount || 0;

          const isClassique = natt.catalogId === 'natt_classique' || (natt.title && natt.title.toLowerCase().includes('classique')) || (natt.frequency === 'MONTHLY' && natt.category === 'PERMANENT');
          const computedInstallmentAmount = isClassique
            ? Math.round((natt.targetAmount || 250000) / 4)
            : (natt.installmentAmount || Math.round((natt.targetAmount || 100000) / 10));

          // Sum next installment across ALL active Natts with remaining balance
          if (natt.remainingBalance > 0) {
            nextPaymentFcfa += computedInstallmentAmount;
          }

          if (natt.nextDueDate) {
            const dueDate = new Date(natt.nextDueDate);
            if (!earliestNextDueDate || dueDate < earliestNextDueDate) {
              earliestNextDueDate = dueDate;
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

        const isClassique = natt.catalogId === 'natt_classique' || (natt.title && natt.title.toLowerCase().includes('classique')) || (natt.frequency === 'MONTHLY' && natt.category === 'PERMANENT');
        const totalTours = isClassique ? 4 : (natt.totalInstallments || 10);
        const totalMembers = isClassique ? 4 : 10;
        const computedInstallmentAmount = isClassique
          ? Math.round((natt.targetAmount || 250000) / 4)
          : (natt.installmentAmount || Math.round((natt.targetAmount || 100000) / 10));

        return {
          id: natt.userNattId,
          name: natt.title,
          offerType: isClassique ? 'rotative' : 'projet',
          category: isClassique ? 'Rotative Mensuelle' : 'Rotative Journalière',
          targetAmountFcfa: natt.targetAmount || (computedInstallmentAmount * totalTours),
          amountPerCycle: computedInstallmentAmount,
          currentTurn: natt.paidInstallmentsCount || 1,
          totalTours,
          totalMembers,
          myContributionFcfa: natt.totalPaid || 0,
          myPayoutTurn: isClassique ? 3 : 9,
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
          nextPaymentDueDate: '',
          expectedPayoutFcfa: 0,
          myPayoutTurn: 0,
          activeTontinesCount: 0,
        },
        tontines: [],
      };
    }
  }

  /**
   * Fetch Transaction History directly from Cloud Firestore & In-memory Store
   */
  async getTransactionsFromFirestore(userOrId?: AuthenticatedUser | string): Promise<{
    success: boolean;
    transactions: any[];
  }> {
    try {
      const mergedTxMap = new Map<string, any>();

      // 1. In-memory transactions
      for (const tx of this.transactions) {
        if (tx && tx.transactionId) {
          mergedTxMap.set(tx.transactionId, tx);
        }
      }

      // 2. Cloud Firestore transactions
      const snapshot = await this.firestoreService.transactions().get();
      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          const data = doc.data();
          if (data && data.transactionId) {
            mergedTxMap.set(data.transactionId, data);
          }
        }
      }

      let user: AuthenticatedUser | null = null;
      let singleId: string | null = null;

      if (userOrId && typeof userOrId === 'object' && ('uid' in userOrId || 'docId' in userOrId || 'phoneNumber' in userOrId)) {
        user = userOrId as AuthenticatedUser;
      } else if (typeof userOrId === 'string' && userOrId.trim()) {
        singleId = userOrId.trim();
      }

      // Collect userNatts and user identifiers
      const candidateIds = new Set<string>();
      const userNattIds = new Set<string>();

      if (user) {
        const uIds = userIdentifiers(user);
        uIds.forEach(id => candidateIds.add(id));
        if (user.phoneNumber) {
          const norm = normalizePhoneNumber(user.phoneNumber);
          const digits = norm.replace(/\D/g, '');
          const local9 = digits.slice(-9);
          candidateIds.add(user.phoneNumber);
          candidateIds.add(norm);
          candidateIds.add(digits);
          candidateIds.add(local9);
          candidateIds.add(`user_${digits}`);
          candidateIds.add(`user_${local9}`);
          candidateIds.add(`mem-${local9}`);
        }
        if ((user as any).paymentPhoneNumber) {
          const norm = normalizePhoneNumber((user as any).paymentPhoneNumber);
          const digits = norm.replace(/\D/g, '');
          candidateIds.add((user as any).paymentPhoneNumber);
          candidateIds.add(norm);
          candidateIds.add(digits);
          candidateIds.add(digits.slice(-9));
        }

        // Get user natts for this user to match transactions by userNattId
        const userNatts = await this.getUserNattsForUser(user);
        for (const natt of userNatts) {
          if (natt.userNattId) userNattIds.add(natt.userNattId);
        }
      } else if (singleId) {
        candidateIds.add(singleId);
        const digits = singleId.replace(/\D/g, '');
        if (digits) {
          const local9 = digits.slice(-9);
          candidateIds.add(digits);
          candidateIds.add(local9);
          candidateIds.add(`+221${local9}`);
          candidateIds.add(`221${local9}`);
          candidateIds.add(`user_${digits}`);
          candidateIds.add(`user_${local9}`);
          candidateIds.add(`mem-${local9}`);
          candidateIds.add(`mem-${digits}`);
        }

        // Sync userNatts from Firestore if memory cache is empty
        if (!this.userNatts.size) {
          try {
            const snap = await this.firestoreService.userNatts().get();
            if (!snap.empty) {
              for (const doc of snap.docs) {
                const d = doc.data() as UserNatt;
                if (d && d.userNattId) this.userNatts.set(d.userNattId, d);
              }
            }
          } catch (e: any) {
            this.logger.warn(`Could not sync userNatts in getTransactions: ${e.message}`);
          }
        }

        // Match userNatts by singleId
        for (const natt of this.userNatts.values()) {
          const nattUId = natt.userId || '';
          const nattPhone = natt.userPhone || '';
          if (
            candidateIds.has(nattUId) ||
            candidateIds.has(nattPhone) ||
            (digits.length >= 6 && (nattUId.replace(/\D/g, '').includes(digits) || nattPhone.replace(/\D/g, '').includes(digits)))
          ) {
            if (natt.userNattId) userNattIds.add(natt.userNattId);
            if (natt.userId) candidateIds.add(natt.userId);
          }
        }
      }

      const allTxs = Array.from(mergedTxMap.values());

      let filteredTxs = allTxs;
      if (user || singleId) {
        filteredTxs = allTxs.filter((tx) => {
          // A. Linked to user's subscription
          if (tx.userNattId && userNattIds.has(tx.userNattId)) return true;

          // B. Direct match on tx.userId
          if (tx.userId && candidateIds.has(tx.userId)) return true;

          // C. Match on tx.clientPhone or tx.userPhone
          const txPhone = tx.clientPhone || tx.userPhone;
          if (txPhone && candidateIds.has(txPhone)) return true;

          // D. Belongs to user helper
          if (user && belongsToUser({ userId: tx.userId, userPhone: txPhone }, user)) return true;

          // E. Senegalese 9-digit suffix match
          const cleanSingle = (singleId || user?.phoneNumber || '').replace(/\D/g, '');
          if (cleanSingle.length >= 9) {
            const local9 = cleanSingle.slice(-9);
            const uClean = (tx.userId || '').replace(/\D/g, '');
            const phoneClean = (txPhone || '').replace(/\D/g, '');
            if ((uClean.length >= 9 && uClean.endsWith(local9)) || (phoneClean.length >= 9 && phoneClean.endsWith(local9))) {
              return true;
            }
          }

          return false;
        });
      }

      // Sort newest first
      filteredTxs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      const formattedTxs = filteredTxs.map((tx) => {
        const isPayout = tx.type === 'NATT_PAYOUT';
        const dateObj = new Date(tx.createdAt);
        const months = [
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        const formattedDate = !isNaN(dateObj.getTime())
          ? `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} à ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`
          : (tx.createdAt || 'Date inconnue');

        const userNatt = tx.userNattId ? this.userNatts.get(tx.userNattId) : null;
        const nattTitle = tx.nattTitle || userNatt?.title || (tx.userNattId ? 'Natt Express' : 'Cotisation');

        let provider: 'wave' | 'orange_money' | 'free_money' = 'wave';
        let providerName = 'Wave Sénégal';
        const gwUpper = (tx.gateway || '').toUpperCase();
        if (gwUpper.includes('ORANGE')) {
          provider = 'orange_money';
          providerName = 'Orange Money';
        } else if (gwUpper.includes('FREE')) {
          provider = 'free_money';
          providerName = 'Free Money';
        } else if (gwUpper.includes('VIREMENT')) {
          provider = 'wave';
          providerName = 'Virement Bancaire';
        }

        return {
          id: tx.transactionId,
          type: isPayout ? 'payout' : 'contribution',
          title: isPayout ? 'Versement du Natt' : (nattTitle ? `Cotisation ${nattTitle}` : 'Cotisation Natt'),
          tontineName: nattTitle,
          amountFcfa: tx.amount,
          provider,
          providerName,
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
