import { Module } from "@nestjs/common";
import { MessagesModule } from "../messages/messages.module";
import { UsersModule } from "../users/users.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ChatGateway } from "./chat.gateway";

@Module({
  imports: [MessagesModule, UsersModule, NotificationsModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class RealtimeModule {}
