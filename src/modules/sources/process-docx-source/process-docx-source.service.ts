import { Inject, Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';

import {
  type IVectorStoreService,
  VECTOR_STORE_SERVICE,
} from 'src/infrastructure/providers/supabase.provider';
import type { ProcessSourceInput } from 'src/shared/contracts';
import { buildSourceMetadata } from 'src/shared/utils/build-source-metadata';
import { chunkText } from 'src/shared/utils/chunk-text';

@Injectable()
export class ProcessDocxSourceService {
  constructor(
    @Inject(VECTOR_STORE_SERVICE)
    private readonly vectorStore: IVectorStoreService,
  ) {}

  async execute(params: ProcessSourceInput): Promise<number> {
    const { buffer, sourceType, agentId, sourceId } = params;

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
      sourceId,
    });

    return this.vectorStore.upsertChunks(chunks, metadata);
  }
}
