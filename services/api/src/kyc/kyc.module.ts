import { Module, Controller, Get } from '@nestjs/common';

@Controller('api/v1/kyc')
export class KycController {
  @Get('status')
  getStatus() {
    return { service: 'kyc-module', status: 'operational', timestamp: new Date() };
  }
}

@Module({
  controllers: [KycController],
})
export class KycModule {}
