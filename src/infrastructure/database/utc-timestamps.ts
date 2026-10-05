import { defaults, types } from 'pg';

const INFINITY = /^-?infinity$/;

export function useUtcForTimestampColumns(): void {
  const parseTimestampWithZone = types.getTypeParser(
    types.builtins.TIMESTAMPTZ,
  );

  defaults.parseInputDatesAsUTC = true;
  types.setTypeParser(types.builtins.TIMESTAMP, (value: string) =>
    parseTimestampWithZone(INFINITY.test(value) ? value : `${value}Z`),
  );
}
