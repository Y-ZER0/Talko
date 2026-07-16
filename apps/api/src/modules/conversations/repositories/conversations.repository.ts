import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "../entities/conversation.entity";

@Injectable()
export class ConversationsRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly repo: Repository<Conversation>,
  ) {}

  async save(conversation: Partial<Conversation>): Promise<Conversation> {
    return this.repo.save(conversation);
  }

  async findById(id: string): Promise<Conversation | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByIdWithMembers(id: string): Promise<Conversation | null> {
    return this.repo.findOne({
      where: { id },
      relations: { members: { user: true } },
    });
  }

  async findExistingOneOnOne(
    userIdA: string,
    userIdB: string,
  ): Promise<Conversation | null> {
    return this.repo
      .createQueryBuilder("c")
      .innerJoin("c.members", "cm")
      .where("c.isGroup = :isGroup", { isGroup: false })
      .andWhere("cm.userId IN (:...userIds)", {
        userIds: [userIdA, userIdB],
      })
      .groupBy("c.id")
      .having("COUNT(DISTINCT cm.userId) = 2")
      .getOne();
  }

  async findMyConversations(userId: string): Promise<Conversation[]> {
    return this.repo
      .createQueryBuilder("c")
      .innerJoin("c.members", "cm", "cm.userId = :userId", { userId })
      .leftJoinAndSelect("c.members", "allMembers")
      .leftJoinAndSelect("allMembers.user", "user")
      .orderBy("c.createdAt", "DESC")
      .getMany();
  }

  async getLastMessages(conversationIds: string[]): Promise<any[]> {
    if (conversationIds.length === 0) return [];
    return this.repo.manager.query(
      `SELECT DISTINCT ON (m.conversation_id)
        m.conversation_id AS "conversationId",
        m.content AS "content",
        m.created_at AS "createdAt",
        m.sender_id AS "senderId"
       FROM messages m
       WHERE m.conversation_id = ANY($1::uuid[])
       ORDER BY m.conversation_id ASC, m.created_at DESC`,
      [conversationIds],
    );
  }
}
