import { Inject, Injectable } from '@nestjs/common';

import { SupabaseService } from 'src/infrastructure/supabase/supabase.provider';
import { SUPABASE_SERVICE } from 'src/infrastructure/supabase/supabase.tokens';
import { ProcessSourceInput } from 'src/shared/contracts';
import { buildSourceMetadata } from 'src/shared/utils/build-source-metadata';
import { chunkText } from 'src/shared/utils/chunk-text';

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
