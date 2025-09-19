import { Inject, Injectable } from '@nestjs/common';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { AgentRepository } from 'src/repositories/agent.repository';
import { CustomMetadata } from 'src/types';

import { GenerateAgentSourceDto } from './generate-agent-source.dto';

@Injectable()
export class GenerateAgentSourceService {
  constructor(
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
    private readonly loadPdfService: LoadPdfService,
    private readonly agentRepository: AgentRepository,
  ) {}

  private isUuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      id,
    );
  }

  async execute(dto: GenerateAgentSourceDto): Promise<void> {
    const { url, sourceType } = dto;

    let agentId = dto.agentId;
    if (agentId && !this.isUuid(agentId)) {
      const dbAgent = await this.agentRepository.findByIdentifier(agentId);
      if (!dbAgent) throw new Error('Agente não encontrado pelo identifier');
      agentId = dbAgent.id;
    }

    const chunks = await this.loadPdfService.execute(url);

    const metadata: CustomMetadata = {
      source_type: sourceType,
      agent_id: agentId,
    };

    await this.supabaseService.createVectorStore(chunks, metadata);
  }
}
