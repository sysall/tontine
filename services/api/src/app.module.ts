import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { KycModule } from './kyc/kyc.module';
import { TontineModule } from './tontine/tontine.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    RedisModule,
    AuthModule,
    KycModule,
    TontineModule,
    PaymentModule,
  ],
})
export class AppModule {}
