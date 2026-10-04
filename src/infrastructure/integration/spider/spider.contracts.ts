import { z } from 'zod';

export const spiderDocumentSchema = z.object({
  pageContent: z.string(),
  metadata: z.record(z.unknown()).default({}),
});

export type SpiderDocument = z.infer<typeof spiderDocumentSchema>;
