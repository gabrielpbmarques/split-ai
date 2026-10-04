import { Module } from '@nestjs/common';

import { TransactionExecutorModule } from 'src/infrastructure/database/transaction-executor/transaction-executor.module';
import { ManageCreditsModule } from 'src/modules/billing/manage-credits/manage-credits.module';
import { PlanRepositoryModule } from 'src/modules/billing/repositories/plan.repository.module';
import { CreateOrganizationController } from 'src/modules/organizations/create-organization/create-organization.controller';
import { CreateOrganizationService } from 'src/modules/organizations/create-organization/create-organization.service';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';
import { UserRepositoryModule } from 'src/modules/users/repositories/user.repository.module';

@Module({
  imports: [
    TransactionExecutorModule,
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
