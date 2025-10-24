import { Inject, Injectable } from '@nestjs/common';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { AgentRepository } from 'src/repositories';
import { CustomMetadata } from 'src/types';

import { LoadAgentSitesService } from '../LoadAgentSites/load-agent-sites.service';

import { GenerateAgentSourceDto } from './generate-agent-source.dto';

@Injectable()
export class GenerateAgentSourceService {
  constructor(
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
    private readonly loadPdfService: LoadPdfService,
    private readonly agentRepository: AgentRepository,
    private readonly loadAgentSitesService: LoadAgentSitesService,
  ) {}

  private isUuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      id,
    );
  }

  async execute(
    params: GenerateAgentSourceDto & { buffer?: Buffer },
  ): Promise<void> {
    const { url, sourceType } = params;

    let agentId = params.agentId;
    if (agentId && !this.isUuid(agentId)) {
      const dbAgent = await this.agentRepository.findByIdentifier(agentId);
      if (!dbAgent) throw new Error('Agente não encontrado pelo identifier');
      agentId = dbAgent.id;
    }

    const tasks: Promise<any>[] = [];

    if (params.buffer) {
      tasks.push(
        (async () => {
          const chunks = await this.loadPdfService.executeFromBuffer(
            params.buffer as Buffer,
          );
          const metadata: CustomMetadata = {
            source_type: sourceType,
            agent_id: agentId,
          };
          await this.supabaseService.createVectorStore(chunks, metadata);
        })(),
      );
    }

    if (url && url.trim().length) {
      if (!agentId) {
        throw new Error('agentId é obrigatório ao processar URLs');
      }

      const sitesArray = url
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length);

      tasks.push(
        (async () => {
          await this.loadAgentSitesService.execute(url, agentId as string);
          if (sitesArray.length) {
            await this.agentRepository.update(agentId as string, {
              sites: sitesArray,
            });
          }
        })(),
      );
    }

    if (!tasks.length) return;
    await Promise.all(tasks);
  }
}
