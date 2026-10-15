import { Controller, Post, Get, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KycService, UploadKycDto } from './kyc.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@ApiTags('KYC & Pièces d\'Identité')
@Controller('api/v1/kyc')
export class KycController {
  private readonly logger = new Logger(KycController.name);

  constructor(private readonly kycService: KycService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Téléverser Recto/Verso (CNI / Passeport) + Selfie pour vérification manuelle admin' })
  @ApiResponse({ status: 200, description: 'Dossier KYC enregistré et soumis à l\'administration pour validation' })
  async uploadKyc(@Body() dto: UploadKycDto) {
    this.logger.log(`POST /api/v1/kyc/upload pour ${dto.clientName || dto.userId}`);
    return this.kycService.uploadKycDocument(dto);
  }

  @Get('status/:userId')
  @ApiOperation({ summary: 'Vérifier le statut KYC en temps réel d\'un utilisateur' })
  async getStatus(@Param('userId') userId: string) {
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
