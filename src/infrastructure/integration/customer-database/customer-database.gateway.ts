import { SqlDatabase } from '@langchain/classic/sql_db';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

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
import {
  assertAllowedHost,
  SsrfBlockedError,
} from 'src/infrastructure/integration/http-client/ssrf-guard';
import type { IntegrationState } from 'src/infrastructure/integration/integration.state';
import { env } from 'src/shared/config/env';

export class TypeOrmCustomerDatabaseGateway implements CustomerDatabaseGateway {
  readonly name = 'customer-database';

  state(): IntegrationState {
    return 'READY';
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
    options: CustomerDatabaseOptions,
    work: (connection: CustomerDatabaseConnection) => Promise<T>,
  ): Promise<T> {
    const dialect = this.detectDialect(databaseUrl);
    const { hostname, database } = this.parseTarget(databaseUrl);

    try {
      assertAllowedHost(hostname, {
        allowedHosts: env.CUSTOMER_DATABASE_ALLOWED_HOSTS,
        allowInternalNetwork: env.CUSTOMER_DATABASE_ALLOW_INTERNAL_NETWORK,
      });
    } catch (error) {
      if (error instanceof SsrfBlockedError) {
        throw new BadRequestException(
          `Host do banco do cliente não permitido: ${hostname}`,
        );
      }

      throw error;
    }

    const dataSource = new DataSource({
      type: dialect,
      url: databaseUrl,
      ...(database ? { database } : {}),
      extra: this.driverOptions(dialect),
    });

    await dataSource.initialize();

    try {
      const sqlDatabase = await SqlDatabase.fromDataSourceParams({
        appDataSource: dataSource,
        ...(options.includeTables?.length
          ? { includesTables: [...options.includeTables] }
          : {}),
        ...(options.sampleRows !== undefined
          ? { sampleRowsInTableInfo: options.sampleRows }
          : {}),
      });

      return await work({
        dialect,
        describeSchema: () => sqlDatabase.getTableInfo(),
        run: (sql) => sqlDatabase.run(sql),
      });
    } finally {
      await dataSource.destroy().catch(() => undefined);
    }
  }

  private driverOptions(dialect: SqlDialect): Record<string, unknown> {
    if (dialect === 'postgres') {
      return {
        statement_timeout: env.CUSTOMER_DATABASE_STATEMENT_TIMEOUT_MS,
        query_timeout: env.CUSTOMER_DATABASE_STATEMENT_TIMEOUT_MS,
        connectionTimeoutMillis: env.CUSTOMER_DATABASE_CONNECTION_TIMEOUT_MS,
        max: 1,
      };
    }

    return {
      connectTimeout: env.CUSTOMER_DATABASE_CONNECTION_TIMEOUT_MS,
      connectionLimit: 1,
    };
  }

  private parseTarget(databaseUrl: string): {
    hostname: string;
    database?: string;
  } {
    try {
      const url = new URL(databaseUrl);
      const database = decodeURIComponent(url.pathname.replace(/^\//, ''));
      return { hostname: url.hostname, database: database || undefined };
    } catch {
      throw new BadRequestException('database_url inválida');
    }
  }
}
