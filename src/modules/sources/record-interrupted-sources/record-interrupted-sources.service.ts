import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';

import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

const INTERRUPTED_MESSAGE = 'Processamento interrompido.';

@Injectable()
export class RecordInterruptedSourcesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RecordInterruptedSourcesService.name);

  constructor(private readonly sourceRepository: SourceRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.execute();
    } catch (error: unknown) {
      this.logger.error({ err: error }, 'source.interrupted_not_recorded');
    }
  }

  async execute(): Promise<number> {
    const interrupted =
      await this.sourceRepository.failAllProcessing(INTERRUPTED_MESSAGE);

    if (interrupted > 0) {
      this.logger.warn({ interrupted }, 'source.processing_interrupted');
    }

    return interrupted;
  }
}
