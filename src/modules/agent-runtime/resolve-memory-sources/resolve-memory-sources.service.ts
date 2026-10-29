import { Injectable } from '@nestjs/common';

import { LoadStoreService } from 'src/modules/store/load-store/load-store.service';

@Injectable()
export class ResolveMemorySourcesService {
  constructor(private readonly loadStoreService: LoadStoreService) {}

  async execute(agentIdentifier: string): Promise<readonly string[]> {
    const sources = new Set<string>();

    try {
      const store = await this.loadStoreService.execute();
      const items = await store.search([
        'memories',
        agentIdentifier,
        'filesystem',
      ]);

      for (const item of items) {
        const key = item.key.startsWith('/') ? item.key : `/${item.key}`;
        if (!key.endsWith('.md') || key.endsWith('/AGENT.md')) continue;
        sources.add(`/memories${key}`);
      }
    } catch {}

    sources.add('/scratchpad/notes.md');

    return Array.from(sources);
  }
}
