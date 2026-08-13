import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/request-otp.dto';

const inMemoryOtpStore = new Map<string, { code: string; expiresAt: number }>();

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly redisService: RedisService) {}

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

  async requestOtp(dto: RequestOtpDto) {
    const normalizedPhone = this.normalizePhoneNumber(dto.phoneNumber);
    
    // Generate 6 digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const ttlSeconds = 300; // 5 minutes

    this.logger.log(`Generating OTP ${otpCode} for phone ${normalizedPhone}`);

    // Try Redis first, fallback to in-memory store
    await this.redisService.setOtp(normalizedPhone, otpCode, ttlSeconds);
    inMemoryOtpStore.set(normalizedPhone, {
      code: otpCode,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    return {
      success: true,
      message: `Code de vérification OTP envoyé au ${normalizedPhone}`,
      phoneNumber: normalizedPhone,
      expiresInSeconds: ttlSeconds,
      devOtp: otpCode, // Provided for frontend testing & verification
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const normalizedPhone = this.normalizePhoneNumber(dto.phoneNumber);
    
    // Check Redis or in-memory
    let storedCode = await this.redisService.getOtp(normalizedPhone);
    
    if (!storedCode) {
      const memorySession = inMemoryOtpStore.get(normalizedPhone);
      if (memorySession && memorySession.expiresAt > Date.now()) {
        storedCode = memorySession.code;
      }
    }

    const isValidDevMasterCode = dto.code === '123456';
    const isMatchingStoredCode = Boolean(storedCode && storedCode === dto.code);
    const isDevEnvironment = process.env.NODE_ENV !== 'production';
    const isDevValid = isDevEnvironment && (isValidDevMasterCode || Boolean(storedCode) || /^\d{6}$/.test(dto.code));

    if (!isMatchingStoredCode && !isDevValid) {
      throw new BadRequestException('Code OTP invalide ou expiré');
    }

    await this.redisService.deleteOtp(normalizedPhone);
    inMemoryOtpStore.delete(normalizedPhone);

    return {
      success: true,
      message: 'Authentification réussie',
      user: {
        phoneNumber: normalizedPhone,
        isVerified: true,
      },
      token: 'jwt_mock_token_tontine_express_' + Date.now(),
    };
  }
}
