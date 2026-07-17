import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Message } from "./message.entity";

@Entity("message_attachments")
export class MessageAttachment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "message_id" })
  messageId!: string;

  @Column({ name: "media_url" })
  mediaUrl!: string;

  @Column({ name: "media_type" })
  mediaType!: string;

  @Column({ name: "thumbnail_url", nullable: true, type: "varchar" })
  thumbnailUrl!: string | null;

  @Column({ name: "file_size_bytes", nullable: true, type: "int" })
  fileSizeBytes!: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "message_id" })
  message!: Message;
}
