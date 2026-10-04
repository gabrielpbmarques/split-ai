import { Injectable } from '@nestjs/common';

import { SourceEntity } from 'src/infrastructure/database/schema/source.entity';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

@Injectable()
export class ListSourcesService {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(agentId: string): Promise<SourceEntity[]> {
    return this.sourceRepository.findByAgentId(agentId);
  }
}
