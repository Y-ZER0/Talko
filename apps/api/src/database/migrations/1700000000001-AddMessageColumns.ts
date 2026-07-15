import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageColumns1700000000001 implements MigrationInterface {
  name = "AddMessageColumns1700000000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "messages"
        ADD COLUMN "client_id" varchar NOT NULL DEFAULT ''
    `);
    await queryRunner.query(`
      ALTER TABLE "messages"
        ALTER COLUMN "client_id" DROP DEFAULT
    `);
    await queryRunner.query(`
      ALTER TABLE "messages"
        ADD COLUMN "edited_at" timestamp NULL
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_messages_client"
        ON "messages" ("conversation_id", "sender_id", "client_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_messages_client"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "client_id"`);
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "edited_at"`);
  }
}
