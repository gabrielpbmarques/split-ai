import { Injectable } from '@nestjs/common';
import type { SubAgent } from 'deepagents';
import { PII_LEAKAGE_PROMPT } from 'openevals';

import { env } from 'src/shared/config/env';

@Injectable()
export class AntiPersonalLeakService {
  constructor() {}

  async execute(): Promise<SubAgent> {
    const agent: SubAgent = {
      name: 'anti-personal-leak-agent',
      description: 'Used to detect PII leakage attacks',
      systemPrompt: PII_LEAKAGE_PROMPT,
      model: env.AI_MODEL,
    };

    return agent;
  }
}
