import { SqlDatabase } from '@langchain/classic/sql_db';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DynamicStructuredTool, tool } from 'langchain';
import { config } from 'src/config';
import { DataSource } from 'typeorm';
import z from 'zod';

const DENY_RE = /\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

@Injectable()
export class LoadDatabaseToolService implements OnModuleInit {
  private dataSource: DataSource;
  private db: SqlDatabase;
  private schema: string;

  constructor() {}

  onModuleInit(): void {
    this.dataSource = new DataSource({
      type: 'postgres',
      url: config.databaseUrl,
    });

    this.loadDatabase();
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
        description: `
            Esquema autoritário (não invente colunas/tabelas):\n
            ${this.schema}\n\n
            - Se a ferramenta retornar 'Erro:', revise a consulta SQL e tente novamente.\n
            - Limite o número de tentativas a 5.\n
            - Se não for bem-sucedido após 5 tentativas, retorne uma nota para o usuário.\n
            - Prefira listas de colunas explícitas; evite SELECT *.\n
          `,
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

  private async loadDatabase(): Promise<void> {
    this.db = await SqlDatabase.fromDataSourceParams({
      appDataSource: this.dataSource,
    });

    this.schema = await this.db.getTableInfo(['reports', 'users']);
  }
}
