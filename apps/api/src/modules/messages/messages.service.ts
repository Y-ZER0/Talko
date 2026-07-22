import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Message } from "./entities/message.entity";
import { MessageAttachment } from "./entities/message-attachment.entity";
import { MessageReaction } from "./entities/message-reaction.entity";
import { SendMessageRequestDto } from "./dto/send-message-request.dto";
import { MessagesRepository } from "./repositories/messages.repository";
import { ConversationMembersRepository } from "../conversations/repositories/conversation-members.repository";
import { ConversationsRepository } from "../conversations/repositories/conversations.repository";
import type {
  MessageDto,
  ReceiptUpdateEventPayload,
  MessageAttachmentDto,
  ReactionDto,
  ParentMessageDto,
} from "@repo/shared";

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly memberRepository: ConversationMembersRepository,
    private readonly conversationsRepository: ConversationsRepository,
  ) {}

  async create(
    senderId: string,
    conversationId: string,
    dto: SendMessageRequestDto,
  ): Promise<MessageDto> {
    let isMember = await this.memberRepository.findByConversationAndUser(
      conversationId,
      senderId,
    );

    if (!isMember) {
      const conversation = await this.conversationsRepository.findById(conversationId);
      if (!conversation) throw new NotFoundException("Conversation not found");
      if (conversation.isGroup) throw new NotFoundException("Conversation not found");

      isMember = await this.memberRepository.save({
        conversationId,
        userId: senderId,
        role: "member",
      });
    }

    const existing = await this.messagesRepository.findByClientId(
      conversationId,
      senderId,
      dto.clientId,
    );
    if (existing) {
      let parentMsg: ParentMessageDto | undefined;
      if (existing.parentId) {
        const parents = await this.messagesRepository.findParentMessages([existing.parentId]);
        parentMsg = parents.get(existing.parentId);
      }
      return this.toDto(existing, undefined, parentMsg);
    }

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

    let parentMsg: ParentMessageDto | undefined;
    if (dto.parentId) {
      const parents = await this.messagesRepository.findParentMessages([dto.parentId]);
      parentMsg = parents.get(dto.parentId);
    }
    return this.toDto(message, undefined, parentMsg);
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

    const messageIds = messages.map((m) => m.id);
    const receipts = await this.messagesRepository.findReceiptsForMessages(
      messageIds,
      userId,
    );

    const parentIds = messages
      .map((m) => m.parentId)
      .filter((id): id is string => id !== null && id !== undefined);
    const uniqueParentIds = [...new Set(parentIds)];
    const parentMessages = await this.messagesRepository.findParentMessages(uniqueParentIds);

    const data = messages.map((m) => this.toDto(m, receipts.get(m.id), parentMessages.get(m.parentId ?? "")));
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

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validIds = messageIds.filter((id) => uuidRegex.test(id));
    if (validIds.length === 0) return {};

    await this.messagesRepository.upsertReceipts(validIds, userId);

    const maxCreatedAt = await this.messagesRepository.findMaxCreatedAt(validIds);
    if (maxCreatedAt) {
      const currentMember = await this.memberRepository.findByConversationAndUser(
        conversationId,
        userId,
      );
      const currentLastReadAt = currentMember?.lastReadAt;
      const newLastReadAt =
        currentLastReadAt && currentLastReadAt > maxCreatedAt
          ? currentLastReadAt
          : maxCreatedAt;
      await this.memberRepository.updateLastReadAt(
        conversationId,
        userId,
        newLastReadAt,
      );
    }

    const senders = await this.messagesRepository.findMessageSenders(validIds);

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

  async edit(
    userId: string,
    messageId: string,
    content: string,
  ): Promise<MessageDto> {
    const message = await this.messagesRepository.findById(messageId);
    if (!message)
      throw new NotFoundException("Message not found");
    if (message.senderId !== userId)
      throw new UnauthorizedException("Not your message to edit");

    const updated = await this.messagesRepository.updateMessage(messageId, {
      content,
      editedAt: new Date(),
    });

    const saved = await this.messagesRepository.findById(messageId);
    let parentMsg: ParentMessageDto | undefined;
    if (saved!.parentId) {
      const parents = await this.messagesRepository.findParentMessages([saved!.parentId]);
      parentMsg = parents.get(saved!.parentId);
    }
    return this.toDto(saved!, undefined, parentMsg);
  }

  async delete(
    userId: string,
    messageId: string,
  ): Promise<MessageDto> {
    const message = await this.messagesRepository.findById(messageId);
    if (!message)
      throw new NotFoundException("Message not found");
    if (message.senderId !== userId)
      throw new UnauthorizedException("Not your message to delete");

    await this.messagesRepository.updateMessage(messageId, {
      isDeleted: true,
      content: null,
    });

    const saved = await this.messagesRepository.findById(messageId);
    let parentMsg: ParentMessageDto | undefined;
    if (saved!.parentId) {
      const parents = await this.messagesRepository.findParentMessages([saved!.parentId]);
      parentMsg = parents.get(saved!.parentId);
    }
    return this.toDto(saved!, undefined, parentMsg);
  }

  async addReaction(
    userId: string,
    messageId: string,
    emoji: string,
  ): Promise<{ reaction: ReactionDto; replacedEmoji: string | null }> {
    const message = await this.messagesRepository.findById(messageId);
    if (!message)
      throw new NotFoundException("Message not found");

    const { reaction, replacedEmoji } = await this.messagesRepository.upsertReaction(
      messageId,
      userId,
      emoji,
    );

    return { reaction: this.reactionToDto(reaction), replacedEmoji };
  }

  async removeReaction(
    userId: string,
    messageId: string,
    emoji: string,
  ): Promise<void> {
    await this.messagesRepository.deleteReaction(messageId, userId, emoji);
  }

  private reactionToDto(reaction: MessageReaction): ReactionDto {
    return {
      id: reaction.id,
      messageId: reaction.messageId,
      userId: reaction.userId,
      emoji: reaction.emoji,
      createdAt: reaction.createdAt.toISOString(),
    };
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

  toDto(
    message: Message,
    receipt?: { userId: string; status: string; readAt: Date | null },
    parentMessage?: ParentMessageDto,
  ): MessageDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      parentId: message.parentId ?? null,
      parentMessage: parentMessage ?? null,
      content: message.content ?? null,
      attachments: (message.attachments ?? []).map((a) => this.attachmentToDto(a)),
      reactions: (message.reactions ?? []).map((r) => this.reactionToDto(r)),
      receipts: receipt
        ? [{ userId: receipt.userId, status: receipt.status, readAt: receipt.readAt?.toISOString() ?? null }]
        : [],
      isDeleted: message.isDeleted,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      editedAt: message.editedAt?.toISOString() ?? null,
      clientId: message.clientId,
    };
  }
}
