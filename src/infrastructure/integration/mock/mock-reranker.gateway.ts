import type { IntegrationState } from 'src/infrastructure/integration/integration.state';
import type {
  RerankerGateway,
  RerankResult,
} from 'src/infrastructure/integration/reranker.port';

export class MockRerankerGateway implements RerankerGateway {
  readonly name = 'voyage-rerank';

  state(): IntegrationState {
    return 'MOCK';
  }

  async rerank(
    query: string,
    documents: readonly string[],
  ): Promise<RerankResult[]> {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    return documents
      .map((document, index) => {
        const text = document.toLowerCase();
        const hits = terms.filter((term) => text.includes(term)).length;
        const relevanceScore = terms.length ? hits / terms.length : 1;

        return { index, relevanceScore };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
