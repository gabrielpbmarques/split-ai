import { IntegrationGateway } from 'src/infrastructure/integration/integration.state';

export const RERANKER = Symbol('RERANKER');

export interface RerankResult {
  readonly index: number;
  readonly relevanceScore: number;
}

export interface RerankerGateway extends IntegrationGateway {
  rerank(query: string, documents: readonly string[]): Promise<RerankResult[]>;
}
