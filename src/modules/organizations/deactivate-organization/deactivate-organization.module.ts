import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { DeactivateOrganizationService } from 'src/modules/organizations/deactivate-organization/deactivate-organization.service';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';

@Module({
  imports: [AuthModule, OrganizationRepositoryModule],
  providers: [DeactivateOrganizationService],
  exports: [DeactivateOrganizationService],
})
export class DeactivateOrganizationModule {}
