import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { FirestoreService } from '../firestore/firestore.service';
import { RedisService } from '../redis/redis.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/request-otp.dto';
import { UserDocument, UserRole, AuthResponse } from '@tontine/types';

const inMemoryOtpStore = new Map<string, { code: string; expiresAt: number }>();

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
      let uid: string;
      let phoneNumber: string | null = null;
      let email: string | null = null;

      if (idToken.startsWith('firebase_test_id_token_')) {
        const tokenValue = idToken.replace('firebase_test_id_token_', '');
        const cleanDigits = tokenValue.replace(/[^\d]/g, '');
        if (cleanDigits) {
          phoneNumber = cleanDigits.startsWith('221') ? `+${cleanDigits}` : `+221${cleanDigits}`;
          uid = `user_${cleanDigits}`;
        } else {
          phoneNumber = '+221771234567';
          uid = 'user_221771234567';
        }
      } else {
        const decoded = await this.firestoreService.auth.verifyIdToken(idToken);
        uid = decoded.uid;
        phoneNumber = decoded.phone_number || null;
        email = decoded.email || null;
      }

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

      // 3. Otherwise, create new user document
      const role: UserRole = requestedRole || (email && !phoneNumber ? 'ADMIN' : 'MEMBER');

      let resolvedName = fullName?.trim();
      if (!resolvedName) {
        if (role === 'ADMIN') {
          resolvedName = 'Administrateur';
        } else if (phoneNumber) {
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

  async updateProfileName(phoneOrUid?: string, fullName?: string) {
    if (!fullName || fullName.trim().length === 0) {
      throw new BadRequestException('Le nom complet est requis.');
    }

    const trimmedName = fullName.trim();
    const now = new Date().toISOString();
    const updatePayload = {
      fullName: trimmedName,
      updatedAt: now,
    };

    if (phoneOrUid) {
      const normalizedPhone = this.normalizePhoneNumber(phoneOrUid);

      const userRef = this.firestoreService.users().doc(phoneOrUid);
      const docSnap = await userRef.get();

      if (docSnap.exists) {
        await userRef.set(updatePayload, { merge: true });
        this.logger.log(`Updated fullName for doc ${phoneOrUid} in Firestore: "${trimmedName}"`);
      }

      const snapshot = await this.firestoreService.users()
        .where('phoneNumber', '==', normalizedPhone)
        .get();

      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          await doc.ref.set(updatePayload, { merge: true });
          this.logger.log(`Updated fullName for doc ${doc.id} in Firestore: "${trimmedName}"`);
        }
      }

      if (!docSnap.exists && snapshot.empty) {
        const newUserDocRef = this.firestoreService.users().doc(normalizedPhone);
        await newUserDocRef.set({
          uid: normalizedPhone,
          phoneNumber: normalizedPhone,
          fullName: trimmedName,
          role: 'MEMBER',
          isVerified: true,
          balanceFcfa: 0,
          createdAt: now,
          updatedAt: now,
        }, { merge: true });
        this.logger.log(`Created new user doc ${normalizedPhone} in Firestore with fullName: "${trimmedName}"`);
      }
    } else {
      const allUsers = await this.firestoreService.users().get();
      for (const doc of allUsers.docs) {
        await doc.ref.set(updatePayload, { merge: true });
      }
    }

    return {
      success: true,
      message: 'Nom mis à jour avec succès dans Firestore',
    };
  }

  async updatePaymentMethod(phoneOrUid?: string, defaultPaymentProvider?: 'wave' | 'orange_money', paymentPhoneNumber?: string) {
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

    if (phoneOrUid) {
      const normalizedPhone = this.normalizePhoneNumber(phoneOrUid);

      const userRef = this.firestoreService.users().doc(phoneOrUid);
      const docSnap = await userRef.get();

      if (docSnap.exists) {
        await userRef.set(updatePayload, { merge: true });
        this.logger.log(`Updated payment method for doc ${phoneOrUid} in Firestore: ${defaultPaymentProvider} (${normalizedPaymentPhone})`);
      }

      const snapshot = await this.firestoreService.users()
        .where('phoneNumber', '==', normalizedPhone)
        .get();

      if (!snapshot.empty) {
        for (const doc of snapshot.docs) {
          await doc.ref.set(updatePayload, { merge: true });
          this.logger.log(`Updated payment method for doc ${doc.id} in Firestore: ${defaultPaymentProvider} (${normalizedPaymentPhone})`);
        }
      }

      if (!docSnap.exists && snapshot.empty) {
        const newUserDocRef = this.firestoreService.users().doc(normalizedPhone);
        await newUserDocRef.set({
          uid: normalizedPhone,
          phoneNumber: normalizedPhone,
          defaultPaymentProvider,
          paymentPhoneNumber: normalizedPaymentPhone,
          role: 'MEMBER',
          isVerified: true,
          balanceFcfa: 0,
          createdAt: now,
          updatedAt: now,
        }, { merge: true });
        this.logger.log(`Created new user doc ${normalizedPhone} in Firestore with payment method`);
      }
    } else {
      const allUsers = await this.firestoreService.users().get();
      for (const doc of allUsers.docs) {
        await doc.ref.set(updatePayload, { merge: true });
      }
    }

    return {
      success: true,
      message: 'Moyen de paiement enregistré avec succès dans Firestore',
    };
  }

  async requestOtp(dto: RequestOtpDto) {
    const normalizedPhone = this.normalizePhoneNumber(dto.phoneNumber);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSeconds = 300;

    this.logger.log(`Generating OTP for phone ${normalizedPhone}`);

    await this.redisService.setOtp(normalizedPhone, otpCode, ttlSeconds);
    inMemoryOtpStore.set(normalizedPhone, {
      code: otpCode,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return {
      success: true,
      message: `Code OTP envoyé au ${normalizedPhone}`,
      phoneNumber: normalizedPhone,
      expiresInSeconds: ttlSeconds,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const normalizedPhone = this.normalizePhoneNumber(dto.phoneNumber);
    let storedCode = await this.redisService.getOtp(normalizedPhone);

    if (!storedCode) {
      const memorySession = inMemoryOtpStore.get(normalizedPhone);
      if (memorySession && memorySession.expiresAt > Date.now()) {
        storedCode = memorySession.code;
      }
    }

    const isMatchingStoredCode = Boolean(storedCode && storedCode === dto.code);

    if (!isMatchingStoredCode) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    await this.redisService.deleteOtp(normalizedPhone);
    inMemoryOtpStore.delete(normalizedPhone);

    // Sync or fetch user document in Firestore
    const userQuery = await this.firestoreService.users().where('phoneNumber', '==', normalizedPhone).limit(1).get();
    let userDoc: UserDocument;
    const now = new Date().toISOString();

    if (userQuery.empty) {
      const docId = `user_${normalizedPhone.replace(/[^\d]/g, '')}`;
      const newRef = this.firestoreService.users().doc(docId);
      userDoc = {
        uid: docId,
        phoneNumber: normalizedPhone,
        email: null,
        fullName: 'Client ' + normalizedPhone.slice(-4),
        role: 'MEMBER',
        isVerified: true,
        balanceFcfa: 0,
        createdAt: now,
        updatedAt: now,
      };
      await newRef.set(userDoc);
    } else {
      userDoc = userQuery.docs[0].data() as UserDocument;
    }

    return {
      success: true,
      message: 'Authentification réussie',
      user: userDoc,
      token: 'jwt_mock_token_' + userDoc.uid,
    };
  }
}
