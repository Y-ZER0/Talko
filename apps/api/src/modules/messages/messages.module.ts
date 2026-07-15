import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "./entities/message.entity";
import { MessageReceipt } from "./entities/message-receipt.entity";
import { MessageReaction } from "./entities/message-reaction.entity";
import { MessagesService } from "./messages.service";
import { MessagesController } from "./messages.controller";
import { MessagesRepository } from "./repositories/messages.repository";
import { ConversationsModule } from "../conversations/conversations.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageReceipt, MessageReaction]),
    ConversationsModule,
  ],
  providers: [MessagesService, MessagesRepository],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
