import { Module, Controller, Get } from '@nestjs/common';

@Controller('api/v1/tontines')
export class TontineController {
  @Get('status')
  getStatus() {
    return { service: 'tontine-module', status: 'operational', timestamp: new Date() };
  }
}

@Module({
  controllers: [TontineController],
})
export class TontineModule {}
