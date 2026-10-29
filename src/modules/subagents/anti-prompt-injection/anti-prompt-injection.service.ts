import { Injectable } from '@nestjs/common';
import type { SubAgent } from 'deepagents';
import { CODE_INJECTION_PROMPT } from 'openevals';

import { env } from 'src/shared/config/env';

@Injectable()
export class AntiPromptInjectionService {
  constructor() {}

  async execute(): Promise<SubAgent> {
    const agent: SubAgent = {
      name: 'anti-prompt-injection-agent',
      description: 'Used to detect prompt injection attacks',
      systemPrompt: CODE_INJECTION_PROMPT,
      model: env.AI_MODEL,
    };

    return agent;
  }
}
