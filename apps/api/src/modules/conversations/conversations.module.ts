import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "./entities/conversation.entity";
import { ConversationMember } from "./entities/conversation-member.entity";
import { ConversationsService } from "./conversations.service";
import { ConversationsController } from "./conversations.controller";
import { ConversationsRepository } from "./repositories/conversations.repository";
import { ConversationMembersRepository } from "./repositories/conversation-members.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, ConversationMember])],
  providers: [
    ConversationsService,
    ConversationsRepository,
    ConversationMembersRepository,
  ],
  controllers: [ConversationsController],
  exports: [ConversationsService, ConversationMembersRepository],
})
export class ConversationsModule {}
