import { Inject, Injectable, Logger } from '@nestjs/common';
import { LoadAgentSitesService } from 'src/components/ArtificialIntelligence/LoadAgentSites/load-agent-sites.service';
import { LoadPdfService } from 'src/components/Pdf/LoadPdf/load-pdf.service';
import { SourceEntity, SourceType } from 'src/entities/source.entity';
import {
  SUPABASE_SERVICE,
  SupabaseService,
} from 'src/infrastructure/providers/supabase.provider';
import { AgentRepository, SourceRepository } from 'src/repositories';
import { CustomMetadata } from 'src/types';

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
    const { url, sourceType, fileName, mimeType } = params;
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

    const resolvedAgentId = agentId;
    const agent = await this.agentRepository.findById(resolvedAgentId);
    const organizationId = agent?.organization_id ?? null;

    const tasks: Promise<void>[] = [];

    if (params.buffer) {
      const kind = this.detectFileKind(mimeType, fileName);
      if (kind === 'pdf') {
        const source = await this.sourceRepository.create({
          agent_id: resolvedAgentId,
          name: fileName || 'Documento PDF',
          source_type: 'pdf' as SourceType,
          file_name: fileName,
          status: 'processing',
        });
        createdSources.push(source);

        tasks.push(
          this.processPdf(
            params.buffer,
            sourceType,
            resolvedAgentId,
            organizationId,
            source.id,
          ),
        );
      } else if (kind === 'text') {
        const source = await this.sourceRepository.create({
          agent_id: resolvedAgentId,
          name: fileName || 'Documento de texto',
          source_type: 'pdf' as SourceType,
          file_name: fileName,
          status: 'processing',
        });
        createdSources.push(source);

        tasks.push(
          this.processText(
            params.buffer,
            sourceType,
            resolvedAgentId,
            organizationId,
            source.id,
          ),
        );
      } else {
        throw new Error(
          `Tipo de arquivo não suportado (${mimeType ?? 'desconhecido'}). Envie PDF ou texto/markdown.`,
        );
      }
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

  private detectFileKind(
    mimeType: string | undefined,
    fileName: string | undefined,
  ): 'pdf' | 'text' | 'unknown' {
    const mt = (mimeType ?? '').toLowerCase();
    if (mt === 'application/pdf') return 'pdf';
    if (
      mt.startsWith('text/') ||
      mt === 'application/json' ||
      mt === 'application/x-yaml'
    )
      return 'text';
    const ext = (fileName ?? '').toLowerCase().split('.').pop();
    if (ext === 'pdf') return 'pdf';
    if (
      ext === 'md' ||
      ext === 'markdown' ||
      ext === 'txt' ||
      ext === 'json' ||
      ext === 'yaml' ||
      ext === 'yml' ||
      ext === 'csv'
    )
      return 'text';
    return 'unknown';
  }

  private chunkText(
    content: string,
    targetChars = 1800,
  ): { pageContent: string; metadata: Record<string, unknown> }[] {
    const paragraphs = content.split(/\n\n+/);
    const chunks: string[] = [];
    let current = '';
    for (const para of paragraphs) {
      if (!para.trim()) continue;
      const candidate = current ? `${current}\n\n${para}` : para;
      if (candidate.length > targetChars && current) {
        chunks.push(current);
        current = para;
      } else {
        current = candidate;
      }
    }
    if (current) chunks.push(current);
    return chunks.map((c, idx) => ({
      pageContent: c,
      metadata: { chunk_index: idx },
    }));
  }

  private async processPdf(
    buffer: Buffer,
    sourceType: string | undefined,
    agentId: string,
    organizationId: string | null,
    sourceId: string,
  ): Promise<void> {
    try {
      const chunks = await this.loadPdfService.executeFromBuffer(buffer);
      const metadata: CustomMetadata = {
        source_type: sourceType || 'pdf',
        agent_id: agentId,
        source_id: sourceId,
        ...(organizationId ? { organization_id: organizationId } : {}),
      };
      const chunkCount = await this.supabaseService.createVectorStore(
        chunks,
        metadata,
      );

      await this.sourceRepository.updateChunkCount(sourceId, chunkCount);
      await this.sourceRepository.updateStatus(sourceId, 'completed');

      this.logger.log(`PDF processed: ${chunkCount} chunks created`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process PDF: ${message}`);
      await this.sourceRepository.updateStatus(sourceId, 'failed', message);
    }
  }

  private async processText(
    buffer: Buffer,
    sourceType: string | undefined,
    agentId: string,
    organizationId: string | null,
    sourceId: string,
  ): Promise<void> {
    try {
      const text = buffer.toString('utf-8');
      const chunks = this.chunkText(text);
      const metadata: CustomMetadata = {
        source_type: sourceType || 'text',
        agent_id: agentId,
        source_id: sourceId,
        ...(organizationId ? { organization_id: organizationId } : {}),
      };
      const chunkCount = await this.supabaseService.createVectorStore(
        chunks,
        metadata,
      );

      await this.sourceRepository.updateChunkCount(sourceId, chunkCount);
      await this.sourceRepository.updateStatus(sourceId, 'completed');

      this.logger.log(`Text processed: ${chunkCount} chunks created`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process text: ${message}`);
      await this.sourceRepository.updateStatus(sourceId, 'failed', message);
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
    } catch (error: any) {
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
