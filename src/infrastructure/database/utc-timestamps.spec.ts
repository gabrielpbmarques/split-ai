import { defaults, types } from 'pg';

import { useUtcForTimestampColumns } from 'src/infrastructure/database/utc-timestamps';

describe('useUtcForTimestampColumns', () => {
  const originalTimezone = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'America/Sao_Paulo';
    useUtcForTimestampColumns();
  });

  afterAll(() => {
    process.env.TZ = originalTimezone;
  });

  it('reads timestamp without time zone as UTC regardless of the host timezone', () => {
    const parse = types.getTypeParser(types.builtins.TIMESTAMP);

    expect(parse('2026-10-04 21:15:44.123')).toEqual(
      new Date('2026-10-04T21:15:44.123Z'),
    );
  });

  it('keeps infinity values intact', () => {
    const parse = types.getTypeParser(types.builtins.TIMESTAMP);

    expect(parse('infinity')).toBe(Infinity);
    expect(parse('-infinity')).toBe(-Infinity);
  });

  it('sends Date parameters as UTC', () => {
    expect(defaults.parseInputDatesAsUTC).toBe(true);
  });
});
