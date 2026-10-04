import { voyageRerankResponseSchema } from 'src/infrastructure/integration/voyage/voyage.contracts';
import { mapRerankResponse } from 'src/infrastructure/integration/voyage/voyage.mappers';

describe('voyage.mappers', () => {
  it('maps relevance_score to relevanceScore keeping order', () => {
    expect(
      mapRerankResponse({
        data: [
          { index: 2, relevance_score: 0.9 },
          { index: 0, relevance_score: 0.4 },
        ],
      }),
    ).toEqual([
      { index: 2, relevanceScore: 0.9 },
      { index: 0, relevanceScore: 0.4 },
    ]);
  });

  it('rejects a response without the data array', () => {
    expect(voyageRerankResponseSchema.safeParse({ results: [] }).success).toBe(
      false,
    );
    expect(
      voyageRerankResponseSchema.safeParse({ data: [{ index: -1 }] }).success,
    ).toBe(false);
  });
});
