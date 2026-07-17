import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Conversation } from "./conversation.entity";
import { User } from "../../users/user.entity";

@Entity("conversation_members")
@Unique(["conversationId", "userId"])
export class ConversationMember {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "conversation_id" })
  conversationId!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ name: "last_read_at", nullable: true, type: "timestamp" })
  lastReadAt!: Date | null;

  @Column({ default: "member" })
  role!: string;

  @CreateDateColumn({ name: "joined_at" })
  joinedAt!: Date;

  @ManyToOne(() => Conversation, (conversation) => conversation.members)
  @JoinColumn({ name: "conversation_id" })
  conversation!: Conversation;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
