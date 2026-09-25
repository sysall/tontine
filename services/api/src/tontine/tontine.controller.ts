import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  HttpCode, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TontineTransactionService } from './tontine-transaction.service';
import { SubscribeNattDto } from './dtos/subscribe-natt.dto';
import { ProcessContributionDto } from './dtos/process-contribution.dto';

@ApiTags('Natts & Offres d\'Épargne')
@Controller('api/v1/natts')
export class NattsController {
  private readonly logger = new Logger(NattsController.name);

  constructor(private readonly tontineService: TontineTransactionService) {}

  @Get('offers')
  @ApiOperation({ summary: 'Catalogue complet : Natts Permanents & Natts Événements Actifs' })
  async getOffersCatalog() {
    return {
      success: true,
      permanentCatalogs: this.tontineService.getPermanentCatalogs(),
      eventNatts: await this.tontineService.getActiveEventNatts(),
    };
  }

  @Get('events')
  @ApiOperation({ summary: 'Liste des Natts Événements dynamiques actuellement ouverts' })
  async getActiveEvents() {
    return {
      success: true,
      events: await this.tontineService.getActiveEventNatts(),
    };
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'B. Souscrire à un Natt (Permanent ou Événementiel)' })
  @ApiResponse({ status: 201, description: 'Souscription enregistrée avec succès.' })
  async subscribeNatt(@Body() dto: SubscribeNattDto) {
    const userNatt = await this.tontineService.subscribeClientToNatt(dto);
    return {
      success: true,
      message: `Souscription réussie au Natt "${userNatt.title}" !`,
      userNatt,
    };
  }

  @Get('my-subscriptions')
  @ApiOperation({ summary: 'Liste des souscriptions Natt d\'un utilisateur' })
  getUserSubscriptions(@Query('userId') userId: string) {
    const subscriptions = this.tontineService.getUserNattsByUserId(userId || 'user-default');
    return {
      success: true,
      subscriptions,
    };
  }

  @Get('payments/:userNattId')
  @ApiOperation({ summary: 'Historique des versements d\'un Natt spécifique' })
  getPayments(@Param('userNattId') userNattId: string) {
    const payments = this.tontineService.getPaymentsByNattId(userNattId);
    return {
      success: true,
      payments,
    };
  }
}

@ApiTags('Paiements & Webhooks')
@Controller('api/v1/payments')
export class PaymentsTransactionController {
  private readonly logger = new Logger(PaymentsTransactionController.name);

  constructor(private readonly tontineService: TontineTransactionService) {}

  @Post('process-contribution')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '3. Traitement transactionnel d\'une cotisation & Évaluation du seuil des 70%' })
  @ApiResponse({ status: 200, description: 'Cotisation traitée et seuil 70% évalué.' })
  processContribution(@Body() dto: ProcessContributionDto) {
    this.logger.log(`Processing contribution of ${dto.amount} FCFA for UserNatt ${dto.userNattId}`);
    const result = this.tontineService.processContribution(dto);

    return {
      success: true,
      message: result.payoutTriggered
        ? `🎉 Cotisation enregistrée ! Le seuil de 70% est atteint (${Math.round((result.userNatt.totalPaid / result.userNatt.targetAmount) * 100)}%). Le dossier est placé dans la file d'attente admin pour déclenchement manuel du versement de 100% (${result.userNatt.targetAmount} FCFA).`
        : `Cotisation de ${dto.amount} FCFA enregistrée avec succès. Solde cotisé: ${result.userNatt.totalPaid} / ${result.userNatt.targetAmount} FCFA.`,
      result,
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Historique global des transactions financières (Cotisations & Versements)' })
  getTransactions() {
    return {
      success: true,
      transactions: this.tontineService.getAllTransactions(),
    };
  }
}

export class ProcessPayoutDto {
  userNattId: string;
  provider: 'Wave' | 'Orange Money' | 'Virement';
}

@ApiTags('Admin - Versements & Déblocages à 70%')
@Controller('api/v1/admin/payouts')
export class AdminPayoutsController {
  private readonly logger = new Logger(AdminPayoutsController.name);

  constructor(private readonly tontineService: TontineTransactionService) {}

  @Get('eligible')
  @ApiOperation({ summary: 'Liste des clients ayant atteint 70% de cotisation en attente de déblocage manuel' })
  getEligiblePayouts() {
    return {
      success: true,
      payoutTriggerThresholdPercent: 70,
      eligibleSubscriptions: this.tontineService.getEligiblePayoutsForAdmin(),
    };
  }

  @Post('process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exécuter manuellement le versement 100% à un client éligible à 70%' })
  processPayout(@Body() dto: ProcessPayoutDto) {
    this.logger.log(`Admin processing payout for subscription ${dto.userNattId} via ${dto.provider}`);
    const result = this.tontineService.processAdminPayout(dto.userNattId, dto.provider);

    return {
      success: true,
      message: `Versement de 100% (${result.userNatt.targetAmount} FCFA) exécuté avec succès depuis la Trésorerie Unique via ${dto.provider} !`,
      result,
    };
  }

  @Post('override-payout-date')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accorder une dérogation de date de prise à un client (même sans les 70%)' })
  async overridePayoutDate(@Body() dto: { userNattId: string; customPayoutDate: string; grantExemption?: boolean }) {
    const updated = await this.tontineService.overrideUserNattPayoutDate(
      dto.userNattId,
      dto.customPayoutDate,
      dto.grantExemption ?? true
    );
    return {
      success: true,
      message: `Dérogation accordée : Date de prise mise à jour au ${dto.customPayoutDate} pour la souscription "${updated.title}".`,
      userNatt: updated,
    };
  }
}

@ApiTags('Admin - Trésorerie Centralisée')
@Controller('api/v1/admin/treasury')
export class AdminTreasuryController {
  constructor(private readonly tontineService: TontineTransactionService) {}

  @Get()
  @ApiOperation({ summary: 'État en temps réel de la Trésorerie Centrale Unique (/treasury/main_vault)' })
  getTreasuryVault() {
    return {
      success: true,
      treasury: this.tontineService.getTreasuryVault(),
    };
  }
}

@ApiTags('Tontines Dashboard & Transactions')
@Controller('api/v1/tontines')
export class TontinesDashboardController {
  constructor(private readonly tontineService: TontineTransactionService) {}

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'Résumé du tableau de bord utilisateur depuis Cloud Firestore' })
  async getDashboardSummary(@Query('userId') userId?: string) {
    return this.tontineService.getDashboardSummary(userId);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Historique des transactions depuis Cloud Firestore' })
  async getTransactions(@Query('userId') userId?: string) {
    return this.tontineService.getTransactionsFromFirestore(userId);
  }
}
