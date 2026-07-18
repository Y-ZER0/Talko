import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "../messages/entities/message.entity";
import { User } from "../users/user.entity";
import { ConversationMember } from "../conversations/entities/conversation-member.entity";
import type { SearchResultDto } from "@repo/shared";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ConversationMember)
    private readonly memberRepo: Repository<ConversationMember>,
  ) {}

  async search(query: string, userId: string): Promise<SearchResultDto[]> {
    const sanitized = query.replace(/[^\w\s]/g, "").trim();
    if (!sanitized) return [];

    const tsQuery = sanitized
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word}:*`)
      .join(" & ");

    if (!tsQuery) return [];

    const results = await this.messageRepo
      .createQueryBuilder("m")
      .select("m.id", "messageId")
      .addSelect("m.content", "messageContent")
      .addSelect("m.created_at", "messageTimestamp")
      .addSelect("u.username", "senderName")
      .addSelect("m.conversation_id", "conversationId")
      .innerJoin(User, "u", "u.id = m.sender_id")
      .innerJoin(
        ConversationMember,
        "cm",
        "cm.conversation_id = m.conversation_id AND cm.user_id = :userId",
        { userId },
      )
      .where("m.search_vector @@ to_tsquery('english', :tsQuery)", { tsQuery })
      .andWhere("m.is_deleted = false")
      .orderBy("ts_rank(m.search_vector, to_tsquery('english', :tsQuery))", "DESC")
      .limit(20)
      .getRawMany<{
        messageId: string;
        messageContent: string | null;
        messageTimestamp: string;
        senderName: string;
        conversationId: string;
      }>();

    return results.map((r) => ({
      messageId: r.messageId,
      messageContent: r.messageContent ?? "",
      messageTimestamp: r.messageTimestamp,
      senderName: r.senderName,
      conversationId: r.conversationId,
    }));
  }
}
