import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from 'src/repositories/organization.repository';
import { OrganizationStatus } from 'src/types';

@Injectable()
export class ActivateOrganizationService {
  private readonly logger = new Logger(ActivateOrganizationService.name);

  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(organizationId: string): Promise<void> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      this.logger.warn(
        `Organization ${organizationId} not found for activation`,
      );
      throw new NotFoundException('Organization not found');
    }

    if (organization.status === 'active') {
      return;
    }

    await this.organizationRepository.update(organizationId, {
      status: 'active' as OrganizationStatus,
      activated_at: new Date(),
    });

    this.logger.log(`Organization ${organizationId} activated`);
  }
}
