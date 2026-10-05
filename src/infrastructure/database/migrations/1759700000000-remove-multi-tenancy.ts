import type { MigrationInterface, QueryRunner } from 'typeorm';

const ORGANIZATION_COLUMNS: readonly string[] = [
  'agents',
  'agent_connections',
  'reports',
  'sessions',
  'sources',
  'users',
];

const DROPPED_TABLES: readonly string[] = [
  'api_keys',
  'organization_features',
  'features',
  'credit_transactions',
  'credit_balances',
  'payments',
  'subscriptions',
  'token_usage',
  'sms_verifications',
  'organizations',
  'plans',
];

const DROPPED_ENUMS: readonly string[] = [
  'users_org_role_enum',
  'organizations_status_enum',
  'organizations_chat_embed_button_position_enum',
  'plans_type_enum',
  'plans_billing_period_enum',
  'subscriptions_status_enum',
  'payments_status_enum',
  'payments_payment_method_enum',
  'credit_transactions_type_enum',
  'credit_transactions_status_enum',
];

const CHECKPOINT_TABLES: readonly string[] = [
  'checkpoints',
  'checkpoint_blobs',
  'checkpoint_writes',
];

const ORGANIZATION_THREAD_PREFIX =
  '^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|null|undefined)_';

export class RemoveMultiTenancy1759700000000 implements MigrationInterface {
  name = 'RemoveMultiTenancy1759700000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "database_url" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "database_tables" text[] NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "agents" ADD COLUMN IF NOT EXISTS "database_sample_rows" integer NULL`,
    );

    await this.copyDatabaseConnectionToAgents(queryRunner);
    await this.stripOrganizationFromThreadIds(queryRunner);

    for (const table of ORGANIZATION_COLUMNS) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "organization_id"`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "org_role"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "invite_token_hash"`,
    );

    for (const table of DROPPED_TABLES) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }

    for (const type of DROPPED_ENUMS) {
      await queryRunner.query(`DROP TYPE IF EXISTS "${type}"`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ORGANIZATION_COLUMNS) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "organization_id" uuid NULL`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "invite_token_hash" text NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "agents" DROP COLUMN IF EXISTS "database_sample_rows"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agents" DROP COLUMN IF EXISTS "database_tables"`,
    );
    await queryRunner.query(
      `ALTER TABLE "agents" DROP COLUMN IF EXISTS "database_url"`,
    );
  }

  private async copyDatabaseConnectionToAgents(
    queryRunner: QueryRunner,
  ): Promise<void> {
    const prerequisites = await Promise.all([
      queryRunner.hasColumn('agents', 'organization_id'),
      queryRunner.hasColumn('organizations', 'database_url'),
      queryRunner.hasTable('organization_features'),
      queryRunner.hasTable('features'),
    ]);

    if (prerequisites.includes(false)) {
      return;
    }

    await queryRunner.query(`
      UPDATE "agents" a
      SET
        "database_url" = o."database_url",
        "database_tables" = CASE
          WHEN jsonb_typeof(ofe."config" -> 'tables') = 'array'
            THEN ARRAY(SELECT jsonb_array_elements_text(ofe."config" -> 'tables'))
        END,
        "database_sample_rows" = CASE
          WHEN jsonb_typeof(ofe."config" -> 'sampleRows') = 'number'
            THEN (ofe."config" ->> 'sampleRows')::integer
        END
      FROM "organizations" o
      JOIN "organization_features" ofe
        ON ofe."organization_id" = o."id"
       AND ofe."enabled" = true
       AND ofe."deleted_at" IS NULL
      JOIN "features" f
        ON f."id" = ofe."feature_id"
       AND f."key" = 'database_connection'
       AND f."deleted_at" IS NULL
      WHERE a."organization_id" = o."id"
        AND a."database_tool" = true
        AND a."database_url" IS NULL
        AND o."database_url" IS NOT NULL
    `);
  }

  private async stripOrganizationFromThreadIds(
    queryRunner: QueryRunner,
  ): Promise<void> {
    for (const table of CHECKPOINT_TABLES) {
      if (!(await queryRunner.hasTable(table))) {
        continue;
      }

      await queryRunner.query(
        `UPDATE "${table}" SET "thread_id" = regexp_replace("thread_id", $1, '') WHERE "thread_id" ~ $1`,
        [ORGANIZATION_THREAD_PREFIX],
      );
    }
  }
}
