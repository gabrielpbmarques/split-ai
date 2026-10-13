import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ResolveSkillSourcesService {
  async execute(identifier: string | null): Promise<readonly string[]> {
    const sources: string[] = [];

    if (identifier) {
      const agentSkillsDir = join(process.cwd(), 'skills', identifier);
      if (existsSync(agentSkillsDir)) {
        sources.push(`/skills/${identifier}/`);
      }
    }

    const sharedSkillsDir = join(process.cwd(), 'skills', 'shared');
    if (existsSync(sharedSkillsDir)) {
      sources.push('/skills/shared/');
    }

    sources.push('/skills/');

    return sources;
  }
}
