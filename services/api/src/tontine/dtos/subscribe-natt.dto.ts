import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export class SubscribeNattDto {
  @ApiProperty({ description: 'ID du client souscripteur', example: 'user-77123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Catégorie de souscription', enum: ['PERMANENT', 'EVENT'], example: 'PERMANENT' })
  @IsEnum(['PERMANENT', 'EVENT'])
  category: 'PERMANENT' | 'EVENT';

  @ApiPropertyOptional({ description: 'Catalogue permanent choisi (si category == PERMANENT)', enum: ['natt_classique', 'tekk_tegui'], example: 'natt_classique' })
  @IsEnum(['natt_classique', 'tekk_tegui'])
  @IsOptional()
  catalogId?: 'natt_classique' | 'tekk_tegui';

  @ApiPropertyOptional({ description: 'ID du Natt Événement (si category == EVENT)', example: 'event-tabaski-2026' })
  @IsString()
  @IsOptional()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Montant cible personnalisé par l\'utilisateur (si category == PERMANENT, en FCFA)', example: 500000 })
  @IsNumber()
  @Min(10000)
  @IsOptional()
  targetAmount?: number;

  @ApiPropertyOptional({ description: 'Fréquence choisie (si category == PERMANENT)', enum: ['DAILY', 'WEEKLY', 'MONTHLY'], example: 'MONTHLY' })
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  @IsOptional()
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @ApiPropertyOptional({ description: 'Titre ou nom personnalisé pour son Natt', example: 'Mon Épargne Commerce' })
  @IsString()
  @IsOptional()
  customTitle?: string;

  @ApiPropertyOptional({ description: 'Montant du premier versement effectué lors de la souscription (FCFA)', example: 50000 })
  @IsNumber()
  @IsOptional()
  initialPaymentAmount?: number;

  @ApiPropertyOptional({ description: 'Moyen de paiement (wave, orange_money)', example: 'wave' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Numéro de téléphone du client souscripteur', example: '+221770000000' })
  @IsString()
  @IsOptional()
  userPhone?: string;
}
