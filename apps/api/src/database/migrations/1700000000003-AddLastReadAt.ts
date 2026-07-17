import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastReadAt1700000000003 implements MigrationInterface {
  name = "AddLastReadAt1700000000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "conversation_members"
        ADD COLUMN "last_read_at" TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "conversation_members" DROP COLUMN "last_read_at"
    `);
  }
}
