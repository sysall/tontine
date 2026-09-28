import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto, FirebaseLoginDto, UpdateProfileDto, UpdatePaymentMethodDto } from './dto/request-otp.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { UserDocument } from '@tontine/types';

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
  @ApiOperation({ summary: 'Mettre à jour le prénom & nom d’un utilisateur dans Firestore' })
  @ApiResponse({ status: 200, description: 'Nom d’utilisateur mis à jour dans Firestore.' })
  async updateProfile(@Body() dto: UpdateProfileDto) {
    return this.authService.updateProfileName(dto.phoneNumber, dto.fullName);
  }

  @Post('update-payment-method')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mettre à jour le moyen de paiement par défaut dans Firestore' })
  @ApiResponse({ status: 200, description: 'Moyen de paiement mis à jour dans Firestore.' })
  async updatePaymentMethod(@Body() dto: UpdatePaymentMethodDto) {
    return this.authService.updatePaymentMethod(dto.phoneNumber, dto.defaultPaymentProvider, dto.paymentPhoneNumber);
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupère le profil de l’utilisateur connecté' })
  async getProfile(@Req() req: { user: UserDocument }) {
    return {
      success: true,
      user: req.user,
    };
  }

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demande de code OTP pour un numéro sénégalais (+221)' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérification du code OTP reçu' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }
}
