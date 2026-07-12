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
    readOnly = false,
    scope,
    scopeRequired = false,
  }: {
    databaseUrl: string;
    // When set, the schema (and every query) is scoped to just these tables —
    // keeps the embedded schema small on large databases. Omitted → all tables.
    includeTables?: string[];
    // Rows of sample data langchain appends per table in the schema. `0` drops
    // them (smaller prompt, no customer data leaked into it). Omitted → default.
    sampleRows?: number;
    // Reject anything that is not a pure SELECT (analytics is read-only).
    readOnly?: boolean;
    // Mandatory tenant predicate. Every query must filter `column = value` and
    // may not reference `column` with any other value / IN / range / inequality.
    scope?: { column: string; value: string | number };
    // Fail closed: when true and `scope` is missing, the tool refuses to run.
    scopeRequired?: boolean;
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
        // Fail closed: a scope-required tool with no resolved company scope must
        // never touch the shared multi-tenant database.
        if (scopeRequired && !scope) {
          return 'Consulta bloqueada: escopo de empresa ausente. Nenhum dado pode ser lido sem uma empresa autenticada.';
        }
        let q: string;
        try {
          q = this.sanitizeSqlQuery(query, { readOnly });
          if (scope) this.assertScoped(q, scope);
        } catch (e: any) {
          // Surface the rule violation back to the model so it can rewrite the
          // query, instead of throwing (which would abort the whole run).
          return `Consulta rejeitada: ${e?.message ?? String(e)}`;
        }
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
        description: this.buildDescription(dialect, schema, {
          readOnly,
          scope,
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

  private buildDescription(
    dialect: SupportedDialect,
    schema: string,
    opts?: {
      readOnly?: boolean;
      scope?: { column: string; value: string | number };
    },
  ): string {
    const dialectLabel = dialect === 'postgres' ? 'PostgreSQL' : 'MySQL';
    const rule1 = opts?.readOnly
      ? '1. SOMENTE SELECT (somente leitura). INSERT/UPDATE/DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE são bloqueados.'
      : '1. Use apenas SELECT, INSERT ou UPDATE. DELETE/ALTER/DROP/CREATE/REPLACE/TRUNCATE são bloqueados.';
    const scopeRule = opts?.scope
      ? `
      6. ISOLAMENTO OBRIGATÓRIO DE EMPRESA: toda query DEVE filtrar ${opts.scope.column} = ${opts.scope.value}, referenciando uma tabela que possua essa coluna (ex.: app_company, app_company_user, app_company_campaign). Para tabelas-filho sem ${opts.scope.column}, faça JOIN até o pai (ex.: app_company_campaign / app_company_analytics_session) e filtre o ${opts.scope.column} = ${opts.scope.value} dele. É PROIBIDO usar outro valor, ${opts.scope.column} IN (...), faixas ou desigualdades sobre ${opts.scope.column} — a query será REJEITADA automaticamente.`
      : '';
    return `
      --- ESQUEMA DE BANCO DE DADOS (${dialectLabel}) ---
      Não invente tabelas/colunas que não estejam listadas abaixo.

      ${schema}

      --- REGRAS DE OURO ---
      ${rule1}
      2. Uma única statement por chamada (sem múltiplos ; encadeados).
      3. Se a query não tiver LIMIT, um \`LIMIT 5\` é aplicado automaticamente.
      4. Prefira listar colunas explicitamente em vez de SELECT *.
      5. Em caso de erro do banco, analise a mensagem, corrija e tente de novo (até 3 tentativas).${scopeRule}
    `;
  }

  private sanitizeSqlQuery(q: string, opts?: { readOnly?: boolean }): string {
    let query = String(q ?? '').trim();

    // Reject stacked statements: after trimming a single trailing terminator,
    // no semicolon may remain anywhere in the query (one statement per call).
    query = query.replace(/;+\s*$/g, '').trim();
    if (query.includes(';')) {
      throw new Error('multiple statements are not allowed.');
    }

    const lower = query.toLowerCase();
    if (opts?.readOnly) {
      // Analytics is strictly read-only: only a pure SELECT may run.
      if (!lower.startsWith('select')) {
        throw new Error('Only read-only SELECT statements are allowed');
      }
    } else if (
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

  /**
   * Enforces tenant isolation at the tool layer: the query MUST filter
   * `<column> = <value>` (anchoring it to the caller's company) and may NOT
   * reference `<column>` with any other value, an `IN (...)`, or a range /
   * inequality — all of which could widen the result beyond the tenant.
   *
   * Defense-in-depth on top of the server-forced scope and the system-prompt
   * guardrail; it deliberately errs toward rejection. Not a substitute for
   * DB-level isolation (see the caveat in the write-side docs): a crafted
   * tautology (`... OR 1=1`) is not caught here — the prompt guardrail and
   * read-only mode are the compensating controls.
   */
  private assertScoped(
    query: string,
    scope: { column: string; value: string | number },
  ): void {
    const column = String(scope.column).replace(/[^a-z0-9_]/gi, '');
    const value = String(scope.value);
    if (!column || !/^\d+$/.test(value)) {
      throw new Error('escopo de empresa inválido.');
    }

    // Optional `alias.` / `` `alias`. `` qualifier, optional backticks on the
    // column. The lookbehind stops `parent_company_id` matching `company_id`.
    const qualifier = '(?:`?[a-z0-9_]+`?\\.)?';
    const col = `\`?${column}\`?`;

    const present = new RegExp(
      `(?<![a-z0-9_\`])${qualifier}${col}\\s*=\\s*${value}(?![0-9])`,
      'i',
    ).test(query);
    if (!present) {
      throw new Error(
        `toda query deve filtrar ${column} = ${value} (escopo da empresa).`,
      );
    }

    // Any other use of the column widens the scope: a different literal, an
    // IN (...), or a range / inequality operator.
    const widens = new RegExp(
      `(?<![a-z0-9_\`])${col}\\s*(?:in\\b|<>|!=|>=|<=|>|<|=\\s*(?!${value}(?![0-9]))\\d)`,
      'i',
    ).test(query);
    if (widens) {
      throw new Error(
        `apenas ${column} = ${value} é permitido — sem IN, faixas, desigualdades ou outra empresa.`,
      );
    }
  }
}
