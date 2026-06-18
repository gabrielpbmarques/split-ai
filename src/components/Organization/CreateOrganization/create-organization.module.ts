import { Module } from '@nestjs/common';
import { ManageCreditsModule } from 'src/components/Credits/ManageCredits/manage-credits.module';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateOrganizationController } from './create-organization.controller';
import { CreateOrganizationService } from './create-organization.service';

@Module({
  imports: [RepositoriesModule, ManageCreditsModule],
  providers: [CreateOrganizationService],
  controllers: [CreateOrganizationController],
  exports: [CreateOrganizationService],
})
export class CreateOrganizationModule {}
