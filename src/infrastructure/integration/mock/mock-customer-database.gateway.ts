import { BadRequestException } from '@nestjs/common';

import {
  detectDialect,
  UnsupportedDialectError,
} from 'src/infrastructure/integration/customer-database/sql-guard';
import type {
  CustomerDatabaseConnection,
  CustomerDatabaseGateway,
  CustomerDatabaseOptions,
  SqlDialect,
} from 'src/infrastructure/integration/customer-database.port';
import type { IntegrationState } from 'src/infrastructure/integration/integration.state';

const MOCK_SCHEMA = `CREATE TABLE customers (id INTEGER, name TEXT)`;

export class MockCustomerDatabaseGateway implements CustomerDatabaseGateway {
  readonly name = 'customer-database';

  readonly queries: string[] = [];

  state(): IntegrationState {
    return 'MOCK';
  }

  detectDialect(databaseUrl: string): SqlDialect {
    try {
      return detectDialect(databaseUrl);
    } catch (error) {
      if (error instanceof UnsupportedDialectError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async withConnection<T>(
    databaseUrl: string,
    _options: CustomerDatabaseOptions,
    work: (connection: CustomerDatabaseConnection) => Promise<T>,
  ): Promise<T> {
    const dialect = this.detectDialect(databaseUrl);

    return work({
      dialect,
      describeSchema: async () => MOCK_SCHEMA,
      run: async (sql) => {
        this.queries.push(sql);
        return '[]';
      },
    });
  }
}
