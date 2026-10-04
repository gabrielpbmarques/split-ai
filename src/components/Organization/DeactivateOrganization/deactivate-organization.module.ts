import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { DeactivateOrganizationService } from './deactivate-organization.service';

@Module({
  imports: [AuthModule, OrganizationRepositoryModule],
  providers: [DeactivateOrganizationService],
  exports: [DeactivateOrganizationService],
})
export class DeactivateOrganizationModule {}
