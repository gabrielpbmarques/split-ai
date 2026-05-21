import { DynamicStructuredTool } from 'langchain';
import { Parser } from 'node-sql-parser';
import { z } from 'zod';

type ValidationIssue = { code: string; message: string };

export type ValidateSqlContext = {
  companyId: number;
};

export function buildValidateSqlTool(
  ctx: ValidateSqlContext,
): DynamicStructuredTool {
  const parser = new Parser();
  return new DynamicStructuredTool({
    name: 'validate_sql',
    description: [
      'Valida uma query SQL ANTES de chamar `execute_sql`. Checa: SELECT-only, instrução única,',
      'sem CTEs/window functions (MySQL 5.7 não suporta), filtro por company_id presente.',
      'Use sempre que a query envolver mais que SELECT trivial — economiza chamada e ciclo de erro.',
      'Retorna { ok: true } ou { ok: false, issues: [...] } com a lista de problemas.',
    ].join(' '),
    schema: z.object({
      query: z.string().describe('A query SQL que você pretende executar.'),
    }),
    func: async ({ query }) => {
      const issues: ValidationIssue[] = [];
      const trimmed = query.trim();

      if (!trimmed) {
        return JSON.stringify({
          ok: false,
          issues: [{ code: 'EMPTY', message: 'Query vazia.' }],
        });
      }

      const withoutTrailingSemi = trimmed.replace(/;\s*$/, '');
      if (withoutTrailingSemi.includes(';')) {
        issues.push({
          code: 'MULTIPLE_STATEMENTS',
          message: 'Apenas uma instrução SQL é permitida.',
        });
      }

      if (
        /\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE|RENAME|GRANT|REVOKE|INSERT|UPDATE|LOAD|CALL|HANDLER|LOCK|UNLOCK)\b/i.test(
          trimmed,
        )
      ) {
        issues.push({
          code: 'FORBIDDEN_VERB',
          message: 'Apenas SELECT é permitido.',
        });
      }

      if (/\b(WITH\s+RECURSIVE|WITH\s+\w+\s+AS\s*\()/i.test(trimmed)) {
        issues.push({
          code: 'NO_CTE',
          message:
            'CTEs (WITH ... AS) não são suportadas no MySQL 5.7. Use subquery no FROM.',
        });
      }

      if (
        /\b(ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|NTILE|PERCENT_RANK|FIRST_VALUE|LAST_VALUE)\s*\(/i.test(
          trimmed,
        )
      ) {
        issues.push({
          code: 'NO_WINDOW',
          message:
            'Window functions não existem no MySQL 5.7. Use variáveis de sessão (@rownum) ou self-join.',
        });
      }

      try {
        const ast = parser.astify(trimmed, { database: 'MySQL' });
        const stmts = Array.isArray(ast) ? ast : [ast];
        if (stmts.length !== 1) {
          issues.push({
            code: 'MULTIPLE_STATEMENTS',
            message: 'Mais de uma instrução detectada.',
          });
        }
        const root = stmts[0] as { type?: string } | undefined;
        if (root && root.type !== 'select') {
          issues.push({
            code: 'FORBIDDEN_VERB',
            message: `Tipo de instrução "${root.type}" não permitido.`,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'parse error';
        issues.push({
          code: 'SYNTAX',
          message: `Erro de sintaxe SQL: ${message}`,
        });
      }

      const stripped = trimmed
        .replace(/--[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');
      const tenantRe = new RegExp(
        `\\bcompany_id\\s*(=|IN)\\s*[(\\s]*${ctx.companyId}\\b`,
        'i',
      );
      if (!tenantRe.test(stripped)) {
        issues.push({
          code: 'TENANT_MISSING',
          message: `Filtro por company_id = ${ctx.companyId} ausente. Toda query precisa restringir explicitamente.`,
        });
      }

      if (issues.length > 0) {
        return JSON.stringify({ ok: false, issues });
      }
      return JSON.stringify({ ok: true });
    },
  });
}
