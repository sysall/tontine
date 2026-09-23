import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  constructor() {
    this.seedInitialEvents();
  }

  /**
   * Seed initial sample data
   */
  private seedInitialEvents() {
    const tabaski: EventNatt = {
      eventId: 'evt-tabaski-2026',
      title: 'Opération Tabaski 2026',
      description: 'Épargne ciblée pour l\'achat de moutons et préparatifs de la fête de la Tabaski.',
      bannerImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
      targetAmount: 300000,
      thresholdAmount: 210000, // 70% of 300,000
      installmentAmount: 50000,
      frequency: 'MONTHLY',
      subscriptionDeadline: '2026-05-15T23:59:59.000Z',
      eventDueDate: '2026-06-15T00:00:00.000Z',
      status: 'ACTIVE',
      createdBy: 'admin-super',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const rentree: EventNatt = {
      eventId: 'evt-rentree-2026',
      title: 'Pack Rentrée Scolaire 2026',
      description: 'Cotisation bimensuelle pour les fournitures et frais de scolarité des enfants.',
      bannerImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      targetAmount: 150000,
      thresholdAmount: 105000, // 70% of 150,000
      installmentAmount: 15000,
      frequency: 'WEEKLY',
      subscriptionDeadline: '2026-09-01T23:59:59.000Z',
      eventDueDate: '2026-10-01T00:00:00.000Z',
      status: 'ACTIVE',
      createdBy: 'admin-super',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.eventNatts.set(tabaski.eventId, tabaski);
    this.eventNatts.set(rentree.eventId, rentree);
  }

  // --- CATALOG & EVENT METHODS ---

  getPermanentCatalogs(): NattCatalogItem[] {
    return Array.from(this.permanentCatalogs.values());
  }

  getActiveEventNatts(): EventNatt[] {
    return Array.from(this.eventNatts.values()).filter(e => e.status === 'ACTIVE');
  }

  getAllEventNattsForAdmin(): EventNatt[] {
    return Array.from(this.eventNatts.values());
  }

  getEventNattById(eventId: string): EventNatt {
    const event = this.eventNatts.get(eventId);
    if (!event) {
      throw new NotFoundException(`Natt Événement avec l'ID ${eventId} introuvable.`);
    }
    return event;
  }

  /**
   * A. Admin: Create Event Natt
   */
  createEventNatt(dto: CreateEventNattDto, adminUid: string = 'admin-default'): EventNatt {
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
    this.logger.log(`[ADMIN] Created new Event Natt: ${newEvent.title} (ID: ${eventId}, Threshold: ${thresholdAmount} FCFA)`);
    return newEvent;
  }

  /**
   * A. Admin: Update Event Natt
   */
  updateEventNatt(eventId: string, dto: UpdateEventNattDto): EventNatt {
    const existing = this.getEventNattById(eventId);
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
    this.logger.log(`[ADMIN] Updated Event Natt ID: ${eventId}`);
    return updated;
  }

  /**
   * A. Admin: Delete / Soft Delete Event Natt
   * Blocking new subscriptions without interrupting existing contracts
   */
  deleteEventNatt(eventId: string): { success: boolean; message: string } {
    const existing = this.getEventNattById(eventId);

    // Check if users are subscribed to this event
    const activeSubscribers = Array.from(this.userNatts.values()).filter(
      u => u.eventId === eventId && u.status !== 'COMPLETED'
    );

    // Soft delete / archive to block new subscriptions while preserving existing user contracts
    existing.status = 'DELETED';
    existing.updatedAt = new Date().toISOString();
    this.eventNatts.set(eventId, existing);

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
  subscribeClientToNatt(dto: SubscribeNattDto): UserNatt {
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
      const event = this.getEventNattById(dto.eventId);
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
}
