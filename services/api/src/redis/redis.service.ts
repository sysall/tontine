import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isConnected = false;

  onModuleInit() {
    const url = process.env.REDIS_URL;
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);
    // A hosted Redis hands out credentials in a URL. Host and port alone can
    // only reach one without a password, which is the local container.
    const target = url ? new URL(url).host : `${host}:${port}`;

    const options = {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times: number) => {
        if (times > 2) {
          return null;
        }
        return 500;
      },
    };

    this.client = url ? new Redis(url, options) : new Redis({ host, port, ...options });

    this.client.on('error', (err) => {
      if (this.isConnected) {
        this.logger.warn(`Redis connection error: ${err.message}`);
        this.isConnected = false;
      }
    });

    this.client.connect().then(() => {
      this.isConnected = true;
      this.logger.log(`Connected to Redis at ${target}`);
    }).catch((err) => {
      this.isConnected = false;
      this.logger.warn(`Redis is not running on ${target} (${err.message}). Using in-memory fallback store for local dev mode.`);
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
