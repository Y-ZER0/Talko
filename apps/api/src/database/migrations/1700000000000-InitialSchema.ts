import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1700000000000 implements MigrationInterface {
  name = "InitialSchema1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "clerk_id" varchar NOT NULL,
        "username" varchar NOT NULL,
        "avatar_url" varchar NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_clerk_id" UNIQUE ("clerk_id"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "is_group" boolean NOT NULL DEFAULT false,
        "group_name" varchar NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversations_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "conversation_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" varchar NOT NULL DEFAULT 'member',
        "joined_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversation_members_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_conversation_members" UNIQUE ("conversation_id", "user_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "sender_id" uuid NOT NULL,
        "parent_id" uuid NULL,
        "content" text NULL,
        "media_url" varchar NULL,
        "media_type" varchar NULL,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "message_receipts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "message_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "status" varchar NOT NULL DEFAULT 'delivered',
        "read_at" timestamp NULL,
        CONSTRAINT "PK_message_receipts_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_message_receipts" UNIQUE ("message_id", "user_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "message_reactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "message_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "emoji" varchar NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_message_reactions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_message_reactions" UNIQUE ("message_id", "user_id", "emoji")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "conversation_members"
        ADD CONSTRAINT "FK_conversation_members_conversation"
        FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "conversation_members"
        ADD CONSTRAINT "FK_conversation_members_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "messages"
        ADD CONSTRAINT "FK_messages_conversation"
        FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "messages"
        ADD CONSTRAINT "FK_messages_sender"
        FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "messages"
        ADD CONSTRAINT "FK_messages_parent"
        FOREIGN KEY ("parent_id") REFERENCES "messages"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "message_receipts"
        ADD CONSTRAINT "FK_message_receipts_message"
        FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "message_receipts"
        ADD CONSTRAINT "FK_message_receipts_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "message_reactions"
        ADD CONSTRAINT "FK_message_reactions_message"
        FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "message_reactions"
        ADD CONSTRAINT "FK_message_reactions_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "message_reactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "message_receipts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversation_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
