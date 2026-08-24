import { Module, Controller, Get, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

export class SubscribeOfferDto {
  offerType: 'rotative' | 'projet';
  tierId: string;
  amountFcfa: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
  nameCustom?: string;
}

export class JoinTontineDto {
  inviteCode: string;
}

@ApiTags('Tontines')
@Controller('api/v1/tontines')
export class TontineController {
  private readonly logger = new Logger(TontineController.name);

  @Get('offers')
  @ApiOperation({ summary: 'Liste des 2 offres officielles Tontine Express' })
  getOfficialOffers() {
    return {
      success: true,
      offers: [
        {
          id: 'rotative',
          type: 'rotative',
          title: 'Natt Classique',
          badge: 'Offre Rotative Mensuelle',
          description: 'Avec 4 membres par groupe et une prise mensuelle sur 4 mois, cette formule vous permet d\’épargner en toute sérénité.',
          tiers: [
            { id: 'natt-250k', name: 'Option 1', amountFcfa: 250000, frequency: 'Mensuel', maxMembers: 4 },
            { id: 'natt-500k', name: 'Option 2', amountFcfa: 500000, frequency: 'Mensuel', maxMembers: 4 },
            { id: 'natt-1M', name: 'Option 3', amountFcfa: 1000000, frequency: 'Mensuel', maxMembers: 4 },
            { id: 'natt-105M', name: 'Option 4', amountFcfa: 1500000, frequency: 'Mensuel', maxMembers: 4 },
            { id: 'natt-2M', name: 'Option 5', amountFcfa: 2000000, frequency: 'Mensuel', maxMembers: 4 },
            { id: 'natt-3M', name: 'Option 6', amountFcfa: 3000000, frequency: 'Mensuel', maxMembers: 4 },
          ],
        },
        {
          id: 'projet',
          type: 'projet',
          title: 'Tekk Tegui',
          badge: 'Offre Rotative Journalière ',
          description: 'Epargnez rapidement avec 10 autres personnes et finisser apres 2 mois 15 jours.',
          tiers: [
            { id: 'tek-100k', name: 'Option 1', amountFcfa: 100000, frequency: 'Journalier', maxMembers: 10 },
            { id: 'tek-150k', name: 'Option 2', amountFcfa: 150000, frequency: 'Journalier', maxMembers: 10 },
            { id: 'tek-250K', name: 'Option 3', amountFcfa: 250000, frequency: 'Journalier', maxMembers: 10 },
            { id: 'tek-500K', name: 'Option 4', amountFcfa: 500000, frequency: 'Journalier', maxMembers: 10 },
            { id: 'tek-750K', name: 'Option 5', amountFcfa: 750000, frequency: 'Journalier', maxMembers: 10 },
            { id: 'tek-1M', name: 'Option 6', amountFcfa: 1000000, frequency: 'Journalier', maxMembers: 10 },
          ],
        },
      ],
    };
  }

  @Get('dashboard-summary')
  @ApiOperation({ summary: 'Résumé du tableau de bord de l\'utilisateur' })
  getDashboardSummary() {
    return {
      success: true,
      summary: {
        totalSavedFcfa: 250000,
        nextPaymentFcfa: 50000,
        nextPaymentDueDate: '2026-08-25',
        expectedPayoutFcfa: 500000,
        myPayoutTurn: 3,
        activeTontinesCount: 2,
      },
      tontines: [
        {
          id: 'tontine-1',
          name: 'Natt Classique',
          offerType: 'rotative',
          category: 'Rotative Mensuelle',
          amountPerCycle: 50000,
          currentTurn: 3,
          totalTours: 10,
          totalMembers: 10,
          myContributionFcfa: 150000,
          myPayoutTurn: 5,
          nextTurnDate: '25 Août 2026',
          status: 'ACTIVE',
        },
        {
          id: 'tontine-2',
          name: 'Tekk Tegui',
          offerType: 'projet',
          category: 'Rotative Journalière ',
          amountPerCycle: 25000,
          currentTurn: 4,
          totalTours: 8,
          totalMembers: 8,
          myContributionFcfa: 100000,
          myPayoutTurn: 8,
          nextTurnDate: '1er Septembre 2026',
          status: 'ACTIVE',
        },
      ],
    };
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Historique des cotisations et versements reçus' })
  getTransactionHistory() {
    return {
      success: true,
      transactions: [
        {
          id: 'tx-001',
          type: 'payout',
          title: 'Versement du Natt',
          tontineName: 'Natt Classique',
          amountFcfa: 500000,
          provider: 'wave',
          providerName: 'Wave Senegal',
          reference: 'TXN-WV-98214',
          date: '10 Août 2026 à 14:32',
          status: 'SUCCESS',
        },
        {
          id: 'tx-002',
          type: 'contribution',
          title: 'Cotisation Tour #3',
          tontineName: 'Tekk Tegui',
          amountFcfa: 50000,
          provider: 'wave',
          providerName: 'Wave Senegal',
          reference: 'TXN-WV-87123',
          date: '25 Juillet 2026 à 10:15',
          status: 'SUCCESS',
        },
        {
          id: 'tx-003',
          type: 'contribution',
          title: 'Cotisation Tour #4',
          tontineName: 'Tekk Tegui',
          amountFcfa: 25000,
          provider: 'orange_money',
          providerName: 'Orange Money',
          reference: 'TXN-OM-65412',
          date: '01 Juillet 2026 à 18:45',
          status: 'SUCCESS',
        },
        {
          id: 'tx-004',
          type: 'contribution',
          title: 'Cotisation Tour #2',
          tontineName: 'Natt Classique',
          amountFcfa: 50000,
          provider: 'wave',
          providerName: 'Wave Senegal',
          reference: 'TXN-WV-43219',
          date: '25 Juin 2026 à 09:20',
          status: 'SUCCESS',
        },
      ],
    };
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Souscrire à une des 2 offres officielles Tontine Express' })
  subscribeToOffer(@Body() dto: SubscribeOfferDto) {
    this.logger.log(`Subscribing to offer ${dto.offerType} (Tier: ${dto.tierId})`);
    const inviteCode = 'TE' + Math.floor(1000 + Math.random() * 9000);
    const title = dto.offerType === 'rotative' ? 'Tontine Rotative Classique 🔄' : 'Tontine Projet & Objectifs 🎯';

    return {
      success: true,
      message: `Souscription réussie à la ${title} !`,
      subscription: {
        id: 'sub-' + Date.now(),
        offerType: dto.offerType,
        tierId: dto.tierId,
        amountFcfa: dto.amountFcfa,
        frequency: dto.frequency || 'monthly',
        inviteCode,
        status: 'ACTIVE',
        createdAt: new Date(),
      },
    };
  }

  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejoindre une tontine avec un code d\'invitation officiel' })
  joinTontine(@Body() dto: JoinTontineDto) {
    this.logger.log(`Joining official tontine circle with code: ${dto.inviteCode}`);
    return {
      success: true,
      message: `Félicitations ! Vous avez rejoint la tontine officielle avec le code ${dto.inviteCode}`,
      tontineId: 'tontine-joined-' + Date.now(),
    };
  }
}

export class ProcessPayoutDto {
  subscriptionId: string;
  provider: 'Wave' | 'Orange Money' | 'Virement';
}

@ApiTags('Admin - Backoffice Tontine Express')
@Controller('api/v1/admin')
export class AdminTontineController {
  private readonly logger = new Logger(AdminTontineController.name);

  @Get('treasury')
  @ApiOperation({ summary: 'Vue d\'ensemble de la Trésorerie Unique Tontine Express' })
  getTreasuryOverview() {
    return {
      success: true,
      treasury: {
        totalBalanceFcfa: 48500000,
        totalCollectedFcfa: 125000000,
        totalPaidOutFcfa: 76500000,
        pendingPayoutsCount: 3,
        pendingPayoutsTotalFcfa: 4500000,
        activeClientsCount: 420,
        activeSubscriptionsCount: 580,
        solvencyRatioPercent: 163.5,
      },
    };
  }

  @Get('payouts/eligible')
  @ApiOperation({ summary: 'Liste des clients ayant atteint 70% de cotisation et éligibles au versement 100%' })
  getEligiblePayouts() {
    return {
      success: true,
      payoutTriggerThresholdPercent: 70,
      eligibleSubscriptions: [
        {
          id: 'sub-101',
          clientId: 'cli-1',
          clientName: 'Mamadou Diallo',
          clientPhone: '+221 77 450 12 34',
          categoryTitle: 'Natt Classique Mensuel 1M',
          targetAmountFcfa: 1000000,
          contributedAmountFcfa: 750000,
          progressPercent: 75.0,
          payoutTriggerPercent: 70,
          status: 'ELIGIBLE_PAYOUT',
        },
        {
          id: 'sub-102',
          clientId: 'cli-4',
          clientName: 'Fatou Binetou Fall',
          clientPhone: '+221 76 543 21 09',
          categoryTitle: 'Natt Événement — Tabaski 2026',
          targetAmountFcfa: 500000,
          contributedAmountFcfa: 360000,
          progressPercent: 72.0,
          payoutTriggerPercent: 70,
          status: 'ELIGIBLE_PAYOUT',
        },
        {
          id: 'sub-103',
          clientId: 'cli-5',
          clientName: 'Ibrahima Gueye',
          clientPhone: '+221 77 999 11 22',
          categoryTitle: 'Tekk Tegui Projet Matériel 3M',
          targetAmountFcfa: 3000000,
          contributedAmountFcfa: 2150000,
          progressPercent: 71.6,
          payoutTriggerPercent: 70,
          status: 'ELIGIBLE_PAYOUT',
        },
      ],
    };
  }

  @Post('payouts/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exécuter le versement 100% à un client éligible à 70%' })
  processPayout(@Body() dto: ProcessPayoutDto) {
    this.logger.log(`Processing payout for subscription ${dto.subscriptionId} via ${dto.provider}`);
    const reference = `${dto.provider === 'Wave' ? 'WV' : dto.provider === 'Orange Money' ? 'OM' : 'VIR'}-PAYOUT-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      message: `Versement de 100% exécuté avec succès depuis la Trésorerie Unique !`,
      transaction: {
        subscriptionId: dto.subscriptionId,
        provider: dto.provider,
        reference,
        status: 'SUCCESS',
        processedAt: new Date().toISOString(),
      },
    };
  }
}

@Module({
  controllers: [TontineController, AdminTontineController],
})
export class TontineModule { }

