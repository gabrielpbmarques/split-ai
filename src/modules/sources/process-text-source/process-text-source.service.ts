import { Inject, Injectable } from '@nestjs/common';

import {
  VECTOR_STORE,
  type VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';
import type { ProcessSourceInput } from 'src/shared/contracts';
import { buildSourceMetadata } from 'src/shared/utils/build-source-metadata';
import { chunkText } from 'src/shared/utils/chunk-text';

@Injectable()
export class ProcessTextSourceService {
  constructor(
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway,
  ) {}

  async execute(params: ProcessSourceInput): Promise<number> {
    const { buffer, sourceType, agentId, organizationId, sourceId } = params;

    const chunks = chunkText(buffer.toString('utf-8'));
    const metadata = buildSourceMetadata({
      sourceType,
      defaultSourceType: 'text',
      agentId,
      organizationId,
      sourceId,
    });

    return this.vectorStore.upsertChunks(chunks, metadata);
  }
}
