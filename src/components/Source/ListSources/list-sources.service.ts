import { Injectable } from '@nestjs/common';
import { SourceEntity } from 'src/entities/source.entity';
import { SourceRepository } from 'src/repositories';

@Injectable()
export class ListSourcesService {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(agentId: string): Promise<SourceEntity[]> {
    return this.sourceRepository.findByAgentId(agentId);
  }
}
