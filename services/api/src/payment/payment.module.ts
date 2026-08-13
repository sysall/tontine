import { Module, Controller, Get } from '@nestjs/common';

@Controller('api/v1/payments')
export class PaymentController {
  @Get('providers')
  getProviders() {
    return {
      service: 'payment-module',
      supportedProviders: [
        { id: 'wave', name: 'Wave Senegal', icon: '🌊' },
        { id: 'orange_money', name: 'Orange Money Senegal', icon: '🍊' },
        { id: 'free_money', name: 'Free Money Senegal', icon: '📲' },
      ],
      timestamp: new Date(),
    };
  }
}

@Module({
  controllers: [PaymentController],
})
export class PaymentModule {}
