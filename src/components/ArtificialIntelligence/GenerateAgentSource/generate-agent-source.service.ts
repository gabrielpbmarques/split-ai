import { Inject, Injectable } from '@nestjs/common';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { CustomMetadata } from 'src/types';

import { GenerateAgentSourceDto } from './generate-agent-source.dto';

@Injectable()
export class GenerateAgentSourceService {
  constructor(
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
    private readonly loadPdfService: LoadPdfService,
  ) {}

  async execute(dto: GenerateAgentSourceDto): Promise<void> {
    const { url, sourceType, agentId } = dto;

    const chunks = await this.loadPdfService.execute(url);

    const metadata: CustomMetadata = {
      source_type: sourceType,
      agent_id: agentId,
    };

    await this.supabaseService.createVectorStore(chunks, metadata);
  }
}
