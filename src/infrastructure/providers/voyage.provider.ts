import { createHash } from 'crypto';

import { VoyageEmbeddings } from '@langchain/community/embeddings/voyage';
import { Embeddings } from '@langchain/core/embeddings';
import {
  BadGatewayException,
  Logger,
  type Provider,
  ServiceUnavailableException,
} from '@nestjs/common';
import { z } from 'zod';

import { ResilientClient } from 'src/infrastructure/http-client/resilient-client';
import { env } from 'src/shared/config/env';

export const EMBEDDINGS_SERVICE = 'EMBEDDINGS_SERVICE';
export const RERANKER_SERVICE = 'RERANKER_SERVICE';

export type IEmbeddingsService = Embeddings;

export interface RerankResult {
  readonly index: number;
  readonly relevanceScore: number;
}

export interface IRerankerService {
  rerank(query: string, documents: readonly string[]): Promise<RerankResult[]>;
}

const OUTPUT_DIMENSION = 1024;
const DIMENSIONS = 16;
const VOYAGE_BASE_URL = 'https://api.voyageai.com';
const RERANK_PATH = '/v1/rerank';
const MAX_DOCUMENTS_PER_REQUEST = 1000;

export const voyageRerankResponseSchema = z.object({
  data: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      relevance_score: z.number(),
    }),
  ),
});

export type VoyageRerankResponse = z.infer<typeof voyageRerankResponseSchema>;

export function mapRerankResponse(
  response: VoyageRerankResponse,
): RerankResult[] {
  return response.data.map((item) => ({
    index: item.index,
    relevanceScore: item.relevance_score,
  }));
}

class UnavailableEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedDocuments(): Promise<number[][]> {
    throw new ServiceUnavailableException('Voyage embeddings não configurado');
  }

  async embedQuery(): Promise<number[]> {
    throw new ServiceUnavailableException('Voyage embeddings não configurado');
  }
}

class MockEmbeddings extends Embeddings {
  constructor() {
    super({});
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    return documents.map((document) => this.vectorFor(document));
  }

  async embedQuery(document: string): Promise<number[]> {
    return this.vectorFor(document);
  }

  private vectorFor(text: string): number[] {
    const digest = createHash('sha256').update(text).digest();
    const vector = Array.from(
      { length: DIMENSIONS },
      (_, i) => digest[i] / 255,
    );
    const norm = Math.hypot(...vector) || 1;

    return vector.map((value) => value / norm);
  }
}

class VoyageRerankerService implements IRerankerService {
  private readonly logger = new Logger(VoyageRerankerService.name);
  private readonly client: ResilientClient;

  constructor() {
    if (!env.VOYAGEAI_API_KEY) {
      throw new ServiceUnavailableException('Voyage API Key não configurada');
    }

    this.client = new ResilientClient({
      name: 'voyage',
      baseUrl: VOYAGE_BASE_URL,
      timeoutMs: env.HTTP_TIMEOUT_MS,
      retries: env.HTTP_RETRIES,
      backoffBaseMs: env.HTTP_BACKOFF_BASE_MS,
      circuitFailureThreshold: env.HTTP_CIRCUIT_FAILURE_THRESHOLD,
      circuitOpenMs: env.HTTP_CIRCUIT_OPEN_MS,
      ssrf: {
        allowedHosts: env.HTTP_ALLOWED_HOSTS,
        allowInternalNetwork: false,
      },
      defaultHeaders: { authorization: `Bearer ${env.VOYAGEAI_API_KEY}` },
    });
  }

  async rerank(
    query: string,
    documents: readonly string[],
  ): Promise<RerankResult[]> {
    if (!documents.length) {
      return [];
    }

    if (documents.length > MAX_DOCUMENTS_PER_REQUEST) {
      throw new Error(
        `Voyage rerank aceita no máximo ${MAX_DOCUMENTS_PER_REQUEST} documentos, recebeu ${documents.length}`,
      );
    }

    const raw = await this.client.requestJson({
      path: RERANK_PATH,
      method: 'POST',
      body: {
        model: env.RERANK_MODEL,
        query,
        documents,
        truncation: true,
      },
    });

    const parsed = voyageRerankResponseSchema.safeParse(raw);

    if (!parsed.success) {
      this.logger.warn(
        { issues: parsed.error.issues },
        'voyage.invalid_response',
      );
      throw new BadGatewayException('Resposta inválida do serviço de rerank');
    }

    return mapRerankResponse(parsed.data);
  }
}

class MockRerankerService implements IRerankerService {
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

export const VoyageProvider: Provider[] = [
  {
    provide: EMBEDDINGS_SERVICE,
    useFactory: (): IEmbeddingsService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockEmbeddings();
      }
      if (!env.VOYAGEAI_API_KEY || !env.EMBEDDING_MODEL) {
        return new UnavailableEmbeddings();
      }
      return new VoyageEmbeddings({
        apiKey: env.VOYAGEAI_API_KEY,
        modelName: env.EMBEDDING_MODEL,
        outputDimension: OUTPUT_DIMENSION,
      }) as unknown as Embeddings;
    },
  },
  {
    provide: RERANKER_SERVICE,
    useFactory: (): IRerankerService => {
      if (env.INTEGRATION_MODE === 'mock') {
        return new MockRerankerService();
      }
      return new VoyageRerankerService();
    },
  },
];
