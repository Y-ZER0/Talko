import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { ConversationMember } from "./conversation-member.entity";

@Entity("conversations")
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "is_group" })
  isGroup!: boolean;

  @Column({ name: "group_name", nullable: true })
  groupName!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => ConversationMember, (member) => member.conversation)
  members!: ConversationMember[];
}
