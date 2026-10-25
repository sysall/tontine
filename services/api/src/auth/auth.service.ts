import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { FirestoreService } from '../firestore/firestore.service';
import { RedisService } from '../redis/redis.service';
import { UserDocument, UserRole, AuthResponse } from '@tontine/types';
import { AuthenticatedUser } from './user-identity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly redisService: RedisService,
  ) {}

  normalizePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (cleaned.startsWith('+221')) {
      return cleaned;
    }
    if (cleaned.startsWith('221')) {
      return `+${cleaned}`;
    }
    if (/^[7][06789]\d{7}$/.test(cleaned)) {
      return `+221${cleaned}`;
    }
    return cleaned;
  }

  async firebaseLogin(idToken: string, fullName?: string, requestedRole?: UserRole): Promise<AuthResponse> {
    try {
      const decoded = await this.firestoreService.auth.verifyIdToken(idToken);
      const uid = decoded.uid;
      const phoneNumber = decoded.phone_number || null;
      const email = decoded.email || null;

      const now = new Date().toISOString();

      // 1. Try finding existing user by document ID or phone number lookups
      let existingDocRef: any = null;
      let existingUser: UserDocument | null = null;

      // Check primary UID doc
      const primaryUserRef = this.firestoreService.users().doc(uid);
      const primarySnap = await primaryUserRef.get();

      if (primarySnap.exists) {
        existingDocRef = primaryUserRef;
        existingUser = primarySnap.data() as UserDocument;
      } else if (phoneNumber) {
        const normalized = this.normalizePhoneNumber(phoneNumber);
        const cleanDigits = normalized.replace(/[^\d]/g, '');
        const local9 = cleanDigits.slice(-9);

        // Search candidate IDs
        const candidates = [
          normalized,
          cleanDigits,
          local9,
          `user_${cleanDigits}`,
          `user_${local9}`,
        ];

        // Check doc IDs first
        for (const candidateId of candidates) {
          const cRef = this.firestoreService.users().doc(candidateId);
          const cSnap = await cRef.get();
          if (cSnap.exists) {
            existingDocRef = cRef;
            existingUser = cSnap.data() as UserDocument;
            break;
          }
        }

        // Check query by phoneNumber if doc ID search didn't match
        if (!existingUser) {
          const qSnap = await this.firestoreService.users().where('phoneNumber', '==', normalized).limit(1).get();
          if (!qSnap.empty) {
            existingDocRef = qSnap.docs[0].ref;
            existingUser = qSnap.docs[0].data() as UserDocument;
          } else {
            const qSnap2 = await this.firestoreService.users().where('phoneNumber', '==', local9).limit(1).get();
            if (!qSnap2.empty) {
              existingDocRef = qSnap2.docs[0].ref;
              existingUser = qSnap2.docs[0].data() as UserDocument;
            }
          }
        }
      }

      // 2. If existing user found, update name if needed and return
      if (existingUser && existingDocRef) {
        if (fullName && fullName.trim() && existingUser.fullName !== fullName.trim()) {
          const trimmed = fullName.trim();
          await existingDocRef.set({ fullName: trimmed, updatedAt: now }, { merge: true });
          existingUser.fullName = trimmed;
        }

        // Upgrade generic "Membre Tontine" or empty name if phone is available
        if ((!existingUser.fullName || existingUser.fullName === 'Membre Tontine' || existingUser.fullName === 'Membre') && existingUser.phoneNumber) {
          const cleanLocal = existingUser.phoneNumber.replace(/[^\d]/g, '').slice(-9);
          if (cleanLocal.length === 9) {
            const formatted = `Membre (+221 ${cleanLocal.slice(0, 2)} ${cleanLocal.slice(2, 5)} ${cleanLocal.slice(5, 7)} ${cleanLocal.slice(7)})`;
            await existingDocRef.set({ fullName: formatted, updatedAt: now }, { merge: true });
            existingUser.fullName = formatted;
          }
        }

        return {
          success: true,
          user: existingUser,
          token: idToken,
        };
      }

      // 3. Otherwise, create new user document.
      // Security: role is never taken from the client. Backoffice admins are
      // managed exclusively in Firestore `admins/{uid}` (see AdminAuthGuard).
      void requestedRole;
      const role: UserRole = 'MEMBER';

      let resolvedName = fullName?.trim();
      if (!resolvedName) {
        if (phoneNumber) {
          const cleanLocal = phoneNumber.replace(/[^\d]/g, '').slice(-9);
          if (cleanLocal.length === 9) {
            resolvedName = `Membre (+221 ${cleanLocal.slice(0, 2)} ${cleanLocal.slice(2, 5)} ${cleanLocal.slice(5, 7)} ${cleanLocal.slice(7)})`;
          } else {
            resolvedName = `Membre (${phoneNumber})`;
          }
        } else {
          resolvedName = 'Membre Tontine';
        }
      }

      const newUser: UserDocument = {
        uid,
        phoneNumber,
        email,
        fullName: resolvedName,
        role,
        isVerified: true,
        balanceFcfa: 0,
        createdAt: now,
        updatedAt: now,
      };

      await primaryUserRef.set(newUser);
      this.logger.log(`Created new ${role} user in Firestore: ${uid} (${resolvedName})`);

      return {
        success: true,
        user: newUser,
        token: idToken,
      };
    } catch (error: any) {
      this.logger.error(`Firebase auth failed: ${error.message}`);
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }

  async updateProfileName(user: AuthenticatedUser, fullName?: string) {
    if (!fullName || fullName.trim().length === 0) {
      throw new BadRequestException('Le nom complet est requis.');
    }

    const trimmedName = fullName.trim();
    const now = new Date().toISOString();
    const updatePayload = {
      fullName: trimmedName,
      updatedAt: now,
    };

    await this.firestoreService.users().doc(user.docId).set(updatePayload, { merge: true });
    this.logger.log(`Updated fullName for user doc ${user.docId} in Firestore: "${trimmedName}"`);

    return {
      success: true,
      message: 'Nom mis à jour avec succès dans Firestore',
    };
  }

  async updatePaymentMethod(
    user: AuthenticatedUser,
    defaultPaymentProvider?: 'wave' | 'orange_money',
    paymentPhoneNumber?: string,
  ) {
    if (!defaultPaymentProvider || !paymentPhoneNumber) {
      throw new BadRequestException('Le moyen de paiement et le numéro de téléphone associés sont requis.');
    }

    const now = new Date().toISOString();
    const normalizedPaymentPhone = this.normalizePhoneNumber(paymentPhoneNumber);
    const updatePayload = {
      defaultPaymentProvider,
      paymentPhoneNumber: normalizedPaymentPhone,
      updatedAt: now,
    };

    await this.firestoreService.users().doc(user.docId).set(updatePayload, { merge: true });
    this.logger.log(
      `Updated payment method for user doc ${user.docId} in Firestore: ${defaultPaymentProvider} (${normalizedPaymentPhone})`,
    );

    return {
      success: true,
      message: 'Moyen de paiement enregistré avec succès dans Firestore',
    };
  }
}

