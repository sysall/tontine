import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto, FirebaseLoginDto } from './dto/request-otp.dto';
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
