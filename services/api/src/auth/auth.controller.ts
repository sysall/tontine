import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/request-otp.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Demande de code OTP pour un numéro sénégalais (+221)' })
  @ApiResponse({ status: 200, description: 'Code OTP généré et envoyé.' })
  @ApiResponse({ status: 400, description: 'Numéro de téléphone invalide.' })
  async requestOtp(@Body() dto: RequestOtpDto) {
    return this.authService.requestOtp(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vérification du code OTP reçu' })
  @ApiResponse({ status: 200, description: 'Connexion/Inscription réussie avec JWT.' })
  @ApiResponse({ status: 400, description: 'Code OTP invalide ou expiré.' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }
}
