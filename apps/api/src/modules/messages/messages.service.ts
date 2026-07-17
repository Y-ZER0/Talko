import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Message } from "./entities/message.entity";
import { MessageAttachment } from "./entities/message-attachment.entity";
import { SendMessageRequestDto } from "./dto/send-message-request.dto";
import { MessagesRepository } from "./repositories/messages.repository";
import { ConversationMembersRepository } from "../conversations/repositories/conversation-members.repository";
import type { MessageDto, ReceiptUpdateEventPayload, MessageAttachmentDto } from "@repo/shared";

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

    const message = await this.messagesRepository.saveWithAttachments({
      conversationId,
      senderId,
      content: dto.content ?? null,
      parentId: dto.parentId ?? null,
      clientId: dto.clientId,
      attachments: dto.attachments?.map((a) => ({
        mediaUrl: a.mediaUrl,
        mediaType: a.mediaType,
        fileSizeBytes: a.fileSize ?? null,
      })),
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

  async markAsRead(
    userId: string,
    conversationId: string,
    messageIds: string[],
  ): Promise<Record<string, ReceiptUpdateEventPayload[]>> {
    const isMember = await this.memberRepository.findByConversationAndUser(
      conversationId,
      userId,
    );
    if (!isMember)
      throw new NotFoundException("Conversation not found");

    await this.messagesRepository.upsertReceipts(messageIds, userId);

    const maxCreatedAt = await this.messagesRepository.findMaxCreatedAt(messageIds);
    if (maxCreatedAt) {
      await this.memberRepository.updateLastReadAt(
        conversationId,
        userId,
        maxCreatedAt,
      );
    }

    const senders = await this.messagesRepository.findMessageSenders(messageIds);

    const grouped: Record<string, ReceiptUpdateEventPayload[]> = {};
    for (const { messageId, senderId } of senders) {
      if (!grouped[senderId]) grouped[senderId] = [];
      grouped[senderId].push({
        messageId,
        userId,
        status: "read",
        readAt: new Date().toISOString(),
      });
    }

    return grouped;
  }

  private attachmentToDto(attachment: MessageAttachment): MessageAttachmentDto {
    return {
      id: attachment.id,
      messageId: attachment.messageId,
      mediaUrl: attachment.mediaUrl,
      mediaType: attachment.mediaType,
      thumbnailUrl: attachment.thumbnailUrl ?? null,
      fileSizeBytes: attachment.fileSizeBytes ?? null,
      createdAt: attachment.createdAt.toISOString(),
    };
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
      attachments: (message.attachments ?? []).map((a) => this.attachmentToDto(a)),
      isDeleted: message.isDeleted,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      editedAt: message.editedAt?.toISOString() ?? null,
      clientId: message.clientId,
    };
  }
}
