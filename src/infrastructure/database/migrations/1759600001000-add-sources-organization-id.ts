import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourcesOrganizationId1759600001000 implements MigrationInterface {
  name = 'AddSourcesOrganizationId1759600001000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sources" ADD COLUMN IF NOT EXISTS "organization_id" uuid NULL`,
    );
    await queryRunner.query(
      `UPDATE "sources" s SET "organization_id" = a."organization_id" FROM "agents" a WHERE a."id" = s."agent_id" AND s."organization_id" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "sources_organization_id_idx" ON "sources" ("organization_id")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "sources_organization_id_idx"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" DROP COLUMN IF EXISTS "organization_id"`,
    );
  }
}
