import { Inject, Injectable } from '@nestjs/common';

import {
  type IVectorStoreService,
  VECTOR_STORE_SERVICE,
} from 'src/infrastructure/providers/supabase.provider';
import type { ProcessSourceInput } from 'src/shared/contracts';
import { buildSourceMetadata } from 'src/shared/utils/build-source-metadata';
import { chunkText } from 'src/shared/utils/chunk-text';

@Injectable()
export class ProcessTextSourceService {
  constructor(
    @Inject(VECTOR_STORE_SERVICE)
    private readonly vectorStore: IVectorStoreService,
  ) {}

  async execute(params: ProcessSourceInput): Promise<number> {
    const { buffer, sourceType, agentId, sourceId } = params;

    const chunks = chunkText(buffer.toString('utf-8'));
    const metadata = buildSourceMetadata({
      sourceType,
      defaultSourceType: 'text',
      agentId,
      sourceId,
    });

    return this.vectorStore.upsertChunks(chunks, metadata);
  }
}
