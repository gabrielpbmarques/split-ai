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

  async migrationsApplied(): Promise<HealthIndicatorResult> {
    if (!this.dataSource.isInitialized) {
      return { status: 'down', detail: 'Banco de dados não inicializado' };
    }

    const pending = await this.dataSource.showMigrations();

    return pending
      ? { status: 'down', detail: 'Migrations pendentes' }
      : { status: 'up' };
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
