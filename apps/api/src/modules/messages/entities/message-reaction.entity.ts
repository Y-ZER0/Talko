import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from "typeorm";

@Entity("message_reactions")
@Unique(["messageId", "userId", "emoji"])
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
}
