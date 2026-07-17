import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "../../users/user.entity";

@Entity("device_tokens")
@Unique(["fcmToken"])
export class DeviceToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @Column({ name: "fcm_token" })
  fcmToken!: string;

  @Column()
  platform!: string;

  @CreateDateColumn({ name: "last_active_at" })
  lastActiveAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;
}
