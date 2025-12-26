import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { DeactivateOrganizationModule } from '../../Organization/DeactivateOrganization/deactivate-organization.module';
import { ManageCreditsModule } from '../ManageCredits/manage-credits.module';

import { ConsumeCreditsService } from './consume-credits.service';

@Module({
  imports: [
    RepositoriesModule,
    ManageCreditsModule,
    DeactivateOrganizationModule,
  ],
  providers: [ConsumeCreditsService],
  exports: [ConsumeCreditsService],
})
export class ConsumeCreditsModule {}
