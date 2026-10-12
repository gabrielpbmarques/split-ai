import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyAgentTools1760000000000 implements MigrationInterface {
  name = 'UnifyAgentTools1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "tools" text[] NOT NULL DEFAULT '{}'`,
    );

    const hasVectorSearchTool = await queryRunner.hasColumn(
      'agents',
      'vector_search_tool',
    );
    if (hasVectorSearchTool) {
      await queryRunner.query(`
        UPDATE "agents"
        SET "tools" = CASE
          WHEN "vector_search_tool" IS TRUE THEN ARRAY['vector_search']::text[]
          ELSE ARRAY[]::text[]
        END
      `);

      await queryRunner.query(`
        ALTER TABLE "agents" DROP COLUMN IF EXISTS "vector_search_tool"
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "agents"
        ADD COLUMN IF NOT EXISTS "vector_search_tool" boolean NULL DEFAULT true
    `);

    await queryRunner.query(`
      UPDATE "agents"
      SET "vector_search_tool" = ('vector_search' = ANY("tools"))
    `);

    await queryRunner.query(
      `ALTER TABLE "agents" DROP COLUMN IF EXISTS "tools"`,
    );
  }
}
