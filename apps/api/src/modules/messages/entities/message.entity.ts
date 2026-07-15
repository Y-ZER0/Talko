import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "conversation_id" })
  conversationId!: string;

  @Column({ name: "sender_id" })
  senderId!: string;

  @Column({ name: "parent_id", nullable: true })
  parentId!: string | null;

  @Column({ nullable: true, type: "text" })
  content!: string | null;

  @Column({ name: "media_url", nullable: true })
  mediaUrl!: string | null;

  @Column({ name: "media_type", nullable: true })
  mediaType!: string | null;

  @Column({ name: "is_deleted", default: false })
  isDeleted!: boolean;

  @Column({ name: "client_id" })
  clientId!: string;

  @Column({ name: "edited_at", nullable: true })
  editedAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
