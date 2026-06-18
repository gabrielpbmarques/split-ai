/**
 * Idempotent seed for the MAIA playground organization plus the baseline plans.
 *
 *   bun run seed:maia
 *
 * Run it through the `seed:maia` npm script (ts-node + CommonJS), NOT directly
 * via `bun run scripts/seed-maia.ts`: TypeORM entities use `emitDecoratorMetadata`
 * with circular relations, which throws a TDZ error under bun's native ESM
 * loader. The app itself runs as CommonJS (nest build), so ts-node matches it.
 *
 * Creates/updates:
 *   - a FREE plan (limited agents + initial credits)
 *   - an unlimited plan (no quotas, no credit billing)
 *   - the MAIA organization on the unlimited plan
 *   - the owner user (ia@torors.com.br)
 *
 * Schema is reflected from the entities (synchronize: true), matching the app.
 */
import * as bcrypt from 'bcryptjs';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { config } from '../src/config';
import { OrganizationEntity, PlanEntity, UserEntity } from '../src/entities';
import { BillingPeriod, PlanType } from '../src/entities/plan.entity';

const MAIA_OWNER_EMAIL = 'support@nexguard.app';
const MAIA_OWNER_PASSWORD = process.env.MAIA_OWNER_PASSWORD ?? 'changeme-maia';

async function upsertPlan(
  ds: DataSource,
  data: Partial<PlanEntity> & { type: PlanType },
): Promise<PlanEntity> {
  const repo = ds.getRepository(PlanEntity);
  const existing = await repo.findOne({ where: { type: data.type } });
  const merged = repo.merge(existing ?? repo.create(), data);
  return repo.save(merged);
}

async function main(): Promise<void> {
  const dataSource = new DataSource({
    type: 'postgres',
    url: config.databaseUrl,
    entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  await dataSource.initialize();

  try {
    const freePlan = await upsertPlan(dataSource, {
      type: PlanType.FREE,
      name: 'Free',
      description: 'Plano gratuito com limites reduzidos',
      credits: 100,
      price: 0,
      price_per_credit: 0,
      billing_period: BillingPeriod.MONTHLY,
      active: true,
      max_agents: 2,
      max_users: 2,
      unlimited: false,
      monthly_credits: 100,
    });

    const unlimitedPlan = await upsertPlan(dataSource, {
      type: PlanType.ENTERPRISE,
      name: 'Unlimited (MAIA)',
      description: 'Plano ilimitado para playground interno',
      credits: 0,
      price: 0,
      price_per_credit: 0,
      billing_period: BillingPeriod.ONCE,
      active: true,
      max_agents: null,
      max_users: null,
      unlimited: true,
      monthly_credits: null,
    });

    const orgRepo = dataSource.getRepository(OrganizationEntity);
    let maia = await orgRepo.findOne({ where: { name: 'MAIA' } });
    if (!maia) {
      maia = orgRepo.create({
        name: 'MAIA',
        acronym: 'MAIA',
        email_domain: 'torors.com.br',
        status: 'active',
        contact_name: 'MAIA',
        contact_email: MAIA_OWNER_EMAIL,
      });
    }
    maia.plan = unlimitedPlan;
    maia = await orgRepo.save(maia);

    const userRepo = dataSource.getRepository(UserEntity);
    let owner = await userRepo.findOne({ where: { email: MAIA_OWNER_EMAIL } });
    if (!owner) {
      owner = userRepo.create({
        name: 'MAIA Owner',
        email: MAIA_OWNER_EMAIL,
        password_hash: await bcrypt.hash(MAIA_OWNER_PASSWORD, 10),
        role: 'admin',
        org_role: 'owner',
        status: 'active',
        organization_id: maia.id,
      });
      owner = await userRepo.save(owner);
    } else if (owner.organization_id !== maia.id) {
      owner.organization_id = maia.id;
      owner.org_role = 'owner';
      owner = await userRepo.save(owner);
    }

    console.log('Seed concluído:');
    console.log(`  Free plan:      ${freePlan.id}`);
    console.log(`  Unlimited plan: ${unlimitedPlan.id}`);
    console.log(`  MAIA org:       ${maia.id}`);
    console.log(`  Owner user:     ${owner.id} (${owner.email})`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error) => {
  console.error('Seed falhou:', error);
  process.exit(1);
});
