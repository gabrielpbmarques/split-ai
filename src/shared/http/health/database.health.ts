import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface HealthIndicatorResult {
  readonly status: 'up' | 'down';
  readonly detail?: string;
}

@Injectable()
export class DatabaseHealthIndicator {
  constructor(private readonly dataSource: DataSource) {}

  isInitialized(): HealthIndicatorResult {
    return { status: this.dataSource.isInitialized ? 'up' : 'down' };
  }

  async ping(): Promise<HealthIndicatorResult> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'up' };
    } catch (error: unknown) {
      return { status: 'down', detail: (error as Error).message };
    }
  }
}
