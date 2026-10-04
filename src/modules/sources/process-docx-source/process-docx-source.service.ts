import { Inject, Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';

import {
  VECTOR_STORE,
  type VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';
import type { ProcessSourceInput } from 'src/shared/contracts';
import { buildSourceMetadata } from 'src/shared/utils/build-source-metadata';
import { chunkText } from 'src/shared/utils/chunk-text';

@Injectable()
export class ProcessDocxSourceService {
  constructor(
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway,
  ) {}

  async execute(params: ProcessSourceInput): Promise<number> {
    const { buffer, sourceType, agentId, organizationId, sourceId } = params;

    const { value } = await mammoth.extractRawText({ buffer });
    const text = (value ?? '').trim();
    if (!text) {
      throw new Error('Não foi possível extrair texto do documento Word.');
    }

    const chunks = chunkText(text);
    const metadata = buildSourceMetadata({
      sourceType,
      defaultSourceType: 'docx',
      agentId,
      organizationId,
      sourceId,
    });

    return this.vectorStore.upsertChunks(chunks, metadata);
  }
}
