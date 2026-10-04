import { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const CUSTOMER_DATABASE = Symbol('CUSTOMER_DATABASE');

export type SqlDialect = 'postgres' | 'mysql';

export interface CustomerDatabaseOptions {
  readonly includeTables?: readonly string[];
  readonly sampleRows?: number;
}

export interface CustomerDatabaseConnection {
  readonly dialect: SqlDialect;
  describeSchema(): Promise<string>;
  run(sql: string): Promise<string>;
}

export interface CustomerDatabaseGateway extends IntegrationGateway {
  detectDialect(databaseUrl: string): SqlDialect;
  withConnection<T>(
    databaseUrl: string,
    options: CustomerDatabaseOptions,
    work: (connection: CustomerDatabaseConnection) => Promise<T>,
  ): Promise<T>;
}
