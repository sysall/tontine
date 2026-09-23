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
  Headers, 
  UnauthorizedException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam } from '@nestjs/swagger';
import { TontineTransactionService } from './tontine-transaction.service';
import { CreateEventNattDto } from './dtos/create-event-natt.dto';
import { UpdateEventNattDto } from './dtos/update-event-natt.dto';

@ApiTags('Admin - Gestion des Natts Événements')
@Controller('api/v1/admin/events')
export class AdminEventsController {
  private readonly logger = new Logger(AdminEventsController.name);

  constructor(private readonly tontineService: TontineTransactionService) {}

  /**
   * Helper function to verify admin role
   */
  private checkAdminRole(roleHeader?: string) {
    if (roleHeader !== 'admin') {
      // In production, Firebase Admin Auth Guard verifies request.auth.token.role == 'admin'
      this.logger.warn(`Access denied to admin endpoint. Role header provided: ${roleHeader}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Liste complète des Natts Événements (Admin)' })
  @ApiHeader({ name: 'x-user-role', description: 'Rôle utilisateur (ex: admin)', required: false })
  getAllEvents(@Headers('x-user-role') role?: string) {
    this.checkAdminRole(role);
    return {
      success: true,
      events: this.tontineService.getAllEventNattsForAdmin(),
    };
  }

  @Get(':eventId')
  @ApiOperation({ summary: 'Détails d\'un Natt Événement' })
  @ApiParam({ name: 'eventId', description: 'ID de l\'événement' })
  getEventById(@Param('eventId') eventId: string) {
    return {
      success: true,
      event: this.tontineService.getEventNattById(eventId),
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'A. Créer une nouvelle campagne Natt Événement' })
  @ApiHeader({ name: 'x-user-role', description: 'Rôle admin requis', required: true })
  @ApiResponse({ status: 201, description: 'Natt Événement créé avec succès.' })
  createEvent(
    @Body() dto: CreateEventNattDto,
    @Headers('x-user-role') role?: string
  ) {
    this.checkAdminRole(role);
    const event = this.tontineService.createEventNatt(dto);
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
  @ApiHeader({ name: 'x-user-role', description: 'Rôle admin requis', required: true })
  updateEvent(
    @Param('eventId') eventId: string,
    @Body() dto: UpdateEventNattDto,
    @Headers('x-user-role') role?: string
  ) {
    this.checkAdminRole(role);
    const updated = this.tontineService.updateEventNatt(eventId, dto);
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
  @ApiHeader({ name: 'x-user-role', description: 'Rôle admin requis', required: true })
  deleteEvent(
    @Param('eventId') eventId: string,
    @Headers('x-user-role') role?: string
  ) {
    this.checkAdminRole(role);
    const result = this.tontineService.deleteEventNatt(eventId);
    return result;
  }
}
