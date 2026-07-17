import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageAttachments1700000000004 implements MigrationInterface {
  name = "AddMessageAttachments1700000000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "message_attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "message_id" uuid NOT NULL,
        "media_url" varchar NOT NULL,
        "media_type" varchar NOT NULL,
        "thumbnail_url" varchar NULL,
        "file_size_bytes" int NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_message_attachments_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "message_attachments"
        ADD CONSTRAINT "FK_message_attachments_message"
        FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_message_attachments_message"
        ON "message_attachments" ("message_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "message_attachments"`);
  }
}
