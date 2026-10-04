import { BadGatewayException, Logger } from '@nestjs/common';

import { ResilientClient } from 'src/infrastructure/integration/http-client/resilient-client';
import {
  IntegrationState,
  notConfigured,
} from 'src/infrastructure/integration/integration.state';
import {
  RerankerGateway,
  RerankResult,
} from 'src/infrastructure/integration/reranker.port';
import { voyageRerankResponseSchema } from 'src/infrastructure/integration/voyage/voyage.contracts';
import { mapRerankResponse } from 'src/infrastructure/integration/voyage/voyage.mappers';
import { env } from 'src/shared/config/env';

const VOYAGE_BASE_URL = 'https://api.voyageai.com';
const RERANK_PATH = '/v1/rerank';
const MAX_DOCUMENTS_PER_REQUEST = 1000;

export class VoyageRerankerGateway implements RerankerGateway {
  readonly name = 'voyage-rerank';

  private readonly logger = new Logger(VoyageRerankerGateway.name);
  private readonly client?: ResilientClient;

  constructor(client?: ResilientClient) {
    if (env.VOYAGEAI_API_KEY) {
      this.client =
        client ??
        new ResilientClient({
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
  }

  state(): IntegrationState {
    return this.client ? 'READY' : 'NOT_CONFIGURED';
  }

  async rerank(
    query: string,
    documents: readonly string[],
  ): Promise<RerankResult[]> {
    const client = this.client ?? notConfigured(this.name);

    if (!documents.length) {
      return [];
    }

    if (documents.length > MAX_DOCUMENTS_PER_REQUEST) {
      throw new Error(
        `Voyage rerank aceita no máximo ${MAX_DOCUMENTS_PER_REQUEST} documentos, recebeu ${documents.length}`,
      );
    }

    const raw = await client.requestJson({
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
