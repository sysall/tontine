import { Controller, Post, Get, Body, Param, Query, Logger, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KycService, UploadKycDto } from './kyc.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AuthenticatedUser, belongsToUser } from '../auth/user-identity';

@ApiTags('KYC & Pièces d\'Identité')
@Controller('api/v1/kyc')
export class KycController {
  private readonly logger = new Logger(KycController.name);

  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Téléverser Recto/Verso (CNI / Passeport) + Selfie pour vérification manuelle admin' })
  @ApiResponse({ status: 200, description: 'Dossier KYC enregistré et soumis à l\'administration pour validation' })
  async uploadKyc(@Req() req: { user: AuthenticatedUser }, @Body() dto: UploadKycDto) {
    dto.userId = req.user.docId || req.user.uid;
    dto.clientPhone = req.user.phoneNumber || dto.clientPhone || dto.userId;
    dto.clientName = req.user.fullName || dto.clientName || 'Membre Tontine';

    this.logger.log(`POST /api/v1/kyc/upload pour ${dto.clientName} (${dto.userId})`);
    return this.kycService.uploadKycDocument(dto);
  }

  @Get('status/:userId')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifier le statut KYC en temps réel d\'un utilisateur' })
  async getStatus(@Req() req: { user: AuthenticatedUser }, @Param('userId') userId: string) {
    if (!belongsToUser({ userId }, req.user) && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Vous n’êtes pas autorisé à consulter ce statut KYC.');
    }
    return this.kycService.getKycStatus(userId);
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Liste des dossiers KYC pour le Backoffice Admin' })
  async getAllRecords() {
    return this.kycService.getAllKycRecords();
  }

  @Post(':kycId/approve')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Validation manuelle d\'un dossier KYC par l\'Administrateur' })
  async approveKyc(@Param('kycId') kycId: string, @Body() body?: { notes?: string }) {
    return this.kycService.approveKyc(kycId, body?.notes);
  }

  @Post(':kycId/reject')
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Rejet d\'un dossier KYC avec justification' })
  async rejectKyc(@Param('kycId') kycId: string, @Body() body: { notes: string }) {
    return this.kycService.rejectKyc(kycId, body.notes);
  }
}
