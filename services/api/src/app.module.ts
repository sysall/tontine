import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { FirestoreModule } from './firestore/firestore.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { KycModule } from './kyc/kyc.module';
import { TontineModule } from './tontine/tontine.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.resolve(process.cwd(), 'services/api/.env'),
        path.resolve(process.cwd(), '.env'),
        '.env',
      ],
    }),
    FirestoreModule,
    RedisModule,
    AuthModule,
    KycModule,
    TontineModule,
    PaymentModule,
  ],
})
export class AppModule {}
