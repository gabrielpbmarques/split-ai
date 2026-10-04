import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { OrganizationRepository } from 'src/repositories/organization.repository';
import { OrganizationStatus } from 'src/types';

@Injectable()
export class ActivateOrganizationService {
  private readonly logger = new Logger(ActivateOrganizationService.name);

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly principalResolver: PrincipalResolverService,
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

    this.principalResolver.invalidateOrganization(organizationId);

    this.logger.log(`Organization ${organizationId} activated`);
  }
}
