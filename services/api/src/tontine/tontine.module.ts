import { Module } from '@nestjs/common';
import { TontineTransactionService } from './tontine-transaction.service';
import { AdminEventsController } from './admin-events.controller';
import { AdminBackofficeController } from './admin-backoffice.controller';
import { AdminBackofficeService } from './admin-backoffice.service';
import {
  NattsController,
  PaymentsTransactionController,
  AdminTreasuryController,
  AdminPayoutsController,
  TontinesDashboardController,
} from './tontine.controller';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [
    NattsController,
    AdminEventsController,
    AdminBackofficeController,
    PaymentsTransactionController,
    AdminTreasuryController,
    AdminPayoutsController,
    TontinesDashboardController,
  ],
  providers: [
    TontineTransactionService,
    AdminBackofficeService,
  ],
  exports: [
    TontineTransactionService,
    AdminBackofficeService,
  ],
})
export class TontineModule {}
