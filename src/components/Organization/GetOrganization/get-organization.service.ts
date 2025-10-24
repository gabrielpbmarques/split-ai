import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories';
import { Organization } from 'src/types';

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
