import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { SendMessageRequestDto } from "./dto/send-message-request.dto";
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
}
