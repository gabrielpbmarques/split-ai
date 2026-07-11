import { Inject, Injectable } from '@nestjs/common';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { ProcessSourceInput } from 'src/types';
import { buildSourceMetadata } from 'src/utils/buildSourceMetadata';

@Injectable()
export class ProcessPdfSourceService {
  constructor(
    private readonly loadPdfService: LoadPdfService,
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
  ) {}

  async execute(params: ProcessSourceInput): Promise<number> {
    const { buffer, sourceType, agentId, organizationId, sourceId } = params;

    const chunks = await this.loadPdfService.executeFromBuffer(buffer);
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
