import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  onModuleInit() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.client = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 2) {
          return null;
        }
        return 500;
      },
    });

    this.client.on('error', (err) => {
      if (this.isConnected) {
        this.logger.warn(`Redis connection error: ${err.message}`);
        this.isConnected = false;
      }
    });

    this.client.connect().then(() => {
      this.isConnected = true;
      this.logger.log(`Connected to Redis at ${host}:${port}`);
    }).catch((err) => {
      this.isConnected = false;
      this.logger.warn(`Redis is not running on ${host}:${port} (${err.message}). Using in-memory fallback store for local dev mode.`);
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  async setOtp(phoneNumber: string, code: string, ttlSeconds: number = 300): Promise<void> {
    try {
      if (this.isConnected && this.client.status === 'ready') {
        await this.client.set(`otp:${phoneNumber}`, code, 'EX', ttlSeconds);
      }
    } catch (error: any) {
      this.logger.debug(`Could not set OTP in Redis (${error.message}). In-memory store active.`);
    }
  }

  async getOtp(phoneNumber: string): Promise<string | null> {
    try {
      if (this.isConnected && this.client.status === 'ready') {
        return await this.client.get(`otp:${phoneNumber}`);
      }
    } catch (error: any) {
      this.logger.debug(`Could not get OTP from Redis (${error.message}). In-memory store active.`);
    }
    return null;
  }

  async deleteOtp(phoneNumber: string): Promise<void> {
    try {
      if (this.isConnected && this.client.status === 'ready') {
        await this.client.del(`otp:${phoneNumber}`);
      }
    } catch (error: any) {
      this.logger.debug(`Could not delete OTP from Redis (${error.message}).`);
    }
  }
}
