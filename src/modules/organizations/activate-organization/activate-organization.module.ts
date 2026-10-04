import { Module } from '@nestjs/common';

import { AuthModule } from 'src/auth/auth.module';
import { ActivateOrganizationService } from 'src/modules/organizations/activate-organization/activate-organization.service';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';

@Module({
  imports: [AuthModule, OrganizationRepositoryModule],
  providers: [ActivateOrganizationService],
  exports: [ActivateOrganizationService],
})
export class ActivateOrganizationModule {}
