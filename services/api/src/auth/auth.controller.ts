import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseLoginDto, UpdateProfileDto, UpdatePaymentMethodDto } from './dto/request-otp.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { AuthenticatedUser } from './user-identity';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('firebase-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion / Inscription via Token Firebase (SMS OTP ou Email/Password)' })
  @ApiResponse({ status: 200, description: 'Utilisateur authentifié et profil Firestore synchronisé.' })
  async firebaseLogin(@Body() dto: FirebaseLoginDto) {
    return this.authService.firebaseLogin(dto.idToken, dto.fullName, dto.role);
  }

  @Post('update-profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le prénom & nom de l’utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Nom d’utilisateur mis à jour dans Firestore.' })
  async updateProfile(@Req() req: { user: AuthenticatedUser }, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfileName(req.user, dto.fullName);
  }

  @Post('update-payment-method')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le moyen de paiement par défaut de l’utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Moyen de paiement mis à jour dans Firestore.' })
  async updatePaymentMethod(@Req() req: { user: AuthenticatedUser }, @Body() dto: UpdatePaymentMethodDto) {
    return this.authService.updatePaymentMethod(req.user, dto.defaultPaymentProvider, dto.paymentPhoneNumber);
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupère le profil de l’utilisateur connecté' })
  async getProfile(@Req() req: { user: AuthenticatedUser }) {
    return {
      success: true,
      user: req.user,
    };
  }
}
