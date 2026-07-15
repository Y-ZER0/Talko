import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { Message } from "./entities/message.entity";
import { SendMessageRequestDto } from "./dto/send-message-request.dto";
import { MessagesRepository } from "./repositories/messages.repository";
import { ConversationMembersRepository } from "../conversations/repositories/conversation-members.repository";
import type { MessageDto } from "@repo/shared";

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly memberRepository: ConversationMembersRepository,
  ) {}

  async create(
    senderId: string,
    conversationId: string,
    dto: SendMessageRequestDto,
  ): Promise<MessageDto> {
    const isMember = await this.memberRepository.findByConversationAndUser(
      conversationId,
      senderId,
    );
    if (!isMember)
      throw new NotFoundException("Conversation not found");

    const existing = await this.messagesRepository.findByClientId(
      conversationId,
      senderId,
      dto.clientId,
    );
    if (existing) return this.toDto(existing);

    const message = await this.messagesRepository.save({
      conversationId,
      senderId,
      content: dto.content ?? null,
      parentId: dto.parentId ?? null,
      mediaUrl: dto.mediaUrl ?? null,
      mediaType: dto.mediaType ?? null,
      clientId: dto.clientId,
    });

    return this.toDto(message);
  }

  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<{
    data: MessageDto[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    const isMember = await this.memberRepository.findByConversationAndUser(
      conversationId,
      userId,
    );
    if (!isMember)
      throw new NotFoundException("Conversation not found");

    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const { messages, hasMore } =
      await this.messagesRepository.findByConversationPaginated(
        conversationId,
        cursor,
        safeLimit,
      );

    const data = messages.map((m) => this.toDto(m));
    const nextCursor =
      data.length > 0 ? data[data.length - 1].createdAt : null;

    return { data, nextCursor, hasMore };
  }

  toDto(message: Message): MessageDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      parentId: message.parentId ?? null,
      content: message.content ?? null,
      mediaUrl: message.mediaUrl ?? null,
      mediaType: message.mediaType ?? null,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      editedAt: message.editedAt?.toISOString() ?? null,
      clientId: message.clientId,
    };
  }
}
