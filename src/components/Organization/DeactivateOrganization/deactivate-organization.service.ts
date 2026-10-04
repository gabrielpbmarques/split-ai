import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrincipalResolverService } from 'src/auth/principal-resolver.service';
import { OrganizationRepository } from 'src/repositories/organization.repository';
import { OrganizationStatus } from 'src/types';

@Injectable()
export class DeactivateOrganizationService {
  private readonly logger = new Logger(DeactivateOrganizationService.name);

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly principalResolver: PrincipalResolverService,
  ) {}

  async execute(organizationId: string, reason?: string): Promise<void> {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      this.logger.warn(
        `Organization ${organizationId} not found for deactivation`,
      );
      throw new NotFoundException('Organization not found');
    }

    if (organization.status === 'inactive') {
      return;
    }

    await this.organizationRepository.update(organizationId, {
      status: 'inactive' as OrganizationStatus,
      deactivated_at: new Date(),
    });

    this.principalResolver.invalidateOrganization(organizationId);

    this.logger.log(
      `Organization ${organizationId} deactivated. Reason: ${reason || 'Unknown'}`,
    );
  }
}
