import { Inject, Injectable } from '@nestjs/common';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { CustomMetadata } from 'src/types/CustomMetadata';
import { GenerateAgentSourceDto } from './generate-agent-source.dto';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';

@Injectable()
export class GenerateAgentSourceService {
  constructor(
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
    private readonly loadPdfService: LoadPdfService,
  ) {}

  async execute(dto: GenerateAgentSourceDto): Promise<void> {
    const { url, sourceType } = dto;

    const chunks = await this.loadPdfService.execute(url);

    const metadata: CustomMetadata = {
      source_type: sourceType,
    };

    await this.supabaseService.createVectorStore(chunks, metadata);
  }
}
