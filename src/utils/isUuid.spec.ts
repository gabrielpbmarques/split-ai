import { isUuid } from './isUuid';

describe('isUuid', () => {
  it('accepts a valid uuid', () => {
    expect(isUuid('3f2504e0-4f89-41d3-9a0c-0305e82c3301')).toBe(true);
  });

  it('rejects non-uuid identifiers', () => {
    expect(isUuid('my-agent-identifier')).toBe(false);
    expect(isUuid('')).toBe(false);
    expect(isUuid('3f2504e0-4f89-41d3-9a0c')).toBe(false);
  });
});
