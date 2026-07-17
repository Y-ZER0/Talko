import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DeviceToken } from "./entities/device-token.entity";
import { DeviceTokensRepository } from "./repositories/device-tokens.repository";
import { FcmService } from "./services/fcm.service";
import { NotificationsService } from "./services/notifications.service";
import { NotificationsController } from "./controllers/notifications.controller";

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken])],
  providers: [DeviceTokensRepository, FcmService, NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService, FcmService],
})
export class NotificationsModule {}
