import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus, 
  Logger, 
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { TontineTransactionService } from './tontine-transaction.service';
import { CreateEventNattDto } from './dtos/create-event-natt.dto';
import { UpdateEventNattDto } from './dtos/update-event-natt.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

/**
 * All routes require a valid Firebase ID token belonging to an active
 * Firestore `admins/{uid}` document (see AdminAuthGuard).
 */
@ApiTags('Admin - Gestion des Natts Événements')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('api/v1/admin/events')
export class AdminEventsController {
  private readonly logger = new Logger(AdminEventsController.name);

  constructor(private readonly tontineService: TontineTransactionService) {}

  @Get()
  @ApiOperation({ summary: 'Liste complète des Natts Événements (Admin)' })
  async getAllEvents() {
    return {
      success: true,
      events: await this.tontineService.getAllEventNattsForAdmin(),
    };
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Détails d\'un Natt Événement' })
  @ApiParam({ name: 'eventId', description: 'ID de l\'événement' })
  async getEventById(@Param('eventId') eventId: string) {
    return {
      success: true,
      event: await this.tontineService.getEventNattById(eventId),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'A. Créer une nouvelle campagne Natt Événement' })
  @ApiResponse({ status: 201, description: 'Natt Événement créé avec succès.' })
  async createEvent(@Body() dto: CreateEventNattDto) {
    const event = await this.tontineService.createEventNatt(dto);
    return {
      success: true,
      message: `Natt Événement "${event.title}" créé avec succès par l'Admin !`,
      event,
    };
  }

  @Put(':eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'A. Modifier un Natt Événement ouvert' })
  @ApiParam({ name: 'eventId', description: 'ID de l\'événement à modifier' })
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventNattDto,
  ) {
    const updated = await this.tontineService.updateEventNatt(eventId, dto);
    return {
      success: true,
      message: `Natt Événement "${updated.title}" mis à jour avec succès.`,
      event: updated,
    };
  }

  @Delete(':eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'A. Supprimer / Archiver un Natt Événement' })
  @ApiParam({ name: 'eventId', description: 'ID de l\'événement à supprimer' })
  async deleteEvent(@Param('eventId') eventId: string) {
    const result = await this.tontineService.deleteEventNatt(eventId);
    return result;
  }
}
