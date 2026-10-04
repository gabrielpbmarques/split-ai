import { randomUUID } from 'crypto';

import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import type { DataSource } from 'typeorm';

import {
  AgentConnectionEntity,
  AgentEntity,
  AgentInstructionEntity,
  ApiKeyEntity,
  CreditBalanceEntity,
  MessageEntity,
  OrganizationEntity,
  PlanEntity,
  ReportEntity,
  SessionEntity,
  SourceEntity,
  UserEntity,
} from 'src/infrastructure/database/schema';
import {
  BillingPeriod,
  PlanType,
} from 'src/infrastructure/database/schema/plan.entity';
import { env } from 'src/shared/config/env';
import { generateApiKey } from 'src/shared/utils/api-key';

export const PASSWORD = 'senha-forte-123';

let counter = 0;
const next = (): number => (counter += 1);

const PLAN_TYPES = Object.values(PlanType);

export async function createPlan(
  dataSource: DataSource,
  overrides: Partial<PlanEntity> = {},
): Promise<PlanEntity> {
  const n = next();
  const repository = dataSource.getRepository(PlanEntity);
  const used = new Set(
    (await repository.find({ select: { type: true } })).map(
      (plan) => plan.type,
    ),
  );
  const type =
    PLAN_TYPES.find((candidate) => !used.has(candidate)) ??
    PLAN_TYPES[n % PLAN_TYPES.length];

  return repository.save({
    type,
    name: `Plano ${n}`,
    description: 'Plano de teste',
    credits: 1000,
    price: 99,
    price_per_credit: 0.099,
    billing_period: BillingPeriod.MONTHLY,
    stripe_price_id: `price_${n}`,
    active: true,
    max_agents: null,
    max_users: null,
    unlimited: false,
    monthly_credits: 1000,
    min_conversations: 0,
    max_conversations: 1000,
    ...overrides,
  });
}

export async function createOrganization(
  dataSource: DataSource,
  overrides: Partial<OrganizationEntity> = {},
): Promise<OrganizationEntity> {
  const n = next();
  const plan = overrides.plan ?? (await createPlan(dataSource));

  return dataSource.getRepository(OrganizationEntity).save({
    name: `Organização ${n}`,
    acronym: `ORG${n}`,
    email_domain: `org${n}.test`,
    status: 'active',
    contact_name: `Contato ${n}`,
    contact_email: `contato${n}@org${n}.test`,
    created_by: randomUUID(),
    chat_embed_enabled: false,
    chat_embed_welcome_enabled: false,
    ...overrides,
    plan,
  });
}

export interface CreateUserOptions extends Partial<UserEntity> {
  password?: string;
}

export async function createUser(
  dataSource: DataSource,
  { password = PASSWORD, ...overrides }: CreateUserOptions = {},
): Promise<UserEntity> {
  const n = next();

  return dataSource.getRepository(UserEntity).save({
    name: `Usuário ${n}`,
    email: `user${n}@example.test`,
    phone: `55119${String(n).padStart(8, '0')}`,
    password_hash: await bcrypt.hash(password, 4),
    role: 'user',
    org_role: 'member',
    status: 'active',
    origin: 'app',
    organization_id: null,
    ...overrides,
  });
}

export async function createAgent(
  dataSource: DataSource,
  overrides: Partial<AgentEntity> = {},
  instructions: Record<string, unknown> = {
    context: 'Você é um assistente de testes.',
    objetivo: 'Responder perguntas de teste.',
    diretrizes: ['Seja breve.'],
  },
): Promise<AgentEntity> {
  const n = next();
  const agent = await dataSource.getRepository(AgentEntity).save({
    name: `Agente ${n}`,
    agent_identifier: `agent-${n}-${randomUUID().slice(0, 8)}`,
    model: 'mock-model',
    temperature: 0.2,
    with_history: false,
    vector_search_tool: false,
    database_tool: false,
    ...overrides,
  });

  await dataSource.getRepository(AgentInstructionEntity).save({
    agent_id: agent.id,
    instructions,
  });

  return agent;
}

export async function createAgentConnection(
  dataSource: DataSource,
  overrides: Partial<AgentConnectionEntity>,
): Promise<AgentConnectionEntity> {
  return dataSource.getRepository(AgentConnectionEntity).save({
    tool_name: `tool_${next()}`,
    tool_description: 'Delegue para este agente.',
    enabled: true,
    position: 0,
    ...overrides,
  });
}

export async function createSource(
  dataSource: DataSource,
  overrides: Partial<SourceEntity>,
): Promise<SourceEntity> {
  return dataSource.getRepository(SourceEntity).save({
    name: `Fonte ${next()}`,
    source_type: 'site',
    status: 'completed',
    chunk_count: 1,
    ...overrides,
  });
}

export async function createSession(
  dataSource: DataSource,
  overrides: Partial<SessionEntity>,
): Promise<SessionEntity> {
  return dataSource.getRepository(SessionEntity).save({
    expires_at: new Date(Date.now() + 86_400_000),
    expired: false,
    ...overrides,
  });
}

export async function createMessage(
  dataSource: DataSource,
  overrides: Partial<MessageEntity>,
): Promise<MessageEntity> {
  return dataSource.getRepository(MessageEntity).save({
    message: `mensagem ${next()}`,
    from: 'user',
    ...overrides,
  });
}

export async function createReport(
  dataSource: DataSource,
  overrides: Partial<ReportEntity>,
): Promise<ReportEntity> {
  return dataSource.getRepository(ReportEntity).save({
    type: 'faq',
    sentiment: 'positive',
    phone: '5511999999999',
    name: 'Cliente',
    email: 'cliente@example.test',
    summary: 'Resumo',
    insights: 'Insights',
    return: 'Retorno',
    ...overrides,
  });
}

export async function createCreditBalance(
  dataSource: DataSource,
  overrides: Partial<CreditBalanceEntity>,
): Promise<CreditBalanceEntity> {
  return dataSource.getRepository(CreditBalanceEntity).save({
    total_credits: 100,
    used_credits: 0,
    available_credits: 100,
    reserved_credits: 0,
    ...overrides,
  });
}

export async function createApiKey(
  dataSource: DataSource,
  overrides: Partial<ApiKeyEntity>,
): Promise<{ apiKey: ApiKeyEntity; secret: string }> {
  const { secret, prefix, hash } = generateApiKey();
  const apiKey = await dataSource.getRepository(ApiKeyEntity).save({
    name: `Chave ${next()}`,
    key_prefix: prefix,
    key_hash: hash,
    scopes: null,
    ...overrides,
  });

  return { apiKey, secret };
}

export function tokenFor(user: UserEntity): string {
  return sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ...(user.role === 'guest'
        ? {}
        : {
            organization_id: user.organization_id ?? undefined,
            org_role: user.org_role,
          }),
    },
    env.JWT_SECRET,
    { expiresIn: '1h' },
  );
}

export const bearer = (user: UserEntity): string => `Bearer ${tokenFor(user)}`;
