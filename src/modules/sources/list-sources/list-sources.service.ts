import { Injectable } from '@nestjs/common';

import { SourceEntity } from 'src/infrastructure/database/schema/source.entity';
import { ListSourcesDto } from 'src/modules/sources/list-sources/list-sources.dto';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';
import {
  PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

@Injectable()
export class ListSourcesService {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(dto: ListSourcesDto): Promise<PaginatedResponse<SourceEntity>> {
    const page = await this.sourceRepository.listByAgentPaginated(
      dto.agent_id,
      dto,
    );
    return toPaginatedResponse(page, dto);
  }
}
