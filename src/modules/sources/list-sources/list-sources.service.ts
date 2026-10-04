import { Injectable } from '@nestjs/common';

import type { SourceEntity } from 'src/infrastructure/database/schema/source.entity';
import type { ListSourcesDto } from 'src/modules/sources/list-sources/list-sources.dto';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';
import {
  type PaginatedResponse,
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
