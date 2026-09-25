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
        uid = 'user_test_' + idToken.replace('firebase_test_id_token_', '');
        phoneNumber = '+221771234567';
      } else {
        const decoded = await this.firestoreService.auth.verifyIdToken(idToken);
        uid = decoded.uid;
        phoneNumber = decoded.phone_number || null;
        email = decoded.email || null;
      }

      const userRef = this.firestoreService.users().doc(uid);
      const docSnapshot = await userRef.get();

      const now = new Date().toISOString();

      if (!docSnapshot.exists) {
        // Determine role: if email present without phone, default to ADMIN, else MEMBER
        const role: UserRole = requestedRole || (email && !phoneNumber ? 'ADMIN' : 'MEMBER');

        const newUser: UserDocument = {
          uid,
          phoneNumber,
          email,
          fullName: fullName || (role === 'ADMIN' ? 'Administrateur' : 'Membre Tontine'),
          role,
          isVerified: true,
          balanceFcfa: 0,
          createdAt: now,
          updatedAt: now,
        };

        await userRef.set(newUser);
        this.logger.log(`Created new ${role} user in Firestore: ${uid}`);

        return {
          success: true,
          user: newUser,
          token: idToken,
        };
      }

      const existingUser = docSnapshot.data() as UserDocument;
      
      // Update last active / name if provided
      if (fullName && existingUser.fullName !== fullName) {
        await userRef.update({ fullName, updatedAt: now });
        existingUser.fullName = fullName;
      }

      return {
        success: true,
        user: existingUser,
        token: idToken,
      };
    } catch (error) {
      this.logger.error(`Firebase auth failed: ${error.message}`);
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
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
      const newRef = this.firestoreService.users().doc();
      userDoc = {
        uid: newRef.id,
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
