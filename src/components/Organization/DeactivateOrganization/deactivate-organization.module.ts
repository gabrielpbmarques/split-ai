import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { DeactivateOrganizationService } from './deactivate-organization.service';

@Module({
  imports: [RepositoriesModule],
  providers: [DeactivateOrganizationService],
  exports: [DeactivateOrganizationService],
})
export class DeactivateOrganizationModule {}
