import { Inject, Injectable } from '@nestjs/common';

import { SupabaseService } from 'src/infrastructure/supabase/supabase.provider';
import { SUPABASE_SERVICE } from 'src/infrastructure/supabase/supabase.tokens';
import { LoadPdfService } from 'src/modules/sources/load-pdf/load-pdf.service';
import { ProcessSourceInput } from 'src/shared/contracts';
import { buildSourceMetadata } from 'src/shared/utils/build-source-metadata';

@Injectable()
export class ProcessPdfSourceService {
  constructor(
    private readonly loadPdfService: LoadPdfService,
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
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

    return this.supabaseService.createVectorStore(chunks, metadata);
  }
}
