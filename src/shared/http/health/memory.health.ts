import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from 'src/shared/http/health/database.health';

const MAX_HEAP_RATIO = 0.95;

@Injectable()
export class MemoryHealthIndicator {
  check(): HealthIndicatorResult & { readonly heapUsedMb: number } {
    const { heapUsed, heapTotal } = process.memoryUsage();
    const heapUsedMb = Math.round(heapUsed / 1024 / 1024);

    return {
      status: heapUsed / heapTotal < MAX_HEAP_RATIO ? 'up' : 'down',
      heapUsedMb,
    };
  }
}
