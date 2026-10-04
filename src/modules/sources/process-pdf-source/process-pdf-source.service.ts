import { Inject, Injectable } from '@nestjs/common';

import {
  VECTOR_STORE,
  VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';
import { LoadPdfService } from 'src/modules/sources/load-pdf/load-pdf.service';
import { ProcessSourceInput } from 'src/shared/contracts';
import { buildSourceMetadata } from 'src/shared/utils/build-source-metadata';

@Injectable()
export class ProcessPdfSourceService {
  constructor(
    private readonly loadPdfService: LoadPdfService,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway,
  ) {}

  async execute(params: ProcessSourceInput): Promise<number> {
    const { buffer, sourceType, agentId, organizationId, sourceId } = params;

    const chunks = await this.loadPdfService.execute(buffer);
    const metadata = buildSourceMetadata({
      sourceType,
      defaultSourceType: 'pdf',
      agentId,
      organizationId,
      sourceId,
    });

    return this.vectorStore.upsertChunks(chunks, metadata);
  }
}
