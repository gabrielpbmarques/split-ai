import { Inject, Injectable, Logger } from '@nestjs/common';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';
import { SourceEntity, SourceType } from 'src/entities/source.entity';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { AgentRepository, SourceRepository } from 'src/repositories';
import { CustomMetadata } from 'src/types';

import { LoadAgentSitesService } from '../LoadAgentSites/load-agent-sites.service';

import { GenerateAgentSourceDto } from './generate-agent-source.dto';

@Injectable()
export class GenerateAgentSourceService {
  private readonly logger = new Logger(GenerateAgentSourceService.name);

  constructor(
    @Inject(SUPABASE_SERVICE)
    private readonly supabaseService: SupabaseService,
    private readonly loadPdfService: LoadPdfService,
    private readonly agentRepository: AgentRepository,
    private readonly loadAgentSitesService: LoadAgentSitesService,
    private readonly sourceRepository: SourceRepository,
  ) {}

  private isUuid(id: string): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      id,
    );
  }

  async execute(
    params: GenerateAgentSourceDto & { buffer?: Buffer },
  ): Promise<SourceEntity[]> {
    const { url, sourceType, fileName } = params;
    const createdSources: SourceEntity[] = [];

    let agentId = params.agentId;
    if (agentId && !this.isUuid(agentId)) {
      const dbAgent = await this.agentRepository.findByIdentifier(agentId);
      if (!dbAgent) throw new Error('Agente não encontrado pelo identifier');
      agentId = dbAgent.id;
    }

    if (!agentId) {
      throw new Error('agentId é obrigatório');
    }

    const tasks: Promise<void>[] = [];

    // Process PDF
    if (params.buffer) {
      const source = await this.sourceRepository.create({
        agent_id: agentId,
        name: fileName || 'Documento PDF',
        source_type: 'pdf' as SourceType,
        file_name: fileName,
        status: 'processing',
      });
      createdSources.push(source);

      tasks.push(
        this.processPdf(params.buffer, sourceType, agentId, source.id),
      );
    }

    // Process URLs
    if (url && url.trim().length) {
      const sitesArray = url
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length);

      // Create one source per URL
      for (const siteUrl of sitesArray) {
        const source = await this.sourceRepository.create({
          agent_id: agentId,
          name: this.extractDomainName(siteUrl),
          source_type: 'site' as SourceType,
          url: siteUrl,
          status: 'processing',
        });
        createdSources.push(source);

        tasks.push(this.processSite(siteUrl, agentId, source.id));
      }

      // Update agent sites
      if (sitesArray.length) {
        await this.agentRepository.update(agentId, { sites: sitesArray });
      }
    }

    if (tasks.length) {
      await Promise.all(tasks);
    }

    return createdSources;
  }

  private async processPdf(
    buffer: Buffer,
    sourceType: string | undefined,
    agentId: string,
    sourceId: string,
  ): Promise<void> {
    try {
      const chunks = await this.loadPdfService.executeFromBuffer(buffer);
      const metadata: CustomMetadata = {
        source_type: sourceType || 'pdf',
        agent_id: agentId,
        source_id: sourceId,
      };
      const chunkCount = await this.supabaseService.createVectorStore(
        chunks,
        metadata,
      );

      await this.sourceRepository.updateChunkCount(sourceId, chunkCount);
      await this.sourceRepository.updateStatus(sourceId, 'completed');

      this.logger.log(`PDF processed: ${chunkCount} chunks created`);
    } catch (error) {
      this.logger.error(`Failed to process PDF: ${error.message}`);
      await this.sourceRepository.updateStatus(
        sourceId,
        'failed',
        error.message,
      );
    }
  }

  private async processSite(
    url: string,
    agentId: string,
    sourceId: string,
  ): Promise<void> {
    try {
      const chunkCount = await this.loadAgentSitesService.execute(
        url,
        agentId,
        sourceId,
      );

      await this.sourceRepository.updateChunkCount(sourceId, chunkCount);
      await this.sourceRepository.updateStatus(sourceId, 'completed');

      this.logger.log(
        `Site processed: ${chunkCount} chunks created from ${url}`,
      );
    } catch (error) {
      this.logger.error(`Failed to process site ${url}: ${error.message}`);
      await this.sourceRepository.updateStatus(
        sourceId,
        'failed',
        error.message,
      );
    }
  }

  private extractDomainName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.slice(0, 50);
    }
  }
}
