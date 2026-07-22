import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "./entities/conversation.entity";
import { ConversationMember } from "./entities/conversation-member.entity";
import { ConversationsService } from "./conversations.service";
import { ConversationsController } from "./conversations.controller";
import { ConversationsRepository } from "./repositories/conversations.repository";
import { ConversationMembersRepository } from "./repositories/conversation-members.repository";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ConversationMember]),
    forwardRef(() => RealtimeModule),
  ],
  providers: [
    ConversationsService,
    ConversationsRepository,
    ConversationMembersRepository,
  ],
  controllers: [ConversationsController],
  exports: [ConversationsService, ConversationsRepository, ConversationMembersRepository],
})
export class ConversationsModule {}
