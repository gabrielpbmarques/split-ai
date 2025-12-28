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

  async execute(
    organizationId: string,
  ): Promise<DynamicStructuredTool<z.ZodObject<{ query: z.ZodString }>>> {
    const executeSql = tool(
      async ({ query }) => {
        const q = this.sanitizeSqlQuery(query, organizationId);
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
            --- ESQUEMA DE BANCO DE DADOS (Não invente tabelas/colunas) ---
            ${this.schema}

            --- REGRAS DE OURO PARA SQL (Siga estritamente) ---
            1. UUIDs e IDs:
               - Novos registros (INSERT): Use SEMPRE \`gen_random_uuid()\`.
               - Literais UUID: Use cast explícito, ex: '123e4567-e89b...'::uuid.

            2. Enums:
               - Use SEMPRE \`'value'::enum_name\`.

            3. Datas e Horários:
               - \`created_at\` / \`updated_at\`: Use SEMPRE \`NOW()\`.
               - Outras Datas: Converta referências como "amanhã" para datas exatas (YYYY-MM-DD HH:MM:SS).

            4. Segurança e Escopo:
               - SEMPRE adicione \`WHERE organization_id = '${organizationId}'\` em todas as queries (SELECT, UPDATE, DELETE, INSERT). falhar nisso é um erro grave de segurança.

            5. Tratamento de Erros de SQL:
               - Se receber "Error: ...", NÃO peça desculpas imediatamente.
               - 1º: Analise a mensagem de erro (ex: type mismatch uuid vs text).
               - 2º: Corrija a query (ex: adicione ::uuid ou use gen_random_uuid()).
               - 3º: Tente executar novamente. Faça isso até 3 tentativas.

            6. Boas Práticas:
               - Prefira listar colunas (SELECT id, name...) em vez de SELECT *.
          `,
        schema: z.object({
          query: z
            .string()
            .describe('SQLite SELECT/INSERT/UPDATE query to execute.'),
        }),
      },
    );

    return executeSql;
  }

  private sanitizeSqlQuery(q: string, organizationId: string): string {
    let query = String(q ?? '').trim();

    const semis = [...query].filter((c) => c === ';').length;
    if (
      semis > 1 ||
      (query.endsWith(';') && query.slice(0, -1).includes(';'))
    ) {
      throw new Error('multiple statements are not allowed.');
    }

    query = query.replace(/;+\s*$/g, '').trim();

    if (!query.includes(organizationId)) {
      throw new Error(
        `Security Error: Query must filter by organization_id = '${organizationId}'`,
      );
    }

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
