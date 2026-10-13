import { Inject, Injectable } from '@nestjs/common';

import {
  type IVectorStoreService,
  VECTOR_STORE_SERVICE,
} from 'src/infrastructure/providers/supabase.provider';
import { LoadPdfService } from 'src/modules/sources/load-pdf/load-pdf.service';
import type { ProcessSourceInput } from 'src/shared/contracts';
import { buildSourceMetadata } from 'src/shared/utils/build-source-metadata';

@Injectable()
export class ProcessPdfSourceService {
  constructor(
    private readonly loadPdfService: LoadPdfService,
    @Inject(VECTOR_STORE_SERVICE)
    private readonly vectorStore: IVectorStoreService,
  ) {}

  async execute(params: ProcessSourceInput): Promise<number> {
    const { buffer, sourceType, agentId, sourceId } = params;

    const chunks = await this.loadPdfService.execute(buffer);
    const metadata = buildSourceMetadata({
      sourceType,
      defaultSourceType: 'pdf',
      agentId,
      sourceId,
    });

    return this.vectorStore.upsertChunks(chunks, metadata);
  }
}
