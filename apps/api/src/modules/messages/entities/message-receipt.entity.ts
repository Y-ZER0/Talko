import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from "typeorm";

@Entity("message_receipts")
@Unique(["messageId", "userId"])
export class MessageReceipt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "message_id" })
  messageId!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ default: "delivered" })
  status!: string;

  @Column({ name: "read_at", nullable: true, type: "timestamp" })
  readAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
