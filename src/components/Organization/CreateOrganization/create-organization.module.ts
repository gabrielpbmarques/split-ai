import { Module } from '@nestjs/common';
import { ManageCreditsModule } from 'src/components/Credits/ManageCredits/manage-credits.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';
import { PlanRepositoryModule } from 'src/repositories/plan.repository.module';
import { UserRepositoryModule } from 'src/repositories/user.repository.module';

import { CreateOrganizationController } from './create-organization.controller';
import { CreateOrganizationService } from './create-organization.service';

@Module({
  imports: [
    ManageCreditsModule,
    OrganizationRepositoryModule,
    PlanRepositoryModule,
    UserRepositoryModule,
  ],
  providers: [CreateOrganizationService],
  controllers: [CreateOrganizationController],
  exports: [CreateOrganizationService],
})
export class CreateOrganizationModule {}
