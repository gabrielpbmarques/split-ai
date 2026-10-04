import { MemorySaver } from '@langchain/langgraph';

import { ResolvedAgent } from 'src/shared/contracts';

export const AGENT_RESOLVER = Symbol('AGENT_RESOLVER');

export interface ConnectionContext {
  readonly depth: number;
  readonly visited: string[];
}

export interface AgentResolver {
  execute(
    agentId: string,
    promptVariables?: Record<string, unknown>,
    memorySaver?: MemorySaver,
    connectionContext?: ConnectionContext,
  ): Promise<ResolvedAgent>;
}
