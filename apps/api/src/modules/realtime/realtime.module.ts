import { Module, forwardRef } from "@nestjs/common";
import { MessagesModule } from "../messages/messages.module";
import { UsersModule } from "../users/users.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { ConversationsModule } from "../conversations/conversations.module";
import { PresenceModule } from "../presence/presence.module";
import { ConnectionGateway } from "./connection.gateway";
import { ConversationGateway } from "./conversation.gateway";
import { MessageGateway } from "./message.gateway";
import { ReceiptGateway } from "./receipt.gateway";
import { MessageInteractionGateway } from "./message-interaction.gateway";
import { ReactionGateway } from "./reaction.gateway";

@Module({
  imports: [
    MessagesModule,
    UsersModule,
    NotificationsModule,
    forwardRef(() => ConversationsModule),
    PresenceModule,
  ],
  providers: [
    ConnectionGateway,
    ConversationGateway,
    MessageGateway,
    ReceiptGateway,
    MessageInteractionGateway,
    ReactionGateway,
  ],
  exports: [
    ConnectionGateway,
    ConversationGateway,
    MessageGateway,
    ReceiptGateway,
    MessageInteractionGateway,
    ReactionGateway,
  ],
})
export class RealtimeModule {}
