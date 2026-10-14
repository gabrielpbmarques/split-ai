import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

import { LoadStoreService } from 'src/modules/store/load-store/load-store.service';

@Injectable()
export class ResolveMemorySourcesService {
  constructor(private readonly loadStoreService: LoadStoreService) {}

  async execute(
    agentId: string,
    identifier: string | null,
  ): Promise<readonly string[]> {
    if (!identifier) {
      return ['/scratchpad/notes.md'];
    }

    const sources = new Set<string>();
    const seenRelPaths = new Set<string>();

    try {
      const store = await this.loadStoreService.execute();
      const items = await store.search(['memories', agentId, 'filesystem']);
      const prefix = `/${identifier}/`;

      for (const item of items) {
        const key = String(item.key);
        if (!key.endsWith('.md') || key.endsWith('AGENT.md')) continue;

        const normalizedKey = key.startsWith('/') ? key : `/${key}`;
        const relPath = normalizedKey.startsWith(prefix)
          ? normalizedKey.slice(prefix.length)
          : normalizedKey.startsWith('/')
            ? normalizedKey.slice(1)
            : normalizedKey;

        if (seenRelPaths.has(relPath)) continue;
        seenRelPaths.add(relPath);

        const vfsPath = normalizedKey.startsWith(prefix)
          ? `/memories${normalizedKey}`
          : `/memories/${identifier}/${relPath}`;

        sources.add(vfsPath);
      }
    } catch {}

    if (sources.size === 0) {
      const agentDir = join(process.cwd(), 'memories', identifier);
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
              sources.add(`/memories/${identifier}/${relPath}`);
            }
          }
        } catch {
          return;
        }
      };

      collectMarkdown(agentDir);
    }

    sources.add('/scratchpad/notes.md');

    return Array.from(sources);
  }
}
