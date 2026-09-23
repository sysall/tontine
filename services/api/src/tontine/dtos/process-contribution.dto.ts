import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class ProcessContributionDto {
  @ApiProperty({ description: 'ID de la souscription client /user_natts/{userNattId}', example: 'user-natt-8821' })
  @IsString()
  @IsNotEmpty()
  userNattId: string;

  @ApiProperty({ description: 'ID du client payeur', example: 'user-77123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Montant versé pour cette cotisation (en FCFA)', example: 50000 })
  @IsNumber()
  @Min(500)
  amount: number;

  @ApiProperty({ description: 'Moyen de paiement Mobile Money utilisé', enum: ['WAVE', 'ORANGE_MONEY', 'FREE_MONEY'], example: 'WAVE' })
  @IsEnum(['WAVE', 'ORANGE_MONEY', 'FREE_MONEY'])
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'FREE_MONEY';

  @ApiPropertyOptional({ description: 'Référence unique de la passerelle de paiement Wave / OM', example: 'TXN-WAVE-89214912' })
  @IsString()
  @IsOptional()
  gatewayReference?: string;
}
