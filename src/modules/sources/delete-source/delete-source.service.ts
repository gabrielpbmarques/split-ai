import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import {
  type IVectorStoreService,
  VECTOR_STORE_SERVICE,
} from 'src/infrastructure/providers/supabase.provider';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

@Injectable()
export class DeleteSourceService {
  private readonly logger = new Logger(DeleteSourceService.name);

  constructor(
    private readonly sourceRepository: SourceRepository,
    @Inject(VECTOR_STORE_SERVICE)
    private readonly vectorStore: IVectorStoreService,
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
