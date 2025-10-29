import { SqlDatabase } from '@langchain/classic/sql_db';
import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool, tool } from 'langchain';
import { config } from 'src/config';
import { DataSource } from 'typeorm';
import z from 'zod';

const DENY_RE = /\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

@Injectable()
export class LoadDatabaseToolService {
  private dataSource: DataSource;
  private db: SqlDatabase;

  constructor() {
    this.dataSource = new DataSource({
      type: 'postgres',
      url: config.databaseUrl,
    });

    this.getDatabase();
  }

  async execute(): Promise<
    DynamicStructuredTool<z.ZodObject<{ query: z.ZodString }>>
  > {
    const executeSql = tool(
      async ({ query }) => {
        const q = this.sanitizeSqlQuery(query);
        try {
          const result = await this.db.run(q);
          return typeof result === 'string'
            ? result
            : JSON.stringify(result, null, 2);
        } catch (e) {
          throw new Error(e?.message ?? String(e));
        }
      },
      {
        name: 'execute_sql',
        description:
          'Execute a SQLite SELECT/INSERT/UPDATE query and return results.',
        schema: z.object({
          query: z
            .string()
            .describe(
              'SQLite SELECT/INSERT/UPDATE query to execute (read-only).',
            ),
        }),
      },
    );

    return executeSql;
  }

  async getSchema(): Promise<string> {
    const schema = await this.db.getTableInfo();

    return schema;
  }

  private sanitizeSqlQuery(q: string): string {
    let query = String(q ?? '').trim();

    const semis = [...query].filter((c) => c === ';').length;
    if (
      semis > 1 ||
      (query.endsWith(';') && query.slice(0, -1).includes(';'))
    ) {
      throw new Error('multiple statements are not allowed.');
    }

    query = query.replace(/;+\s*$/g, '').trim();

    if (
      !(
        query.toLowerCase().startsWith('select') ||
        query.toLowerCase().startsWith('insert') ||
        query.toLowerCase().startsWith('update')
      )
    ) {
      throw new Error('Only SELECT/INSERT/UPDATE statements are allowed');
    }
    if (DENY_RE.test(query)) {
      throw new Error(
        'DML/DDL detected. Only SELECT/INSERT/UPDATE queries are permitted.',
      );
    }

    if (!HAS_LIMIT_TAIL_RE.test(query)) {
      query += ' LIMIT 5';
    }

    return query;
  }

  private async getDatabase(): Promise<void> {
    this.db = await SqlDatabase.fromDataSourceParams({
      appDataSource: this.dataSource,
    });
  }
}
