import { Injectable } from '@nestjs/common';

import type { OrganizationEntity } from 'src/infrastructure/database/schema';
import type { ListOrganizationsDto } from 'src/modules/organizations/list-organizations/list-organizations.dto';
import { OrganizationRepository } from 'src/modules/organizations/repositories/organization.repository';
import {
  type PaginatedResponse,
  toPaginatedResponse,
} from 'src/shared/contracts/pagination';

@Injectable()
export class ListOrganizationsService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    dto: ListOrganizationsDto,
  ): Promise<PaginatedResponse<OrganizationEntity>> {
    const { page, limit, ...filters } = dto;
    const result = await this.organizationRepository.listPaginated(filters, {
      page,
      limit,
    });
    return toPaginatedResponse(result, { page, limit });
  }
}
