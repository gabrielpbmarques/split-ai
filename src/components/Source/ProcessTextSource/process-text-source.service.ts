import { Inject, Injectable } from '@nestjs/common';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { ProcessSourceInput } from 'src/types';
import { buildSourceMetadata } from 'src/utils/buildSourceMetadata';
import { chunkText } from 'src/utils/chunkText';

@Injectable()
export class ProcessTextSourceService {
  constructor(
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
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

    return this.supabaseService.createVectorStore(chunks, metadata);
  }
}
