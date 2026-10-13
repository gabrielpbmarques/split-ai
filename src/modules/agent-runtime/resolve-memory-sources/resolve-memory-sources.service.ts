import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ResolveMemorySourcesService {
  async execute(identifier: string | null): Promise<readonly string[]> {
    if (!identifier) {
      return ['/scratchpad/notes.md'];
    }

    const agentDir = join(process.cwd(), 'memories', identifier);
    const sources: string[] = [];

    const collectMarkdown = (dir: string, base: string = ''): void => {
      try {
        const list = readdirSync(dir);
        for (const file of list) {
          if (file.startsWith('.')) continue;
          const fullPath = join(dir, file);
          const relPath = base ? `${base}/${file}` : file;
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            collectMarkdown(fullPath, relPath);
          } else if (file.endsWith('.md') && file !== 'AGENT.md') {
            sources.push(`/memories/${identifier}/${relPath}`);
          }
        }
      } catch {
        return;
      }
    };

    collectMarkdown(agentDir);
    sources.push('/scratchpad/notes.md');
    sources.push(`/memories/${identifier}/`);

    return sources;
  }
}
