import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1700000000000 implements MigrationInterface {
  name = "CreateUsersTable1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL,
        "email" varchar(255) NOT NULL,
        "firstName" varchar(255) NOT NULL,
        "lastName" varchar(255) NOT NULL,
        "phone" varchar(20),
        "passwordHash" text NOT NULL,
        "profilePictureUrl" varchar(255),
        "userType" varchar(20) NOT NULL DEFAULT 'eventee',
        "verified" boolean NOT NULL DEFAULT false,
        "verificationToken" varchar(255),
        "verificationTokenExpiresAt" timestamp,
        "refreshToken" varchar(255),
        "refreshTokenExpiresAt" timestamp,
        "lastLoginAt" timestamp,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_users_userType" ON "users" ("userType")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS \"IDX_users_userType\"`);
    await queryRunner.query(`DROP TABLE IF EXISTS \"users\"`);
  }
}
