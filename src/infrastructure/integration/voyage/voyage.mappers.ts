import { RerankResult } from 'src/infrastructure/integration/reranker.port';
import { VoyageRerankResponse } from 'src/infrastructure/integration/voyage/voyage.contracts';

export function mapRerankResponse(
  response: VoyageRerankResponse,
): RerankResult[] {
  return response.data.map((item) => ({
    index: item.index,
    relevanceScore: item.relevance_score,
  }));
}
