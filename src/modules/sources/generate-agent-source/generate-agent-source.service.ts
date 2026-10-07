import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import type {
  SourceEntity,
  SourceType,
} from 'src/infrastructure/database/schema/source.entity';
import {
  VECTOR_STORE,
  type VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';
import { LoadAgentSitesService } from 'src/modules/agents/load-agent-sites/load-agent-sites.service';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';
import type { GenerateAgentSourceDto } from 'src/modules/sources/generate-agent-source/generate-agent-source.dto';
import { ProcessDocxSourceService } from 'src/modules/sources/process-docx-source/process-docx-source.service';
import { ProcessPdfSourceService } from 'src/modules/sources/process-pdf-source/process-pdf-source.service';
import { ProcessTextSourceService } from 'src/modules/sources/process-text-source/process-text-source.service';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';
import { ResolveSourceAgentService } from 'src/modules/sources/resolve-source-agent/resolve-source-agent.service';
import {
  detectFileKind,
  type FileKind,
} from 'src/shared/utils/detect-file-kind';
import { extractDomainName } from 'src/shared/utils/extract-domain-name';

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
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway,
  ) {}

  async execute(
    params: GenerateAgentSourceDto & { buffer?: Buffer },
  ): Promise<SourceEntity[]> {
    const { url, sourceType, fileName, mimeType } = params;
    const fileKind = params.buffer
      ? this.supportedFileKind(mimeType, fileName)
      : undefined;

    const { agentId } = await this.resolveSourceAgentService.execute(
      params.agentId,
    );

    const createdSources: SourceEntity[] = [];
    const tasks: Promise<void>[] = [];

    if (params.buffer && fileKind) {
      const buffer = params.buffer;
      const source = await this.sourceRepository.create({
        agent_id: agentId,
        name: fileName || DEFAULT_FILE_NAME[fileKind],
        source_type: 'pdf' as SourceType,
        file_name: fileName,
        status: 'processing',
      });
      createdSources.push(source);

      tasks.push(
        this.runSourceTask(source.id, `arquivo ${fileKind}`, () =>
          this.indexBuffer(fileKind, {
            buffer,
            sourceType,
            agentId,
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

    void Promise.allSettled(tasks);

    return createdSources;
  }

  private supportedFileKind(
    mimeType: string | undefined,
    fileName: string | undefined,
  ): FileSourceKind {
    const kind = detectFileKind(mimeType, fileName);

    if (kind === 'unknown') {
      throw new BadRequestException(
        `Tipo de arquivo não suportado (${mimeType ?? 'desconhecido'}). Envie PDF, Word (.docx) ou texto/markdown.`,
      );
    }

    return kind;
  }

  private indexBuffer(
    kind: FileSourceKind,
    input: {
      buffer: Buffer;
      sourceType?: string;
      agentId: string;
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

  private async runSourceTask(
    sourceId: string,
    label: string,
    work: () => Promise<number>,
  ): Promise<void> {
    try {
      const chunkCount = await work();
      await this.completeSource(sourceId, label, chunkCount);
    } catch (error: unknown) {
      await this.failSource(sourceId, label, error);
    }
  }

  private async completeSource(
    sourceId: string,
    label: string,
    chunkCount: number,
  ): Promise<void> {
    if (await this.discardIfRemoved(sourceId)) {
      return;
    }

    await this.sourceRepository.updateChunkCount(sourceId, chunkCount);
    await this.sourceRepository.updateStatus(sourceId, 'completed');
    this.logger.log({ sourceId, label, chunkCount }, 'source.processed');
  }

  private async failSource(
    sourceId: string,
    label: string,
    error: unknown,
  ): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error({ sourceId, label, err: error }, 'source.failed');

    try {
      if (await this.discardIfRemoved(sourceId)) {
        return;
      }

      await this.sourceRepository.updateStatus(sourceId, 'failed', message);
    } catch (recordError: unknown) {
      this.logger.error(
        { sourceId, err: recordError },
        'source.failure_not_recorded',
      );
    }
  }

  private async discardIfRemoved(sourceId: string): Promise<boolean> {
    if (await this.sourceRepository.findById(sourceId)) {
      return false;
    }

    await this.vectorStore.deleteBySourceId(sourceId);
    this.logger.warn({ sourceId }, 'source.removed_during_processing');

    return true;
  }
}
