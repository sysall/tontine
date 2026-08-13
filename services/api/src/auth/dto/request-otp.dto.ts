import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
