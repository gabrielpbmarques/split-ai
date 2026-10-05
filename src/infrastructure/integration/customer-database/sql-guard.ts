import type { SqlDialect } from 'src/infrastructure/integration/customer-database.port';

const DENY_RE = /\b(DELETE|ALTER|DROP|CREATE|REPLACE|TRUNCATE)\b/i;
const HAS_LIMIT_TAIL_RE = /\blimit\b\s+\d+(\s*,\s*\d+)?\s*;?\s*$/i;
const DEFAULT_LIMIT = 5;

export class UnsupportedDialectError extends Error {
  constructor(readonly scheme: string) {
    super(
      `database_url com scheme não suportado: '${scheme}'. Apenas postgres:// e mysql:// são aceitos.`,
    );
    this.name = 'UnsupportedDialectError';
  }
}

export function detectDialect(url: string): SqlDialect {
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) {
    return 'postgres';
  }

  if (url.startsWith('mysql://') || url.startsWith('mysql2://')) {
    return 'mysql';
  }

  throw new UnsupportedDialectError(url.split('://')[0] || url.slice(0, 20));
}

export function sanitizeSqlQuery(
  input: string,
  options: { readonly readOnly?: boolean } = {},
): string {
  let query = String(input ?? '').trim();

  query = query.replace(/;+\s*$/g, '').trim();

  if (query.includes(';')) {
    throw new Error('multiple statements are not allowed.');
  }

  const lower = query.toLowerCase();

  if (options.readOnly) {
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
    query += ` LIMIT ${DEFAULT_LIMIT}`;
  }

  return query;
}
