import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ResolveSystemPromptService {
  async execute(
    agentIdentifier: string | null | undefined,
    promptVariables?: Record<string, unknown>,
  ): Promise<string | undefined> {
    const basePrompt = this.readAgentPrompt(agentIdentifier);
    const formattedVariables = this.formatVariables(promptVariables);

    const sections = [
      basePrompt?.trim(),
      formattedVariables ? `## Variáveis\n${formattedVariables}` : undefined,
    ].filter((section): section is string => Boolean(section));

    return sections.length > 0 ? sections.join('\n\n') : undefined;
  }

  private readAgentPrompt(
    agentIdentifier: string | null | undefined,
  ): string | undefined {
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

  private formatVariables(promptVariables?: Record<string, unknown>): string {
    if (!promptVariables) {
      return '';
    }

    return Object.entries(promptVariables)
      .filter(
        ([key, value]) =>
          key !== 'authorization' && value !== undefined && value !== null,
      )
      .map(([key, value]) =>
        Array.isArray(value)
          ? `${key}: ${value.join(', ')}`
          : `${key}: ${String(value)}`,
      )
      .join('\n');
  }
}
