import { Module } from '@nestjs/common';
import { TontineTransactionService } from './tontine-transaction.service';
import { AdminEventsController } from './admin-events.controller';
import {
  NattsController,
  PaymentsTransactionController,
  AdminTreasuryController,
  AdminPayoutsController,
  TontinesDashboardController,
} from './tontine.controller';

@Module({
  controllers: [
    NattsController,
    AdminEventsController,
    PaymentsTransactionController,
    AdminTreasuryController,
    AdminPayoutsController,
    TontinesDashboardController,
  ],
  providers: [
    TontineTransactionService,
  ],
  exports: [
    TontineTransactionService,
  ],
})
export class TontineModule {}
