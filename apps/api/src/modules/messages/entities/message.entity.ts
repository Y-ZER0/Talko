import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { MessageAttachment } from "./message-attachment.entity";
import { MessageReaction } from "./message-reaction.entity";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "conversation_id" })
  conversationId!: string;

  @Column({ name: "sender_id" })
  senderId!: string;

  @Column({ name: "parent_id", nullable: true, type: "uuid" })
  parentId!: string | null;

  @Column({ nullable: true, type: "text" })
  content!: string | null;

  @Column({ name: "is_deleted", default: false })
  isDeleted!: boolean;

  @Column({ name: "client_id" })
  clientId!: string;

  @Column({ name: "edited_at", nullable: true, type: "timestamp" })
  editedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message, {
    cascade: true,
  })
  attachments!: MessageAttachment[];

  @OneToMany(() => MessageReaction, (reaction) => reaction.message)
  reactions!: MessageReaction[];
}
