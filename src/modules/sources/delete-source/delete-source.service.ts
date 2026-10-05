import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import {
  VECTOR_STORE,
  type VectorStoreGateway,
} from 'src/infrastructure/integration/vector-store.port';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

@Injectable()
export class DeleteSourceService {
  private readonly logger = new Logger(DeleteSourceService.name);

  constructor(
    private readonly sourceRepository: SourceRepository,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStoreGateway,
  ) {}

  async execute(id: string): Promise<void> {
    const source = await this.sourceRepository.findById(id);

    if (!source) {
      throw new NotFoundException('Fonte de conhecimento não encontrada');
    }

    await this.vectorStore.deleteBySourceId(id);
    await this.sourceRepository.delete(id);

    this.logger.log(`Fonte ${id} removida com seus documentos`);
  }
}
