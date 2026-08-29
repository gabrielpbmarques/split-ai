import { Module } from '@nestjs/common';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { DeactivateOrganizationService } from './deactivate-organization.service';

@Module({
  imports: [OrganizationRepositoryModule],
  providers: [DeactivateOrganizationService],
  exports: [DeactivateOrganizationService],
})
export class DeactivateOrganizationModule {}
