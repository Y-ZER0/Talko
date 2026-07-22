import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Message } from "./message.entity";

@Entity("message_reactions")
@Unique(["messageId", "userId"])
export class MessageReaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "message_id" })
  messageId!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column()
  emoji!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => Message)
  @JoinColumn({ name: "message_id" })
  message!: Message;
}
