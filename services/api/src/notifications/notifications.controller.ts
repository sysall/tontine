import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { AuthenticatedUser } from '../auth/user-identity';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Notifications de l’utilisateur connecté (retards de cotisation, versements admin)' })
  async list(@Req() req: { user: AuthenticatedUser }, @Query('limit') limit?: string) {
    const parsed = Math.min(100, Math.max(1, Number(limit) || 50));
    const result = await this.notificationsService.listForUser(req.user, parsed);
    return { success: true, ...result };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer toutes les notifications comme lues' })
  async markAllAsRead(@Req() req: { user: AuthenticatedUser }) {
    const result = await this.notificationsService.markAllAsRead(req.user);
    return { success: true, ...result };
  }

  @Post(':notificationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  async markAsRead(@Req() req: { user: AuthenticatedUser }, @Param('notificationId') notificationId: string) {
    const notification = await this.notificationsService.markAsRead(req.user, notificationId);
    return { success: true, notification };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Vider l’historique des notifications' })
  async clearAll(@Req() req: { user: AuthenticatedUser }) {
    const result = await this.notificationsService.clearAll(req.user);
    return { success: true, ...result };
  }
}
