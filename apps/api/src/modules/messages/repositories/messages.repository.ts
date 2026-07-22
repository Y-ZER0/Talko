import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Message } from "../entities/message.entity";
import { MessageAttachment } from "../entities/message-attachment.entity";
import { MessageReceipt } from "../entities/message-receipt.entity";
import { MessageReaction } from "../entities/message-reaction.entity";

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepo: Repository<MessageAttachment>,
    @InjectRepository(MessageReceipt)
    private readonly receiptRepo: Repository<MessageReceipt>,
    @InjectRepository(MessageReaction)
    private readonly reactionRepo: Repository<MessageReaction>,
  ) {}

  async upsertReceipts(
    messageIds: string[],
    userId: string,
  ): Promise<MessageReceipt[]> {
    const receipts = messageIds.map((messageId) => ({
      messageId,
      userId,
      status: "read",
      readAt: new Date(),
    }));

    await this.receiptRepo.upsert(receipts, ["messageId", "userId"]);

    return this.receiptRepo.find({
      where: { messageId: In(messageIds), userId },
    });
  }

  async save(message: Partial<Message>): Promise<Message> {
    return this.repo.save(message);
  }

  async saveWithAttachments(data: {
    conversationId: string;
    senderId: string;
    content: string | null;
    parentId: string | null;
    clientId: string;
    attachments?: { mediaUrl: string; mediaType: string; fileSizeBytes?: number | null }[];
  }): Promise<Message> {
    const { attachments, ...messageData } = data;
    const message = this.repo.create(messageData);
    const saved = await this.repo.save(message);

    if (attachments && attachments.length > 0) {
      const attachmentEntities = attachments.map((a) =>
        this.attachmentRepo.create({ ...a, messageId: saved.id }),
      );
      saved.attachments = await this.attachmentRepo.save(attachmentEntities);
    } else {
      saved.attachments = [];
    }

    return saved;
  }

  async findById(id: string): Promise<Message | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["attachments", "reactions"],
    });
  }

  async findByConversationPaginated(
    conversationId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    const take = limit + 1;

    const queryBuilder = this.repo
      .createQueryBuilder("m")
      .leftJoinAndSelect("m.attachments", "a")
      .leftJoinAndSelect("m.reactions", "r")
      .where("m.conversation_id = :conversationId", { conversationId })
      .orderBy("m.createdAt", "DESC")
      .take(take);

    if (cursor) {
      queryBuilder.andWhere("m.created_at < :cursor", {
        cursor: new Date(cursor),
      });
    }

    const messages = await queryBuilder.getMany();
    const hasMore = messages.length > limit;
    if (hasMore) messages.pop();

    return { messages, hasMore };
  }

  async findMessageSenders(
    messageIds: string[],
  ): Promise<{ messageId: string; senderId: string }[]> {
    const messages = await this.repo.find({
      where: { id: In(messageIds) },
      select: ["id", "senderId"],
    });
    return messages.map((m) => ({ messageId: m.id, senderId: m.senderId }));
  }

  async findByClientId(
    conversationId: string,
    senderId: string,
    clientId: string,
  ): Promise<Message | null> {
    return this.repo.findOne({
      where: { conversationId, senderId, clientId },
    });
  }

  async findMaxCreatedAt(messageIds: string[]): Promise<Date | null> {
    if (messageIds.length === 0) return null;
    const result = await this.repo
      .createQueryBuilder("m")
      .select("MAX(m.createdAt)", "maxCreatedAt")
      .where("m.id IN (:...messageIds)", { messageIds })
      .getRawOne();
    return result?.maxCreatedAt ?? null;
  }

  async updateMessage(id: string, partial: Partial<Message>): Promise<void> {
    await this.repo.update(id, partial);
  }

  async upsertReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<{ reaction: MessageReaction; replacedEmoji: string | null }> {
    const existing = await this.reactionRepo.findOne({
      where: { messageId, userId },
    });
    if (existing) {
      if (existing.emoji === emoji) {
        return { reaction: existing, replacedEmoji: null };
      }
      const replacedEmoji = existing.emoji;
      existing.emoji = emoji;
      const saved = await this.reactionRepo.save(existing);
      return { reaction: saved, replacedEmoji };
    }
    const created = await this.reactionRepo.save(
      this.reactionRepo.create({ messageId, userId, emoji }),
    );
    return { reaction: created, replacedEmoji: null };
  }

  async deleteReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<void> {
    await this.reactionRepo.delete({ messageId, userId, emoji });
  }

  async findReactionByUserAndMessage(
    messageId: string,
    userId: string,
  ): Promise<MessageReaction | null> {
    return this.reactionRepo.findOne({ where: { messageId, userId } });
  }

  async findReactionsByMessage(messageId: string): Promise<MessageReaction[]> {
    return this.reactionRepo.find({ where: { messageId } });
  }

  async findReceiptsForMessages(
    messageIds: string[],
    viewerId: string,
  ): Promise<Map<string, { userId: string; status: string; readAt: Date | null }[]>> {
    if (messageIds.length === 0) return new Map();
    const receipts = await this.receiptRepo.find({
      where: { messageId: In(messageIds) },
      order: { readAt: "DESC" },
    });
    const map = new Map<string, { userId: string; status: string; readAt: Date | null }[]>();
    for (const r of receipts) {
      if (r.userId === viewerId) continue;
      const existing = map.get(r.messageId);
      if (existing) {
        existing.push({ userId: r.userId, status: r.status, readAt: r.readAt });
      } else {
        map.set(r.messageId, [{ userId: r.userId, status: r.status, readAt: r.readAt }]);
      }
    }
    return map;
  }

  async findParentMessages(
    parentIds: string[],
  ): Promise<Map<string, { id: string; senderId: string; senderName: string; content: string | null }>> {
    if (parentIds.length === 0) return new Map();
    const results = await this.repo
      .createQueryBuilder("m")
      .select("m.id", "id")
      .addSelect("m.senderId", "senderId")
      .addSelect("m.content", "content")
      .addSelect("u.username", "senderName")
      .innerJoin("users", "u", "u.id = m.senderId")
      .where("m.id IN (:...parentIds)", { parentIds: [...new Set(parentIds)] })
      .getRawMany();
    const map = new Map();
    for (const r of results) {
      map.set(r.id, {
        id: r.id,
        senderId: r.senderId,
        senderName: r.senderName,
        content: r.content ?? null,
      });
    }
    return map;
  }
}
