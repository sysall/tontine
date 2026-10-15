import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus, 
  Logger,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminBackofficeService, EventNattItem } from './admin-backoffice.service';
import { AdminAuthGuard, AdminProfile } from '../auth/guards/admin-auth.guard';

@ApiTags('Admin Backoffice')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('api/v1/admin/backoffice')
export class AdminBackofficeController {
  private readonly logger = new Logger(AdminBackofficeController.name);

  constructor(private readonly backofficeService: AdminBackofficeService) {}

  @Get('me')
  @ApiOperation({ summary: 'Profil de l’administrateur connecté (vérifie l’accès backoffice)' })
  getMe(@Req() req: { admin: AdminProfile }) {
    return { success: true, admin: req.admin };
  }

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
}
