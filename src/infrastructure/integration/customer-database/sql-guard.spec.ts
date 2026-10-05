import {
  detectDialect,
  sanitizeSqlQuery,
  UnsupportedDialectError,
} from 'src/infrastructure/integration/customer-database/sql-guard';

describe('sql-guard', () => {
  const sanitize = (query: string, readOnly = true): string =>
    sanitizeSqlQuery(query, { readOnly });

  describe('detectDialect', () => {
    it('recognizes postgres and mysql schemes', () => {
      expect(detectDialect('postgres://u:p@h/db')).toBe('postgres');
      expect(detectDialect('postgresql://u:p@h/db')).toBe('postgres');
      expect(detectDialect('mysql://u:p@h/db')).toBe('mysql');
      expect(detectDialect('mysql2://u:p@h/db')).toBe('mysql');
    });

    it('rejects any other scheme', () => {
      expect(() => detectDialect('sqlite://file.db')).toThrow(
        UnsupportedDialectError,
      );
    });
  });

  describe('sanitizeSqlQuery — read/write mode', () => {
    it('allows INSERT and UPDATE', () => {
      expect(sanitize('INSERT INTO t (id) VALUES (1)', false)).toMatch(
        /^INSERT/,
      );
      expect(sanitize('UPDATE t SET a = 1 WHERE id = 1', false)).toMatch(
        /limit 5$/i,
      );
    });

    it('still rejects DDL after an allowed verb', () => {
      expect(() => sanitize('SELECT 1; DROP TABLE t', false)).toThrow();
      expect(() =>
        sanitize('UPDATE t SET a = (SELECT 1) WHERE 1 = 1 AND DROP', false),
      ).toThrow(/DML\/DDL/);
    });

    it('keeps an explicit LIMIT untouched', () => {
      expect(sanitize('SELECT id FROM t LIMIT 2')).toBe(
        'SELECT id FROM t LIMIT 2',
      );
    });
  });

  describe('sanitizeSqlQuery — read-only mode', () => {
    it('allows a SELECT (and appends a LIMIT)', () => {
      expect(sanitize('SELECT id FROM customers WHERE id = 37')).toMatch(
        /limit 5$/i,
      );
    });

    it('rejects UPDATE', () => {
      expect(() => sanitize('UPDATE customers SET name = "x"')).toThrow(
        /read-only/i,
      );
    });

    it('rejects INSERT', () => {
      expect(() => sanitize('INSERT INTO customers (id) VALUES (1)')).toThrow(
        /read-only/i,
      );
    });

    it('rejects stacked statements', () => {
      expect(() => sanitize('SELECT 1; SELECT 2')).toThrow(
        /multiple statements/i,
      );
    });
  });
});
