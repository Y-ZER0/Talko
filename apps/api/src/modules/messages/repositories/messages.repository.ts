import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "../entities/message.entity";

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  async save(message: Partial<Message>): Promise<Message> {
    return this.repo.save(message);
  }

  async findById(id: string): Promise<Message | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByConversationPaginated(
    conversationId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    const take = limit + 1;

    const queryBuilder = this.repo
      .createQueryBuilder("m")
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

  async findByClientId(
    conversationId: string,
    senderId: string,
    clientId: string,
  ): Promise<Message | null> {
    return this.repo.findOne({
      where: { conversationId, senderId, clientId },
    });
  }
}
