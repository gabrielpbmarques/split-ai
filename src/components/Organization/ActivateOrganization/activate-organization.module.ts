import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { ActivateOrganizationService } from './activate-organization.service';

@Module({
  imports: [AuthModule, OrganizationRepositoryModule],
  providers: [ActivateOrganizationService],
  exports: [ActivateOrganizationService],
})
export class ActivateOrganizationModule {}
