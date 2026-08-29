import { Module } from '@nestjs/common';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { ActivateOrganizationService } from './activate-organization.service';

@Module({
  imports: [OrganizationRepositoryModule],
  providers: [ActivateOrganizationService],
  exports: [ActivateOrganizationService],
})
export class ActivateOrganizationModule {}
