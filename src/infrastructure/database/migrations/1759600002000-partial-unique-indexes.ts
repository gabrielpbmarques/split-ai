import type { MigrationInterface, QueryRunner } from 'typeorm';

interface UniqueIndexSpec {
  table: string;
  name: string;
  columns: string[];
}

const INDEXES: UniqueIndexSpec[] = [
  { table: 'users', name: 'users_email_uq', columns: ['email'] },
  { table: 'features', name: 'features_key_uq', columns: ['key'] },
  {
    table: 'payments',
    name: 'payments_stripe_payment_intent_id_uq',
    columns: ['stripe_payment_intent_id'],
  },
  { table: 'user_tokens', name: 'user_tokens_token_uq', columns: ['token'] },
  {
    table: 'subscriptions',
    name: 'subscriptions_stripe_subscription_id_uq',
    columns: ['stripe_subscription_id'],
  },
  { table: 'plans', name: 'plans_type_uq', columns: ['type'] },
  {
    table: 'credit_balances',
    name: 'credit_balances_organization_id_uq',
    columns: ['organization_id'],
  },
  {
    table: 'agent_connections',
    name: 'agent_connections_principal_child_uq',
    columns: ['principal_agent_id', 'child_agent_id'],
  },
  {
    table: 'organization_features',
    name: 'organization_features_org_feature_uq',
    columns: ['organization_id', 'feature_id'],
  },
  { table: 'api_keys', name: 'api_keys_key_hash_uq', columns: ['key_hash'] },
  {
    table: 'organizations',
    name: 'organizations_chat_embed_token_uq',
    columns: ['chat_embed_token'],
  },
];

const quoteList = (columns: string[]): string =>
  columns.map((column) => `"${column}"`).join(', ');

const DROP_PREVIOUS_UNIQUE = `
DO $$
DECLARE
  idx record;
BEGIN
  FOR idx IN
    SELECT i.indexrelid::regclass AS index_name, c.conname
    FROM pg_index i
    JOIN pg_class t ON t.oid = i.indrelid
    LEFT JOIN pg_constraint c ON c.conindid = i.indexrelid
    WHERE t.relname = $1
      AND i.indisunique
      AND NOT i.indisprimary
      AND i.indexrelid::regclass::text <> quote_ident($2)
      AND (
        SELECT array_agg(a.attname::text ORDER BY a.attname)
        FROM unnest(i.indkey::int2[]) WITH ORDINALITY AS k(attnum, ord)
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
      ) = $3
  LOOP
    IF idx.conname IS NOT NULL THEN
      EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', $1, idx.conname);
    ELSE
      EXECUTE format('DROP INDEX %s', idx.index_name);
    END IF;
  END LOOP;
END $$;
`;

export class PartialUniqueIndexes1759600002000 implements MigrationInterface {
  name = 'PartialUniqueIndexes1759600002000';
  transaction = false;

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const spec of INDEXES) {
      await queryRunner.query(
        `CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "${spec.name}" ON "${spec.table}" (${quoteList(spec.columns)}) WHERE "deleted_at" IS NULL`,
      );
      await queryRunner.query(
        DROP_PREVIOUS_UNIQUE.replace(/\$1/g, `'${spec.table}'`)
          .replace(/\$2/g, `'${spec.name}'`)
          .replace(
            /\$3/g,
            `ARRAY[${[...spec.columns]
              .sort()
              .map((column) => `'${column}'`)
              .join(', ')}]::text[]`,
          ),
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const spec of [...INDEXES].reverse()) {
      await queryRunner.query(
        `DROP INDEX CONCURRENTLY IF EXISTS "${spec.name}"`,
      );
      if (
        spec.name !== 'api_keys_key_hash_uq' &&
        spec.name !== 'organizations_chat_embed_token_uq'
      ) {
        await queryRunner.query(
          `ALTER TABLE "${spec.table}" ADD CONSTRAINT "${spec.name}_full" UNIQUE (${quoteList(spec.columns)})`,
        );
      }
    }
  }
}
