import { Provider } from '@nestjs/common';
import { env } from 'src/shared/config/env';

export const VOYAGE_RERANK_SERVICE = 'VOYAGE_RERANK_SERVICE';

const VOYAGE_RERANK_URL = 'https://api.voyageai.com/v1/rerank';

const MAX_DOCUMENTS_PER_REQUEST = 1000;

export type RerankResult = {
  index: number;
  relevanceScore: number;
};

type VoyageRerankResponse = {
  data: { index: number; relevance_score: number }[];
};

export interface IVoyageRerankService {
  rerank(query: string, documents: string[]): Promise<RerankResult[]>;
}

export class VoyageRerankService implements IVoyageRerankService {
  async rerank(query: string, documents: string[]): Promise<RerankResult[]> {
    if (!documents.length) {
      return [];
    }

    if (documents.length > MAX_DOCUMENTS_PER_REQUEST) {
      throw new Error(
        `Voyage rerank accepts at most ${MAX_DOCUMENTS_PER_REQUEST} documents, received ${documents.length}`,
      );
    }

    const response = await fetch(VOYAGE_RERANK_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.VOYAGEAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.RERANK_MODEL,
        query,
        documents,
        truncation: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();

      throw new Error(
        `Error reranking documents: ${response.status} ${response.statusText} ${body}`,
      );
    }

    const { data } = (await response.json()) as VoyageRerankResponse;

    return data.map((result) => ({
      index: result.index,
      relevanceScore: result.relevance_score,
    }));
  }
}

export const VoyageRerankProvider: Provider[] = [
  {
    provide: VOYAGE_RERANK_SERVICE,
    useFactory: (): VoyageRerankService => {
      if (!env.VOYAGEAI_API_KEY) {
        throw new Error('Voyage API key must be provided');
      }

      if (!env.RERANK_MODEL) {
        throw new Error('Rerank model must be provided');
      }

      return new VoyageRerankService();
    },
  },
];
