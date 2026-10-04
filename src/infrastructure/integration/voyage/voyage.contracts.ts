import { z } from 'zod';

export const voyageRerankResponseSchema = z.object({
  data: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      relevance_score: z.number(),
    }),
  ),
});

export type VoyageRerankResponse = z.infer<typeof voyageRerankResponseSchema>;
