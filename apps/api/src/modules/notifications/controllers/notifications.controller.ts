import { Controller, Post, Delete, Body, Param, Logger } from "@nestjs/common";
import { NotificationsService } from "../services/notifications.service";
import { RegisterTokenRequestDto } from "../dto/register-token-request.dto";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import { User } from "../../users/user.entity";

@Controller("notifications")
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post("register-token")
  async registerToken(
    @CurrentUser() user: User,
    @Body() dto: RegisterTokenRequestDto,
  ) {
    this.logger.log(`registerToken: userId=${user.id}, platform=${dto.platform}`);
    await this.notificationsService.registerToken(user.id, dto);
    return { success: true };
  }

  @Delete("tokens/:fcmToken")
  async unregisterToken(
    @CurrentUser() user: User,
    @Param("fcmToken") fcmToken: string,
  ) {
    this.logger.log(`unregisterToken: userId=${user.id}`);
    await this.notificationsService.unregisterToken(user.id, fcmToken);
    return { success: true };
  }
}
