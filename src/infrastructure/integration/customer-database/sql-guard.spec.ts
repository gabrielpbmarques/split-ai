import {
  assertScoped as assertScopedGuard,
  detectDialect,
  sanitizeSqlQuery,
  UnsupportedDialectError,
} from 'src/infrastructure/integration/customer-database/sql-guard';

describe('sql-guard', () => {
  const scope = { column: 'company_id', value: '37' };

  const assertScoped = (query: string): void => assertScopedGuard(query, scope);
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

  describe('assertScoped — accepts a correctly-scoped query', () => {
    it('plain equality', () => {
      expect(() =>
        assertScoped('SELECT id FROM app_company_user WHERE company_id = 37'),
      ).not.toThrow();
    });

    it('alias-qualified column', () => {
      expect(() =>
        assertScoped(
          'SELECT u.id FROM app_company_user u WHERE u.company_id = 37',
        ),
      ).not.toThrow();
    });

    it('backtick-quoted column', () => {
      expect(() =>
        assertScoped('SELECT id FROM t WHERE `company_id` = 37 LIMIT 5'),
      ).not.toThrow();
    });

    it('child table scoped via a parent join (predicate present once)', () => {
      expect(() =>
        assertScoped(
          'SELECT r.id FROM app_company_campaign_discount_register r ' +
            'JOIN app_company_campaign c ON c.campaign_id = r.campaign_id ' +
            'WHERE c.company_id = 37',
        ),
      ).not.toThrow();
    });

    it('ignores a different column that merely contains the name', () => {
      expect(() =>
        assertScoped(
          'SELECT id FROM t WHERE parent_company_id = 99 AND company_id = 37',
        ),
      ).not.toThrow();
    });
  });

  describe('assertScoped — rejects unscoped or widening queries', () => {
    it('missing the company predicate entirely', () => {
      expect(() => assertScoped('SELECT id FROM app_company_user')).toThrow(
        /company_id = 37/,
      );
    });

    it('a different company', () => {
      expect(() =>
        assertScoped('SELECT id FROM app_company_user WHERE company_id = 99'),
      ).toThrow();
    });

    it('the scoped id as a prefix of a larger id (370)', () => {
      expect(() =>
        assertScoped('SELECT id FROM app_company_user WHERE company_id = 370'),
      ).toThrow();
    });

    it('an IN list', () => {
      expect(() =>
        assertScoped(
          'SELECT id FROM app_company_user WHERE company_id IN (37, 99)',
        ),
      ).toThrow();
    });

    it('an inequality / range operator', () => {
      expect(() =>
        assertScoped('SELECT id FROM app_company_user WHERE company_id >= 37'),
      ).toThrow();
      expect(() =>
        assertScoped('SELECT id FROM app_company_user WHERE company_id != 37'),
      ).toThrow();
    });

    it('an OR to another company alongside the scoped predicate', () => {
      expect(() =>
        assertScoped(
          'SELECT id FROM app_company_user WHERE company_id = 37 OR company_id = 99',
        ),
      ).toThrow();
    });
  });

  describe('sanitizeSqlQuery — read-only mode', () => {
    it('allows a SELECT (and appends a LIMIT)', () => {
      expect(
        sanitize('SELECT id FROM app_company_user WHERE company_id = 37'),
      ).toMatch(/limit 5$/i);
    });

    it('rejects UPDATE', () => {
      expect(() =>
        sanitize(
          'UPDATE app_company_user SET name = "x" WHERE company_id = 37',
        ),
      ).toThrow(/read-only/i);
    });

    it('rejects INSERT', () => {
      expect(() =>
        sanitize('INSERT INTO app_company_user (id) VALUES (1)'),
      ).toThrow(/read-only/i);
    });

    it('rejects stacked statements', () => {
      expect(() => sanitize('SELECT 1; SELECT 2')).toThrow(
        /multiple statements/i,
      );
    });
  });
});
