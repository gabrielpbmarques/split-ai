import { Injectable, Logger } from '@nestjs/common';
import { LoadAgentSitesService } from 'src/components/ArtificialIntelligence/LoadAgentSites/load-agent-sites.service';
import { ProcessDocxSourceService } from 'src/components/Source/ProcessDocxSource/process-docx-source.service';
import { ProcessPdfSourceService } from 'src/components/Source/ProcessPdfSource/process-pdf-source.service';
import { ProcessTextSourceService } from 'src/components/Source/ProcessTextSource/process-text-source.service';
import { ResolveSourceAgentService } from 'src/components/Source/ResolveSourceAgent/resolve-source-agent.service';
import { SourceEntity, SourceType } from 'src/entities/source.entity';
import { AgentRepository, SourceRepository } from 'src/repositories';
import { detectFileKind, FileKind } from 'src/utils/detectFileKind';
import { extractDomainName } from 'src/utils/extractDomainName';

import { GenerateAgentSourceDto } from './generate-agent-source.dto';

type FileSourceKind = Exclude<FileKind, 'unknown'>;

const DEFAULT_FILE_NAME: Record<FileSourceKind, string> = {
  pdf: 'Documento PDF',
  text: 'Documento de texto',
  docx: 'Documento Word',
};

@Injectable()
export class GenerateAgentSourceService {
  private readonly logger = new Logger(GenerateAgentSourceService.name);

  constructor(
    private readonly resolveSourceAgentService: ResolveSourceAgentService,
    private readonly processPdfSourceService: ProcessPdfSourceService,
    private readonly processTextSourceService: ProcessTextSourceService,
    private readonly processDocxSourceService: ProcessDocxSourceService,
    private readonly loadAgentSitesService: LoadAgentSitesService,
    private readonly agentRepository: AgentRepository,
    private readonly sourceRepository: SourceRepository,
  ) {}

  async execute(
    params: GenerateAgentSourceDto & { buffer?: Buffer },
  ): Promise<SourceEntity[]> {
    const { url, sourceType, fileName, mimeType } = params;

    const { agentId, organizationId } =
      await this.resolveSourceAgentService.execute(params.agentId);

    const createdSources: SourceEntity[] = [];
    const tasks: Promise<void>[] = [];

    if (params.buffer) {
      const kind = detectFileKind(mimeType, fileName);
      if (kind === 'unknown') {
        throw new Error(
          `Tipo de arquivo não suportado (${mimeType ?? 'desconhecido'}). Envie PDF, Word (.docx) ou texto/markdown.`,
        );
      }

      const buffer = params.buffer;
      const source = await this.sourceRepository.create({
        agent_id: agentId,
        name: fileName || DEFAULT_FILE_NAME[kind],
        source_type: 'pdf' as SourceType,
        file_name: fileName,
        status: 'processing',
      });
      createdSources.push(source);

      tasks.push(
        this.runSourceTask(source.id, `arquivo ${kind}`, () =>
          this.indexBuffer(kind, {
            buffer,
            sourceType,
            agentId,
            organizationId,
            sourceId: source.id,
          }),
        ),
      );
    }

    if (url && url.trim().length) {
      const sitesArray = url
        .split(',')
        .map((site) => site.trim())
        .filter((site) => site.length);

      for (const siteUrl of sitesArray) {
        const source = await this.sourceRepository.create({
          agent_id: agentId,
          name: extractDomainName(siteUrl),
          source_type: 'site' as SourceType,
          url: siteUrl,
          status: 'processing',
        });
        createdSources.push(source);

        tasks.push(
          this.runSourceTask(source.id, `site ${siteUrl}`, () =>
            this.loadAgentSitesService.execute(siteUrl, agentId, source.id),
          ),
        );
      }

      if (sitesArray.length) {
        await this.agentRepository.update(agentId, { sites: sitesArray });
      }
    }

    if (tasks.length) {
      await Promise.all(tasks);
    }

    return createdSources;
  }

  private indexBuffer(
    kind: FileSourceKind,
    input: {
      buffer: Buffer;
      sourceType?: string;
      agentId: string;
      organizationId: string | null;
      sourceId: string;
    },
  ): Promise<number> {
    switch (kind) {
      case 'pdf':
        return this.processPdfSourceService.execute(input);
      case 'text':
        return this.processTextSourceService.execute(input);
      case 'docx':
        return this.processDocxSourceService.execute(input);
    }
  }

  /**
   * Runs a source-processing job and reconciles the source row: on success it
   * records the chunk count and marks it `completed`; on failure it marks it
   * `failed` with the error message. Never rejects, so sibling jobs in the same
   * `Promise.all` are unaffected.
   */
  private async runSourceTask(
    sourceId: string,
    label: string,
    work: () => Promise<number>,
  ): Promise<void> {
    try {
      const chunkCount = await work();
      await this.sourceRepository.updateChunkCount(sourceId, chunkCount);
      await this.sourceRepository.updateStatus(sourceId, 'completed');
      this.logger.log(`Source processed (${label}): ${chunkCount} chunks`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to process source (${label}): ${message}`);
      await this.sourceRepository.updateStatus(sourceId, 'failed', message);
    }
  }
}
