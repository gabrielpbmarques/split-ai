import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ResolveSystemPromptService {
  async execute(
    agentIdentifier: string | null | undefined,
  ): Promise<string | undefined> {
    if (!agentIdentifier) {
      return undefined;
    }

    try {
      return readFileSync(
        join(process.cwd(), 'memories', agentIdentifier, 'AGENT.md'),
        'utf-8',
      );
    } catch {
      return undefined;
    }
  }
}
