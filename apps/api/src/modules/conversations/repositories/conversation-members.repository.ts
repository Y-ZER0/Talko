import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConversationMember } from "../entities/conversation-member.entity";

@Injectable()
export class ConversationMembersRepository {
  constructor(
    @InjectRepository(ConversationMember)
    private readonly repo: Repository<ConversationMember>,
  ) {}

  async save(member: Partial<ConversationMember>): Promise<ConversationMember> {
    return this.repo.save(member);
  }

  async saveMany(members: Partial<ConversationMember>[]): Promise<ConversationMember[]> {
    return this.repo.save(members);
  }

  async findByConversationAndUser(
    conversationId: string,
    userId: string,
  ): Promise<ConversationMember | null> {
    return this.repo.findOne({ where: { conversationId, userId } });
  }

  async findByIdWithUser(id: string): Promise<ConversationMember | null> {
    return this.repo.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  async remove(member: ConversationMember): Promise<void> {
    await this.repo.remove(member);
  }
}
