import { SqlDatabase } from '@langchain/classic/sql_db';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DynamicStructuredTool, tool } from 'langchain';
import { DataSource } from 'typeorm';
import z from 'zod';

const DENY_RE = /\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;

type SupportedDialect = 'postgres' | 'mysql';

@Injectable()
export class LoadDatabaseToolService {
  async execute({
    databaseUrl,
    includeTables,
    sampleRows,
  }: {
    databaseUrl: string;
    // When set, the schema (and every query) is scoped to just these tables —
    // keeps the embedded schema small on large databases. Omitted → all tables.
    includeTables?: string[];
    // Rows of sample data langchain appends per table in the schema. `0` drops
    // them (smaller prompt, no customer data leaked into it). Omitted → default.
    sampleRows?: number;
  }): Promise<DynamicStructuredTool<z.ZodObject<{ query: z.ZodString }>>> {
    const dialect = this.detectDialect(databaseUrl);

    // Introspect the schema once, with a connection that is always released. The
    // resulting string is captured for the tool description; each later query
    // opens and closes its own connection, so no DataSource is ever leaked.
    const schema = await this.withDatabase(
      dialect,
      databaseUrl,
      includeTables,
      sampleRows,
      (db) => db.getTableInfo(),
    );

    return tool(
      async ({ query }) => {
        const q = this.sanitizeSqlQuery(query);
        return this.withDatabase(
          dialect,
          databaseUrl,
          includeTables,
          sampleRows,
          async (db) => {
            try {
              return await db.run(q);
            } catch (e: any) {
              throw new Error(e?.message ?? String(e));
            }
          },
        );
      },
      {
        name: 'execute_sql',
        description: this.buildDescription(dialect, schema),
        schema: z.object({
          query: z
            .string()
            .describe('SQL SELECT/INSERT/UPDATE query to execute.'),
        }),
      },
    );
  }

  /**
   * Opens a TypeORM DataSource, runs `fn` against a (optionally table-scoped)
   * SqlDatabase, and always destroys the DataSource afterwards. Each call is
   * self-contained, so a per-request tool never leaks a connection.
   */
  private async withDatabase<T>(
    dialect: SupportedDialect,
    databaseUrl: string,
    includeTables: string[] | undefined,
    sampleRows: number | undefined,
    fn: (db: SqlDatabase) => Promise<T>,
  ): Promise<T> {
    const database = this.parseDatabaseName(databaseUrl);
    const dataSource = new DataSource({
      type: dialect,
      url: databaseUrl,
      ...(database ? { database } : {}),
    });
    await dataSource.initialize();
    try {
      const db = await SqlDatabase.fromDataSourceParams({
        appDataSource: dataSource,
        ...(includeTables?.length ? { includesTables: includeTables } : {}),
        ...(sampleRows !== undefined
          ? { sampleRowsInTableInfo: sampleRows }
          : {}),
      });
      return await fn(db);
    } finally {
      await dataSource.destroy().catch(() => {
        /* best-effort cleanup; never mask the original result/error */
      });
    }
  }

  /**
   * Extracts the database/schema name from a connection URL. Needed because
   * langchain's `SqlDatabase` reads `DataSource.options.database` (not the
   * driver's parsed value) to enumerate tables; omitting it breaks schema
   * introspection and `includesTables` validation. Returns `undefined` for
   * malformed URLs or a URL without a path, so the DataSource falls back to
   * TypeORM's own parsing.
   */
  private parseDatabaseName(url: string): string | undefined {
    try {
      const name = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''));
      return name || undefined;
    } catch {
      return undefined;
    }
  }

  private detectDialect(url: string): SupportedDialect {
    if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
      return 'postgres';
    }
    if (url.startsWith('mysql://') || url.startsWith('mysql2://')) {
      return 'mysql';
    }
    const scheme = url.split('://')[0] || url.slice(0, 20);
    throw new BadRequestException(
      `database_url com scheme não suportado: '${scheme}'. Apenas postgres:// e mysql:// são aceitos.`,
    );
  }

  private buildDescription(dialect: SupportedDialect, schema: string): string {
    const dialectLabel = dialect === 'postgres' ? 'PostgreSQL' : 'MySQL';
    return `
      --- ESQUEMA DE BANCO DE DADOS (${dialectLabel}) ---
      Não invente tabelas/colunas que não estejam listadas abaixo.

      ${schema}

      --- REGRAS DE OURO ---
      1. Use apenas SELECT, INSERT ou UPDATE. DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE são bloqueados.
      2. Uma única statement por chamada (sem múltiplos ; encadeados).
      3. Se a query não tiver LIMIT, um \`LIMIT 5\` é aplicado automaticamente.
      4. Prefira listar colunas explicitamente em vez de SELECT *.
      5. Em caso de erro do banco, analise a mensagem, corrija e tente de novo (até 3 tentativas).
    `;
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

    const lower = query.toLowerCase();
    if (
      !(
        lower.startsWith('select') ||
        lower.startsWith('insert') ||
        lower.startsWith('update')
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
}
