import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { FirestoreService } from '../firestore/firestore.service';
import {
  AuthenticatedUser,
  belongsToUser,
  normalizePhoneNumber,
  userIdentifiers,
} from '../auth/user-identity';

/**
 * Only two notification kinds are supported for now:
 * - PAYMENT_OVERDUE : the user is late on a Natt installment
 * - PAYOUT_RECEIVED : an admin disbursed a payout to the user
 */
export type NotificationType = 'PAYMENT_OVERDUE' | 'PAYOUT_RECEIVED';

export interface UserNotification {
  notificationId: string;
  userId: string;
  userPhone?: string | null;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  readAt?: string | null;
  /** Soft-deleted by the user ("Vider l'historique"). Kept so dedupe keys stay reserved. */
  dismissed?: boolean;
  userNattId?: string | null;
  metadata?: {
    nattTitle?: string;
    amountFcfa?: number;
    dueDate?: string;
    daysOverdue?: number;
    reminderIndex?: number;
    provider?: string;
    reference?: string;
    transactionId?: string;
  };
  createdAt: string;
}

export interface PayoutNotificationInput {
  userId: string;
  userPhone?: string | null;
  userNattId: string;
  nattTitle: string;
  amountFcfa: number;
  provider: string;
  reference: string;
  transactionId: string;
}

