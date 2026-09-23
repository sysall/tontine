import { Module } from '@nestjs/common';
import { TontineTransactionService } from './tontine-transaction.service';
import { AdminEventsController } from './admin-events.controller';
import { NattsController, PaymentsTransactionController, AdminTreasuryController, AdminPayoutsController } from './tontine.controller';

@Module({
  controllers: [
    NattsController,
    AdminEventsController,
    PaymentsTransactionController,
    AdminTreasuryController,
    AdminPayoutsController,
  ],
  providers: [
    TontineTransactionService,
  ],
  exports: [
    TontineTransactionService,
  ],
})
export class TontineModule {}
