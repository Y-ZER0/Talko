import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeviceTokens1700000000005 implements MigrationInterface {
  name = "AddDeviceTokens1700000000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "device_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "fcm_token" varchar NOT NULL,
        "platform" varchar NOT NULL,
        "last_active_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_device_tokens_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_device_tokens_fcm_token" UNIQUE ("fcm_token")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "device_tokens"
        ADD CONSTRAINT "FK_device_tokens_user"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_device_tokens_user"
        ON "device_tokens" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "device_tokens"`);
  }
}
