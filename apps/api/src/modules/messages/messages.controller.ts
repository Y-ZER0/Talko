import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { SendMessageRequestDto } from "./dto/send-message-request.dto";
import { EditMessageRequestDto } from "./dto/edit-message-request.dto";
import { ReactToMessageRequestDto } from "./dto/react-to-message-request.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../users/user.entity";

@Controller("conversations/:conversationId/messages")
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
  ) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Param("conversationId") conversationId: string,
    @Body() dto: SendMessageRequestDto,
  ) {
    return this.messagesService.create(user.id, conversationId, dto);
  }

  @Get()
  async getMessages(
    @CurrentUser() user: User,
    @Param("conversationId") conversationId: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: string,
  ) {
    return this.messagesService.getMessages(
      conversationId,
      user.id,
      cursor,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Patch(":messageId")
  async edit(
    @CurrentUser() user: User,
    @Param("messageId") messageId: string,
    @Body() dto: EditMessageRequestDto,
  ) {
    return this.messagesService.edit(user.id, messageId, dto.content);
  }

  @Delete(":messageId")
  async delete(
    @CurrentUser() user: User,
    @Param("messageId") messageId: string,
  ) {
    return this.messagesService.delete(user.id, messageId);
  }

  @Post(":messageId/reactions")
  async addReaction(
    @CurrentUser() user: User,
    @Param("messageId") messageId: string,
    @Body() dto: ReactToMessageRequestDto,
  ) {
    return this.messagesService.addReaction(user.id, messageId, dto.emoji);
  }

  @Delete(":messageId/reactions/:emoji")
  async removeReaction(
    @CurrentUser() user: User,
    @Param("messageId") messageId: string,
    @Param("emoji") emoji: string,
  ) {
    return this.messagesService.removeReaction(user.id, messageId, emoji);
  }
}
