import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UnifyAgentResponseFormat1759900000000 implements MigrationInterface {
  name = 'UnifyAgentResponseFormat1759900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "response_format" jsonb NULL`,
    );

    const hasParserSchema = await queryRunner.hasColumn(
      'agents',
      'parser_schema',
    );
    if (hasParserSchema) {
      await queryRunner.query(`
        UPDATE "agents"
        SET "response_format" = jsonb_build_object(
          'title', COALESCE("parser_name", 'dynamic_parser'),
          'description', COALESCE("parser_description", 'Ferramenta de parsing dinâmica'),
          'properties', COALESCE("parser_schema"->'properties', '{}'::jsonb),
          'required', COALESCE("parser_schema"->'required', '[]'::jsonb)
        )
        WHERE "parser_schema" IS NOT NULL OR "parser_name" IS NOT NULL OR "parser_description" IS NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE "agents"
          DROP COLUMN IF EXISTS "parser_schema",
          DROP COLUMN IF EXISTS "parser_name",
          DROP COLUMN IF EXISTS "parser_description"
      `);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "agents"
        ADD COLUMN IF NOT EXISTS "parser_schema" jsonb NULL,
        ADD COLUMN IF NOT EXISTS "parser_name" text NULL,
        ADD COLUMN IF NOT EXISTS "parser_description" text NULL
    `);

    await queryRunner.query(`
      UPDATE "agents"
      SET
        "parser_name" = "response_format"->>'title',
        "parser_description" = "response_format"->>'description',
        "parser_schema" = jsonb_build_object(
          'type', 'object',
          'properties', "response_format"->'properties',
          'required', "response_format"->'required'
        )
      WHERE "response_format" IS NOT NULL
    `);

    await queryRunner.query(
      `ALTER TABLE "agents" DROP COLUMN IF EXISTS "response_format"`,
    );
  }
}
