import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReadReceiptsEnabled1700000000002 implements MigrationInterface {
  name = "AddReadReceiptsEnabled1700000000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "read_receipts_enabled" boolean NOT NULL DEFAULT true
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "read_receipts_enabled"
    `);
  }
}
