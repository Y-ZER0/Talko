import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Message } from "../messages/entities/message.entity";
import { User } from "../users/user.entity";
import { ConversationMember } from "../conversations/entities/conversation-member.entity";
import { SearchService } from "./search.service";
import { SearchController } from "./search.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Message, User, ConversationMember])],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
