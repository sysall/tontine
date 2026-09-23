import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateEventNattDto {
  @ApiProperty({ description: 'Titre de l\'événement (ex: Opération Tabaski 2026)', example: 'Opération Tabaski 2026' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description détaillée de la tontine événementielle', example: 'Épargne ciblée pour l\'achat de moutons et préparatifs de la fête.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'URL de l\'image d\'illustration / bannière', example: 'https://cdn.tontineexpress.sn/banners/tabaski.png' })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiProperty({ description: 'Montant cible total du Natt Événement (en FCFA)', example: 300000 })
  @IsNumber()
  @Min(10000)
  targetAmount: number;

  @ApiProperty({ description: 'Montant de chaque versement périodique imposé (en FCFA)', example: 50000 })
  @IsNumber()
  @Min(1000)
  installmentAmount: number;

  @ApiProperty({ description: 'Fréquence imposée de versement', enum: ['DAILY', 'WEEKLY', 'MONTHLY'], example: 'MONTHLY' })
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @ApiProperty({ description: 'Date limite d\'adhésion / souscription (ISO 8601)', example: '2026-05-15T23:59:59.000Z' })
  @IsDateString()
  subscriptionDeadline: string;

  @ApiProperty({ description: 'Date d\'échéance de l\'événement / fin du Natt (ISO 8601)', example: '2026-06-15T00:00:00.000Z' })
  @IsDateString()
  eventDueDate: string;
}