/** Minimal shape of a /user_natts document needed to evaluate overdue status. */
interface OverdueCandidate {
  userNattId?: string;
  userId?: string;
  userPhone?: string;
  title?: string;
  catalogId?: string;
  category?: string;
  frequency?: string;
  targetAmount?: number;
  installmentAmount?: number;
  remainingBalance?: number;
  nextDueDate?: string;
  status?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** A new reminder is sent every N days while the installment stays unpaid. */
const OVERDUE_REMINDER_INTERVAL_DAYS = 3;
const CLOSED_STATUSES = new Set(['COMPLETED', 'DEFAULTED']);
const FIRESTORE_ALREADY_EXISTS = 6;
const FIRESTORE_IN_QUERY_LIMIT = 30;

@Injectable()
export class NotificationsService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsService.name);
  private scanTimer: NodeJS.Timeout | null = null;
  private initialScanTimer: NodeJS.Timeout | null = null;
  private isScanning = false;

  constructor(private readonly firestoreService: FirestoreService) {}

  // ---------------------------------------------------------------------------
  // Lifecycle: periodic overdue scan
  // ---------------------------------------------------------------------------

  onApplicationBootstrap() {
    const minutes = Number(process.env.NOTIFICATIONS_OVERDUE_SCAN_MINUTES || 60);
    if (!Number.isFinite(minutes) || minutes <= 0) {
      this.logger.warn('Scan périodique des retards désactivé (NOTIFICATIONS_OVERDUE_SCAN_MINUTES <= 0).');
      return;
    }

    this.initialScanTimer = setTimeout(() => this.scanAllOverdueContributions(), 30_000);
    this.scanTimer = setInterval(() => this.scanAllOverdueContributions(), minutes * 60_000);
    this.initialScanTimer.unref?.();
    this.scanTimer.unref?.();
    this.logger.log(`Scan des cotisations en retard planifié toutes les ${minutes} min.`);
  }

  onModuleDestroy() {
    if (this.initialScanTimer) clearTimeout(this.initialScanTimer);
    if (this.scanTimer) clearInterval(this.scanTimer);
  }

  // ---------------------------------------------------------------------------
  // Triggers
  // ---------------------------------------------------------------------------

  /**
   * Notify a user that an admin disbursed a payout.
   * Idempotent: one notification per payout transaction.
   */
  async notifyPayout(input: PayoutNotificationInput): Promise<void> {
    if (!input.userId) {
      this.logger.warn(`Notification de versement ignorée : userId manquant (tx ${input.transactionId}).`);
      return;
    }

    const amount = this.formatFcfa(input.amountFcfa);
    await this.createOnce(`payout_${input.transactionId}`, {
      userId: input.userId,
      userPhone: input.userPhone || null,
      type: 'PAYOUT_RECEIVED',
      title: 'Versement reçu 💸',
      body: `L'administrateur vous a versé ${amount} pour « ${input.nattTitle} » via ${input.provider}. Réf. ${input.reference}.`,
      userNattId: input.userNattId,
      metadata: {
        nattTitle: input.nattTitle,
        amountFcfa: input.amountFcfa,
        provider: input.provider,
        reference: input.reference,
        transactionId: input.transactionId,
      },
    });
  }

  /**
   * Scan every subscription and create overdue reminders where needed.
   * Called periodically; safe to run concurrently with per-user scans thanks to idempotent IDs.
   */
  async scanAllOverdueContributions(): Promise<number> {
    if (this.isScanning) return 0;
    this.isScanning = true;
    try {
      const snap = await this.firestoreService.userNatts().get();
      const candidates = snap.docs.map((doc) => ({ ...(doc.data() as OverdueCandidate), userNattId: doc.id }));
      const created = await this.processOverdueCandidates(candidates);
      if (created > 0) {
        this.logger.log(`Scan des retards : ${created} notification(s) créée(s).`);
      }
      return created;
    } catch (err: any) {
      this.logger.warn(`Scan des retards impossible : ${err.message}`);
      return 0;
    } finally {
      this.isScanning = false;
    }
  }

  // ---------------------------------------------------------------------------
  // User-facing queries
  // ---------------------------------------------------------------------------

  async listForUser(user: AuthenticatedUser, limit = 50) {
    // Make sure overdue reminders are up to date before returning the list
    await this.scanOverdueForUser(user).catch((err) =>
      this.logger.warn(`Scan des retards (utilisateur) impossible : ${err.message}`),
    );

    const all = (await this.findUserNotificationDocs(user))
      .map((doc) => doc.data() as UserNotification)
      .filter((n) => !n.dismissed)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return {
      notifications: all.slice(0, limit),
      unreadCount: all.filter((n) => !n.read).length,
    };
  }

  async markAsRead(user: AuthenticatedUser, notificationId: string) {
    const ref = this.firestoreService.notifications().doc(notificationId);
    const snap = await ref.get();
    const data = snap.data() as UserNotification | undefined;
    if (!snap.exists || !data || !belongsToUser(data, user)) {
      throw new NotFoundException('Notification introuvable.');
    }
    if (!data.read) {
      await ref.update({ read: true, readAt: new Date().toISOString() });
    }
    return { ...data, read: true };
  }

  async markAllAsRead(user: AuthenticatedUser) {
    const docs = (await this.findUserNotificationDocs(user)).filter((d) => {
      const n = d.data() as UserNotification;
      return !n.read && !n.dismissed;
    });
    await this.batchUpdate(docs, { read: true, readAt: new Date().toISOString() });
    return { updated: docs.length };
  }

  /** Soft-delete: hides notifications without freeing their dedupe key. */
  async clearAll(user: AuthenticatedUser) {
    const docs = (await this.findUserNotificationDocs(user)).filter(
      (d) => !(d.data() as UserNotification).dismissed,
    );
    await this.batchUpdate(docs, { dismissed: true, read: true });
    return { cleared: docs.length };
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private async scanOverdueForUser(user: AuthenticatedUser) {
    const { ids, phones } = this.lookupKeys(user);
    const col = this.firestoreService.userNatts();
    const snaps = await Promise.all([
      ...this.chunk(ids).map((c) => col.where('userId', 'in', c).get()),
      ...this.chunk(phones).map((c) => col.where('userPhone', 'in', c).get()),
    ]);

    const byId = new Map<string, OverdueCandidate>();
    snaps.forEach((s) =>
      s.docs.forEach((doc) => byId.set(doc.id, { ...(doc.data() as OverdueCandidate), userNattId: doc.id })),
    );
    return this.processOverdueCandidates(Array.from(byId.values()));
  }

  private async processOverdueCandidates(candidates: OverdueCandidate[]): Promise<number> {
    const nowMs = Date.now();
    let created = 0;

    for (const natt of candidates) {
      if (!natt.userNattId || !natt.userId || !natt.nextDueDate) continue;
      if (CLOSED_STATUSES.has(natt.status || '')) continue;
      if (!natt.remainingBalance || natt.remainingBalance <= 0) continue;

      const dueMs = new Date(natt.nextDueDate).getTime();
      if (!Number.isFinite(dueMs) || dueMs >= nowMs) continue;

      const elapsedDays = Math.floor((nowMs - dueMs) / DAY_MS);
      const reminderIndex = Math.floor(elapsedDays / OVERDUE_REMINDER_INTERVAL_DAYS);
      const daysOverdue = Math.max(1, elapsedDays);
      const amountFcfa = Math.min(natt.remainingBalance, this.installmentAmount(natt));
      const nattTitle = natt.title || 'votre Natt';
      const dueDateLabel = new Date(dueMs).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const dueKey = new Date(dueMs).toISOString().slice(0, 10);

      const isFirst = reminderIndex === 0;
      const wasCreated = await this.createOnce(`overdue_${natt.userNattId}_${dueKey}_r${reminderIndex}`, {
        userId: natt.userId,
        userPhone: natt.userPhone || null,
        type: 'PAYMENT_OVERDUE',
        title: isFirst ? 'Cotisation en retard ⏰' : 'Rappel : cotisation toujours en retard ⏰',
        body:
          `Votre cotisation de ${this.formatFcfa(amountFcfa)} pour « ${nattTitle} » était attendue le ${dueDateLabel}` +
          ` (retard de ${daysOverdue} jour${daysOverdue > 1 ? 's' : ''}). Réglez-la dès maintenant pour rester éligible au versement.`,
        userNattId: natt.userNattId,
        metadata: {
          nattTitle,
          amountFcfa,
          dueDate: natt.nextDueDate,
          daysOverdue,
          reminderIndex,
        },
      });
      if (wasCreated) created++;
    }

    return created;
  }

  /** Mirrors the installment logic used by the dashboard summary. */
  private installmentAmount(natt: OverdueCandidate): number {
    const target = natt.targetAmount || 0;
    const isClassique =
      natt.catalogId === 'natt_classique' ||
      (natt.title || '').toLowerCase().includes('classique') ||
      (natt.frequency === 'MONTHLY' && natt.category === 'PERMANENT');
    if (isClassique) return Math.round((target || 250000) / 4);
    return natt.installmentAmount || Math.round((target || 100000) / 10);
  }

  /**
   * Create a notification with a deterministic ID. Returns false if it already exists.
   * `create()` is atomic, so concurrent scans can never produce duplicates.
   */
  private async createOnce(
    notificationId: string,
    data: Omit<UserNotification, 'notificationId' | 'read' | 'createdAt'>,
  ): Promise<boolean> {
    const doc: UserNotification = {
      ...data,
      notificationId,
      read: false,
      readAt: null,
      dismissed: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await this.firestoreService.notifications().doc(notificationId).create(doc);
      return true;
    } catch (err: any) {
      if (err?.code === FIRESTORE_ALREADY_EXISTS) return false;
      this.logger.error(`Création de la notification ${notificationId} impossible : ${err.message}`);
      return false;
    }
  }

  private async findUserNotificationDocs(user: AuthenticatedUser) {
    const { ids, phones } = this.lookupKeys(user);
    const col = this.firestoreService.notifications();
    const snaps = await Promise.all([
      ...this.chunk(ids).map((c) => col.where('userId', 'in', c).get()),
      ...this.chunk(phones).map((c) => col.where('userPhone', 'in', c).get()),
    ]);

    const byId = new Map<string, QueryDocumentSnapshot>();
    snaps.forEach((s) => s.docs.forEach((doc) => byId.set(doc.id, doc)));
    return Array.from(byId.values());
  }

  private lookupKeys(user: AuthenticatedUser) {
    const ids = userIdentifiers(user);
    const phones = new Set<string>();
    if (user.phoneNumber) {
      const normalized = normalizePhoneNumber(user.phoneNumber);
      const digits = normalized.replace(/\D/g, '');
      [user.phoneNumber, normalized, digits, digits.slice(-9)].forEach((p) => p && phones.add(p));
    }
    return { ids, phones: Array.from(phones) };
  }

  private async batchUpdate(docs: QueryDocumentSnapshot[], data: Record<string, unknown>) {
    for (let i = 0; i < docs.length; i += 400) {
      const batch = this.firestoreService.db.batch();
      docs.slice(i, i + 400).forEach((d) => batch.update(d.ref, data));
      await batch.commit();
    }
  }

  private chunk<T>(items: T[]): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += FIRESTORE_IN_QUERY_LIMIT) {
      out.push(items.slice(i, i + FIRESTORE_IN_QUERY_LIMIT));
    }
    return out;
  }

  private formatFcfa(amount: number): string {
    return `${Math.round(amount || 0).toLocaleString('fr-FR')} FCFA`;
  }
}
