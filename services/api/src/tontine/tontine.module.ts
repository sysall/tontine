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
          title: 'Tontine Rotative Classique 🔄',
          badge: 'Épargne Rotative',
          description: 'Recevez le pot complet à votre tour de passage garanti. Cotisations quotidiennes, hebdomadaires ou mensuelles.',
          tiers: [
            { id: 'rotative-10k', name: 'Pack Bronze', amountFcfa: 10000, frequency: 'Mensuel', maxMembers: 10 },
            { id: 'rotative-25k', name: 'Pack Argent', amountFcfa: 25000, frequency: 'Mensuel', maxMembers: 10 },
            { id: 'rotative-50k', name: 'Pack Or', amountFcfa: 50000, frequency: 'Mensuel', maxMembers: 10 },
            { id: 'rotative-100k', name: 'Pack Platine', amountFcfa: 100000, frequency: 'Mensuel', maxMembers: 10 },
          ],
        },
        {
          id: 'projet',
          type: 'projet',
          title: 'Tontine Projet & Objectifs 🎯',
          badge: 'Épargne Dédiée',
          description: 'Épargnez en groupe pour concrétiser vos projets de vie (Tabaski, Magal, Équipement, Événements) à date fixe.',
          tiers: [
            { id: 'projet-tabaski', name: 'Coffre Tabaski 🐑', amountFcfa: 25000, frequency: 'Mensuel', targetDate: 'Mai 2027' },
            { id: 'projet-magal', name: 'Coffre Magal 🕌', amountFcfa: 20000, frequency: 'Mensuel', targetDate: 'Août 2027' },
            { id: 'projet-immo', name: 'Équipement & Habitat 🏠', amountFcfa: 50000, frequency: 'Mensuel', targetDate: 'Décembre 2026' },
            { id: 'projet-voyage', name: 'Projet Voyage / Omra ✈️', amountFcfa: 100000, frequency: 'Mensuel', targetDate: 'Janvier 2027' },
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
          name: 'Tontine Rotative - Pack Or 🔄',
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
          name: 'Coffres Épargne Tabaski 🐑',
          offerType: 'projet',
          category: 'Tontine Projet & Objectifs',
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
          title: 'Versement du Pot Gagné 🎉',
          tontineName: 'Tontine Rotative - Pack Or 🔄',
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
          tontineName: 'Tontine Rotative - Pack Or 🔄',
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
          tontineName: 'Coffres Épargne Tabaski 🐑',
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
          tontineName: 'Tontine Rotative - Pack Or 🔄',
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

@Module({
  controllers: [TontineController],
})
export class TontineModule {}
