import { skipOf, toPaginatedResponse } from 'src/shared/contracts/pagination';

describe('pagination', () => {
  it('computes the offset from page and limit', () => {
    expect(skipOf({ page: 1, limit: 20 })).toBe(0);
    expect(skipOf({ page: 3, limit: 10 })).toBe(20);
  });

  it('builds the response envelope with totalPages rounded up', () => {
    expect(
      toPaginatedResponse(
        { items: ['a', 'b'], total: 21 },
        { page: 2, limit: 10 },
      ),
    ).toEqual({
      items: ['a', 'b'],
      total: 21,
      totalPages: 3,
      page: 2,
      limit: 10,
    });
  });

  it('reports zero pages for an empty result', () => {
    expect(
      toPaginatedResponse({ items: [], total: 0 }, { page: 1, limit: 20 })
        .totalPages,
    ).toBe(0);
  });
});
