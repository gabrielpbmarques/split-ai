import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ActivateOrganizationService } from './activate-organization.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ActivateOrganizationService],
  exports: [ActivateOrganizationService],
})
export class ActivateOrganizationModule {}
