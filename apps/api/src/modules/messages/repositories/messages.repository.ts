import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Message } from "../entities/message.entity";
import { MessageAttachment } from "../entities/message-attachment.entity";
import { MessageReceipt } from "../entities/message-receipt.entity";

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepo: Repository<MessageAttachment>,
    @InjectRepository(MessageReceipt)
    private readonly receiptRepo: Repository<MessageReceipt>,
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
      relations: ["attachments"],
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
      .where("m.conversation_id = :conversationId", { conversationId })
      .orderBy("m.created_at", "DESC")
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
}
