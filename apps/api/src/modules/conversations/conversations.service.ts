import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { Conversation } from "./entities/conversation.entity";
import { CreateConversationRequestDto } from "./dto/create-conversation-request.dto";
import { ConversationsRepository } from "./repositories/conversations.repository";
import { ConversationMembersRepository } from "./repositories/conversation-members.repository";
import { ChatGateway } from "../realtime/chat.gateway";
import { SocketEvent } from "@repo/shared";
import type {
  ConversationDto,
  ConversationMemberWithUserDto,
} from "@repo/shared";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly memberRepository: ConversationMembersRepository,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
  ) {}

  async create(
    currentUserId: string,
    dto: CreateConversationRequestDto,
  ): Promise<Conversation> {
    if (dto.type === "direct") {
      if (!dto.participantId) {
        throw new BadRequestException(
          "participantId is required for direct conversations",
        );
      }
      return this.createDirect(currentUserId, dto.participantId);
    }

    if (!dto.participantIds || !dto.groupName) {
      throw new BadRequestException(
        "participantIds and groupName are required for group conversations",
      );
    }
    return this.createGroup(currentUserId, dto.participantIds, dto.groupName);
  }

  private async createDirect(
    currentUserId: string,
    participantId: string,
  ): Promise<Conversation> {
    const existing = await this.conversationsRepository.findExistingOneOnOne(
      currentUserId,
      participantId,
    );
    if (existing) return existing;

    const conversation = await this.conversationsRepository.save({
      isGroup: false,
      groupName: null,
    });

    await this.memberRepository.saveMany([
      {
        conversationId: conversation.id,
        userId: currentUserId,
        role: "admin",
      },
      {
        conversationId: conversation.id,
        userId: participantId,
        role: "member",
      },
    ]);

    const result = await this.conversationsRepository.findByIdWithMembers(
      conversation.id,
    ) as Conversation;

    this.chatGateway.server
      .to(`user:${participantId}`)
      .emit(SocketEvent.CONVERSATION_NEW, this.toCreateConversationDto(result));

    return result;
  }

  private async createGroup(
    currentUserId: string,
    participantIds: string[],
    groupName: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationsRepository.save({
      isGroup: true,
      groupName,
    });

    const allIds = [...new Set([currentUserId, ...participantIds])];
    await this.memberRepository.saveMany(
      allIds.map((userId) => ({
        conversationId: conversation.id,
        userId,
        role: userId === currentUserId ? "admin" : "member",
      })),
    );

    const result = await this.conversationsRepository.findByIdWithMembers(
      conversation.id,
    ) as Conversation;

    for (const userId of allIds) {
      if (userId !== currentUserId) {
        this.chatGateway.server
          .to(`user:${userId}`)
          .emit(SocketEvent.CONVERSATION_NEW, this.toCreateConversationDto(result));
      }
    }

    return result;
  }

  async getConversation(
    userId: string,
    conversationId: string,
  ): Promise<ConversationDto> {
    const conversation =
      await this.conversationsRepository.findByIdWithMembers(conversationId);
    if (!conversation)
      throw new NotFoundException("Conversation not found");

    const isMember = conversation.members.some((m) => m.userId === userId);
    if (!isMember)
      throw new NotFoundException("Conversation not found");

    return this.toConversationDto(conversation, null);
  }

  async getMyConversations(userId: string): Promise<ConversationDto[]> {
    const conversations =
      await this.conversationsRepository.findMyConversations(userId);

    if (conversations.length === 0) return [];

    const convIds = conversations.map((c) => c.id);
    const lastMessages =
      await this.conversationsRepository.getLastMessages(convIds);

    const lastMessageMap = new Map(
      lastMessages.map((lm: any) => [lm.conversationId, lm]),
    );

    return conversations.map((c) =>
      this.toConversationDto(c, lastMessageMap.get(c.id) ?? null),
    );
  }

  async addMember(
    conversationId: string,
    userId: string,
  ): Promise<ConversationMemberWithUserDto> {
    const conversation =
      await this.conversationsRepository.findById(conversationId);
    if (!conversation)
      throw new NotFoundException("Conversation not found");
    if (!conversation.isGroup)
      throw new BadRequestException(
        "Cannot add members to a 1-on-1 conversation",
      );

    const existing =
      await this.memberRepository.findByConversationAndUser(
        conversationId,
        userId,
      );
    if (existing)
      throw new ConflictException("User is already a member");

    const saved = await this.memberRepository.save({
      conversationId,
      userId,
      role: "member",
    });

    const loaded = (await this.memberRepository.findByIdWithUser(
      saved.id,
    ))!;

    return {
      id: loaded.id,
      conversationId: loaded.conversationId,
      userId: loaded.userId,
      role: loaded.role,
      joinedAt: loaded.joinedAt.toISOString(),
      user: {
        id: loaded.user.id,
        username: loaded.user.username,
        avatarUrl: loaded.user.avatarUrl ?? null,
      },
    };
  }

  async removeMember(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const conversation =
      await this.conversationsRepository.findById(conversationId);
    if (!conversation)
      throw new NotFoundException("Conversation not found");
    if (!conversation.isGroup)
      throw new BadRequestException(
        "Cannot remove members from a 1-on-1 conversation",
      );

    const member =
      await this.memberRepository.findByConversationAndUser(
        conversationId,
        userId,
      );
    if (!member) throw new NotFoundException("Member not found");

    await this.memberRepository.remove(member);
  }

  private toConversationDto(
    conversation: Conversation,
    lastMessageRaw: any,
  ): ConversationDto {
    return {
      id: conversation.id,
      isGroup: conversation.isGroup,
      groupName: conversation.groupName ?? null,
      createdAt: conversation.createdAt.toISOString(),
      lastMessage: lastMessageRaw
        ? {
            content: lastMessageRaw.content ?? null,
            createdAt: lastMessageRaw.createdAt,
            senderId: lastMessageRaw.senderId,
          }
        : null,
      members: conversation.members.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        user: {
          id: m.user.id,
          username: m.user.username,
          avatarUrl: m.user.avatarUrl ?? null,
        },
      })),
      unreadCount: 0,
    };
  }

  toCreateConversationDto(
    conversation: Conversation,
  ): import("@repo/shared").CreateConversationResponseDto {
    return {
      id: conversation.id,
      isGroup: conversation.isGroup,
      groupName: conversation.groupName ?? null,
      createdAt: conversation.createdAt.toISOString(),
      members: conversation.members.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        userId: m.userId,
        role: m.role,
        joinedAt: m.joinedAt.toISOString(),
        user: {
          id: m.user.id,
          username: m.user.username,
          avatarUrl: m.user.avatarUrl ?? null,
        },
      })),
    };
  }
}
