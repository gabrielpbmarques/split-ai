import { Injectable, NotFoundException } from '@nestjs/common';

import { OrganizationRepository } from 'src/modules/organizations/repositories/organization.repository';
import type { Organization } from 'src/shared/contracts';

@Injectable()
export class GetOrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }
}
