import { randomUUID } from 'crypto';

import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import type { DataSource } from 'typeorm';

import {
  AgentConnectionEntity,
  AgentEntity,
  AgentInstructionEntity,
  MessageEntity,
  ReportEntity,
  SessionEntity,
  SourceEntity,
  UserEntity,
} from 'src/infrastructure/database/schema';
import { env } from 'src/shared/config/env';

export const PASSWORD = 'senha-forte-123';

let counter = 0;
const next = (): number => (counter += 1);

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
    status: 'active',
    origin: 'app',
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

export function tokenFor(user: UserEntity): string {
  return sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: '1h' },
  );
}

export const bearer = (user: UserEntity): string => `Bearer ${tokenFor(user)}`;
