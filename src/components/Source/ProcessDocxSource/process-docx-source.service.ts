import { Inject, Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { ProcessSourceInput } from 'src/types';
import { buildSourceMetadata } from 'src/utils/buildSourceMetadata';
import { chunkText } from 'src/utils/chunkText';

@Injectable()
export class ProcessDocxSourceService {
  constructor(
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
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

    return this.supabaseService.createVectorStore(chunks, metadata);
  }
}
