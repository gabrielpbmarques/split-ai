import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

import type { AgentEntity } from 'src/infrastructure/database/schema';

@Injectable()
export class ResolveSystemPromptService {
  async execute(agent: AgentEntity): Promise<string | undefined> {
    if (!agent.agent_identifier) {
      return agent.system_prompt;
    }

    const promptPath = join(
      process.cwd(),
      'memories',
      agent.agent_identifier,
      'AGENT.md',
    );

    if (existsSync(promptPath)) {
      return readFileSync(promptPath, 'utf-8');
    }

    return agent.system_prompt;
  }
}
