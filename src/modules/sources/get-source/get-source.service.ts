import { Injectable, NotFoundException } from '@nestjs/common';

import type { SourceEntity } from 'src/infrastructure/database/schema/source.entity';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

@Injectable()
export class GetSourceService {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(id: string): Promise<SourceEntity> {
    const source = await this.sourceRepository.findById(id);

    if (!source) {
      throw new NotFoundException('Fonte de conhecimento não encontrada');
    }

    return source;
  }
}
