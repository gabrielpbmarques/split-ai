import { createHash } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { SqlExecResult } from 'src/infrastructure/providers/bravohub-analytics.provider';

type Entry = { value: SqlExecResult; expiresAt: number };

const TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 500;

@Injectable()
export class QueryResultCacheService {
  private readonly store = new Map<string, Entry>();

  hash(query: string, companyId: number): string {
    return createHash('sha256')
      .update(`${companyId}::${query.trim()}`)
      .digest('hex');
  }

  get(threadId: string, hash: string): SqlExecResult | undefined {
    const key = `${threadId}:${hash}`;
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    // Touch (move to back) for LRU-ish behavior.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(threadId: string, hash: string, value: SqlExecResult): void {
    if (this.store.size >= MAX_ENTRIES) {
      const firstKey = this.store.keys().next().value;
      if (firstKey) this.store.delete(firstKey);
    }
    this.store.set(`${threadId}:${hash}`, {
      value,
      expiresAt: Date.now() + TTL_MS,
    });
  }
}
