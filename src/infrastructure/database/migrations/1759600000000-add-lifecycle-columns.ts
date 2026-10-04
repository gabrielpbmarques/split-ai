import { MigrationInterface, QueryRunner } from 'typeorm';

const TABLES_WITH_DELETED_AT = [
  'agent_connections',
  'agents_instructions',
  'agents',
  'api_keys',
  'credit_balances',
  'features',
  'messages',
  'notifications',
  'organization_features',
  'organizations',
  'payments',
  'plans',
  'reports',
  'sessions',
  'sms_verifications',
  'sources',
  'subscriptions',
  'user_tokens',
  'users',
];

export class AddLifecycleColumns1759600000000 implements MigrationInterface {
  name = 'AddLifecycleColumns1759600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES_WITH_DELETED_AT) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP NULL`,
      );
    }
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP COLUMN IF EXISTS "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN IF EXISTS "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organizations" DROP COLUMN IF EXISTS "created_at"`,
    );
    for (const table of TABLES_WITH_DELETED_AT) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "deleted_at"`,
      );
    }
  }
}
