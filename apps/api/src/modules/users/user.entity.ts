import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "clerk_id", unique: true })
  clerkId!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ name: "avatar_url", nullable: true, type: "varchar" })
  avatarUrl!: string | null;

  @Column({ name: "read_receipts_enabled", default: true })
  readReceiptsEnabled!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
