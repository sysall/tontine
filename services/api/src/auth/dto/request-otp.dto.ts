import { IsNotEmpty, IsString, Matches, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestOtpDto {
  @ApiProperty({
    description: 'Numéro de téléphone sénégalais (ex: +221771234567, 221771234567 ou 771234567)',
    example: '+221771234567',
  })
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  @IsString({ message: 'Le numéro de téléphone doit être une chaîne' })
  @Matches(/^(\+221|221)?[7][06789]\d{7}$/, {
    message: 'Numéro de téléphone sénégalais invalide (opérateurs valides: Orange 77/78, Free 76, Expresso 70, Promobile 75)',
  })
  phoneNumber: string;
}

export class VerifyOtpDto {
  @ApiProperty({
    description: 'Numéro de téléphone sénégalais',
    example: '+221771234567',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Code OTP reçu à 6 chiffres',
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Le code OTP doit comporter exactement 6 chiffres' })
  code: string;
}

export class FirebaseLoginDto {
  @ApiProperty({
    description: 'Token ID Firebase fourni par le SDK client Firebase Auth',
    example: 'eyJhbGciOiJSUzI1NiIs...',
  })
  @IsNotEmpty({ message: 'Le token Firebase idToken est requis' })
  @IsString({ message: 'Le token Firebase doit être une chaîne' })
  idToken: string;

  @ApiPropertyOptional({
    description: 'Prénom & Nom du membre (optionnel lors de la connexion)',
    example: 'Fatou Sow',
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Rôle demandé (MEMBER par défaut)',
    example: 'MEMBER',
  })
  @IsOptional()
  @IsString()
  @IsIn(['MEMBER', 'ADMIN'])
  role?: 'MEMBER' | 'ADMIN';
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Numéro de téléphone ou UID du membre',
    example: '+221771234567',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Nouveau prénom & nom du membre',
    example: 'Fatou Sall',
  })
  @IsNotEmpty({ message: 'Le nom complet est requis' })
  @IsString()
  fullName: string;
}

export class UpdatePaymentMethodDto {
  @ApiPropertyOptional({
    description: 'Numéro de téléphone ou UID du membre',
    example: '+221771234567',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Moyen de paiement par défaut (wave ou orange_money)',
    example: 'wave',
  })
  @IsNotEmpty()
  @IsString()
  @IsIn(['wave', 'orange_money'])
  defaultPaymentProvider: 'wave' | 'orange_money';

  @ApiProperty({
    description: 'Numéro de téléphone rattaché au moyen de paiement',
    example: '+221771234567',
  })
  @IsNotEmpty()
  @IsString()
  paymentPhoneNumber: string;
}
