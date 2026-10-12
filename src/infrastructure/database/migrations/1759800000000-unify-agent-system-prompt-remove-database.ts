import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyAgentSystemPromptRemoveDatabase1759800000000 implements MigrationInterface {
  name = 'UnifyAgentSystemPromptRemoveDatabase1759800000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "system_prompt" text NOT NULL DEFAULT ''`,
    );

    const hasInstructionsTable = await queryRunner.hasTable(
      'agents_instructions',
    );
    if (hasInstructionsTable) {
      await queryRunner.query(`
        UPDATE "agents" a
        SET "system_prompt" = COALESCE(
          CASE 
            WHEN ai.instructions->>'context' IS NOT NULL AND ai.instructions->>'objetivo' IS NOT NULL 
            THEN CONCAT('## Objetivo', E'\\n', ai.instructions->>'objetivo', E'\\n\\n## Contexto\\n', ai.instructions->>'context')
            ELSE COALESCE(ai.instructions->>'context', ai.instructions->>'objetivo', '')
          END,
          ''
        )
        FROM (
          SELECT DISTINCT ON (agent_id) agent_id, instructions
          FROM "agents_instructions"
          WHERE deleted_at IS NULL
          ORDER BY agent_id, created_at DESC
        ) ai
        WHERE ai.agent_id = a.id
      `);

      await queryRunner.query(
        `DROP TABLE IF EXISTS "agents_instructions" CASCADE`,
      );
    }

    await queryRunner.query(`
      ALTER TABLE "agents"
        DROP COLUMN IF EXISTS "database_tool",
        DROP COLUMN IF EXISTS "database_url",
        DROP COLUMN IF EXISTS "database_tables",
        DROP COLUMN IF EXISTS "database_sample_rows"
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "agents"
        ADD COLUMN IF NOT EXISTS "database_tool" boolean NULL DEFAULT true,
        ADD COLUMN IF NOT EXISTS "database_url" text NULL,
        ADD COLUMN IF NOT EXISTS "database_tables" text[] NULL,
        ADD COLUMN IF NOT EXISTS "database_sample_rows" integer NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "agents_instructions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "agent_id" uuid NOT NULL,
        "instructions" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_agents_instructions" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `ALTER TABLE "agents" DROP COLUMN IF EXISTS "system_prompt"`,
    );
  }
}
