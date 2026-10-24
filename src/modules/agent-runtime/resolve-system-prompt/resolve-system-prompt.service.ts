import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';

@Injectable()
export class ResolveSystemPromptService {
  async execute(agent: AgentEntity): Promise<string | undefined> {
    if (!agent.agent_identifier) {
      return agent.system_prompt;
    }

    try {
      return readFileSync(
        join(process.cwd(), 'memories', agent.agent_identifier, 'AGENT.md'),
        'utf-8',
      );
    } catch {
      return agent.system_prompt;
    }
  }
}
