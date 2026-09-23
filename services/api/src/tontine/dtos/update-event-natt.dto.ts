import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, Min } from 'class-validator';

export class UpdateEventNattDto {
  @ApiPropertyOptional({ description: 'Titre de l\'événement', example: 'Opération Tabaski 2026 (Mise à jour)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Description détaillée', example: 'Nouvelle description mise à jour.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'URL de l\'image d\'illustration' })
  @IsString()
  @IsOptional()
  bannerImageUrl?: string;

  @ApiPropertyOptional({ description: 'Montant cible total (en FCFA)', example: 350000 })
  @IsNumber()
  @Min(10000)
  @IsOptional()
  targetAmount?: number;

  @ApiPropertyOptional({ description: 'Montant de chaque versement (en FCFA)', example: 50000 })
  @IsNumber()
  @Min(1000)
  @IsOptional()
  installmentAmount?: number;

  @ApiPropertyOptional({ description: 'Fréquence imposée', enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  @IsOptional()
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @ApiPropertyOptional({ description: 'Date limite d\'adhésion' })
  @IsDateString()
  @IsOptional()
  subscriptionDeadline?: string;

  @ApiPropertyOptional({ description: 'Date d\'échéance de l\'événement' })
  @IsDateString()
  @IsOptional()
  eventDueDate?: string;

  @ApiPropertyOptional({ description: 'Statut de l\'événement', enum: ['DRAFT', 'ACTIVE', 'CLOSED', 'DELETED'] })
  @IsEnum(['DRAFT', 'ACTIVE', 'CLOSED', 'DELETED'])
  @IsOptional()
  status?: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'DELETED';
}
