import { getHeapStatistics } from 'v8';

import { Injectable } from '@nestjs/common';

import type { HealthIndicatorResult } from 'src/shared/http/health/database.health';

const MAX_HEAP_RATIO = 0.95;

@Injectable()
export class MemoryHealthIndicator {
  check(): HealthIndicatorResult & { readonly heapUsedMb: number } {
    const { used_heap_size, heap_size_limit } = getHeapStatistics();
    const heapUsedMb = Math.round(used_heap_size / 1024 / 1024);

    return {
      status: used_heap_size / heap_size_limit < MAX_HEAP_RATIO ? 'up' : 'down',
      heapUsedMb,
    };
  }
}
