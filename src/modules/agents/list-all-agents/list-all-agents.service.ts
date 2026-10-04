import { Injectable } from '@nestjs/common';

import { ListAllAgentsDto } from 'src/modules/agents/list-all-agents/list-all-agents.dto';
import {
  AgentRepository,
  AgentWithLatestInstructions,
} from 'src/modules/agents/repositories/agent.repository';
import {
  PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

@Injectable()
export class ListAllAgentsService {
  constructor(private readonly agentRepository: AgentRepository) {}

  async execute(
    dto: ListAllAgentsDto,
  ): Promise<PaginatedResponse<AgentWithLatestInstructions>> {
    const page =
      await this.agentRepository.listWithLatestInstructionsPaginated(dto);
    return toPaginatedResponse(page, dto);
  }
}
