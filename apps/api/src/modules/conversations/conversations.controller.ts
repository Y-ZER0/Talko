import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { ConversationsService } from "./conversations.service";
import { CreateConversationRequestDto } from "./dto/create-conversation-request.dto";
import { AddMemberRequestDto } from "./dto/add-member-request.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../users/user.entity";

@Controller("conversations")
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateConversationRequestDto,
  ) {
    const conversation = await this.conversationsService.create(
      user.id,
      dto,
    );
    return this.conversationsService.toCreateConversationDto(conversation);
  }

  @Get()
  getMyConversations(@CurrentUser() user: User) {
    return this.conversationsService.getMyConversations(user.id);
  }

  @Get(":id")
  async getConversation(
    @CurrentUser() user: User,
    @Param("id") conversationId: string,
  ) {
    return this.conversationsService.getConversation(user.id, conversationId);
  }

  @Post(":id/members")
  async addMember(
    @CurrentUser() user: User,
    @Param("id") conversationId: string,
    @Body() dto: AddMemberRequestDto,
  ) {
    return this.conversationsService.addMember(conversationId, dto.userId);
  }

  @Delete(":id/members/:userId")
  async removeMember(
    @CurrentUser() user: User,
    @Param("id") conversationId: string,
    @Param("userId") memberUserId: string,
  ) {
    await this.conversationsService.removeMember(
      conversationId,
      memberUserId,
    );
  }
}
