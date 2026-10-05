import { Inject, Injectable } from '@nestjs/common';
import { type DynamicStructuredTool, tool } from 'langchain';
import z from 'zod';

import { sanitizeSqlQuery } from 'src/infrastructure/integration/customer-database/sql-guard';
import {
  CUSTOMER_DATABASE,
  type CustomerDatabaseGateway,
  type CustomerDatabaseOptions,
  type SqlDialect,
} from 'src/infrastructure/integration/customer-database.port';

export interface LoadDatabaseToolInput {
  databaseUrl: string;
  includeTables?: string[];
  sampleRows?: number;
  readOnly?: boolean;
}

export type DatabaseTool = DynamicStructuredTool<
  z.ZodObject<{ query: z.ZodString }>
>;

@Injectable()
export class LoadDatabaseToolService {
  constructor(
    @Inject(CUSTOMER_DATABASE)
    private readonly customerDatabase: CustomerDatabaseGateway,
  ) {}

  async execute({
    databaseUrl,
    includeTables,
    sampleRows,
    readOnly = false,
  }: LoadDatabaseToolInput): Promise<DatabaseTool> {
    const options: CustomerDatabaseOptions = { includeTables, sampleRows };

    const { dialect, schema } = await this.customerDatabase.withConnection(
      databaseUrl,
      options,
      async (connection) => ({
        dialect: connection.dialect,
        schema: await connection.describeSchema(),
      }),
    );

    return tool(
      async ({ query }) => {
        let sanitized: string;

        try {
          sanitized = sanitizeSqlQuery(query, { readOnly });
        } catch (error) {
          return `Consulta rejeitada: ${(error as Error).message}`;
        }

        return this.customerDatabase.withConnection(
          databaseUrl,
          options,
          (connection) => connection.run(sanitized),
        );
      },
      {
        name: 'execute_sql',
        description: this.buildDescription(dialect, schema, {
          readOnly,
        }),
        schema: z.object({
          query: z
            .string()
            .describe(
              readOnly
                ? 'SQL SELECT query to execute (read-only).'
                : 'SQL SELECT/INSERT/UPDATE query to execute.',
            ),
        }),
      },
    );
  }

  private buildDescription(
    dialect: SqlDialect,
    schema: string,
    opts: { readOnly: boolean },
  ): string {
    const dialectLabel = dialect === 'postgres' ? 'PostgreSQL' : 'MySQL';
    const rule1 = opts.readOnly
      ? '1. SOMENTE SELECT (somente leitura). INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE são bloqueados.'
      : '1. Use apenas SELECT, INSERT ou UPDATE. DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE são bloqueados.';
    return `
      --- ESQUEMA DE BANCO DE DADOS (${dialectLabel}) ---
      Não invente tabelas/colunas que não estejam listadas abaixo.

      ${schema}

      --- REGRAS DE OURO ---
      ${rule1}
      2. Uma única statement por chamada (sem múltiplos ; encadeados).
      3. Se a query não tiver LIMIT, um \`LIMIT 5\` é aplicado automaticamente.
      4. Prefira listar colunas explicitamente em vez de SELECT *.
      5. Em caso de erro do banco, analise a mensagem, corrija e tente de novo (até 3 tentativas).
    `;
  }
}
