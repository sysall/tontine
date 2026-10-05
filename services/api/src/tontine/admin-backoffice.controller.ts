import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus, 
  Logger 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminBackofficeService, EventNattItem } from './admin-backoffice.service';

@ApiTags('Admin Backoffice')
@Controller('api/v1/admin/backoffice')
export class AdminBackofficeController {
  private readonly logger = new Logger(AdminBackofficeController.name);

  constructor(private readonly backofficeService: AdminBackofficeService) {}

  @Get('data')
  @ApiOperation({ summary: 'Récupérer l’ensemble des données du Backoffice Web (Trésorerie, Clients, Souscriptions, KYC, Cotisations, etc.)' })
  getBackofficeData() {
    return this.backofficeService.getBackofficeData();
  }

  @Post('payouts/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déclencher un versement 100% pour un client éligible à 70%' })
  processPayout(
    @Body() dto: { subscriptionId: string; provider: 'Wave' | 'Orange Money' | 'Virement' }
  ) {
    this.logger.log(`Processing payout for subscription ${dto.subscriptionId} via ${dto.provider}`);
    return this.backofficeService.processPayout(dto.subscriptionId, dto.provider);
  }

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle campagne Natt Événement' })
  addEventNatt(@Body() dto: Omit<EventNattItem, 'id' | 'subscribersCount'>) {
    this.logger.log(`Adding new Event Natt: ${dto.title}`);
    return this.backofficeService.addEventNatt(dto);
  }

  @Delete('events/:eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer / Désactiver un Natt Événement' })
  deleteEventNatt(@Param('eventId') eventId: string) {
    this.logger.log(`Deleting/Deactivating Event Natt: ${eventId}`);
    return this.backofficeService.deleteEventNatt(eventId);
  }

  @Post('events/:eventId/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activer / Désactiver un Natt Événement sur Firestore' })
  toggleEventNattStatus(
    @Param('eventId') eventId: string,
    @Body() dto?: { status?: 'ACTIVE' | 'INACTIVE' }
  ) {
    this.logger.log(`Toggling Event Natt status for ${eventId} to ${dto?.status || 'opposite'}`);
    return this.backofficeService.toggleEventNattStatus(eventId, dto?.status);
  }

  @Post('kyc/:kycId/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valider un dossier KYC client' })
  approveKyc(
    @Param('kycId') kycId: string,
    @Body() dto?: { notes?: string }
  ) {
    this.logger.log(`Approving KYC for ${kycId}`);
    return this.backofficeService.approveKyc(kycId, dto?.notes);
  }

  @Post('kyc/:kycId/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejeter un dossier KYC client avec motif' })
  rejectKyc(
    @Param('kycId') kycId: string,
    @Body() dto: { notes: string }
  ) {
    this.logger.log(`Rejecting KYC for ${kycId} - Reason: ${dto.notes}`);
    return this.backofficeService.rejectKyc(kycId, dto.notes);
  }

  @Post('overdue/:overdueId/remind')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envoyer une relance pour une cotisation en retard' })
  sendReminder(@Param('overdueId') overdueId: string) {
    this.logger.log(`Sending reminder for overdue item ${overdueId}`);
    return this.backofficeService.sendReminder(overdueId);
  }
}
