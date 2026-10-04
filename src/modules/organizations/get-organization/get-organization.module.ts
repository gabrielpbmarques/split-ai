import { Module } from '@nestjs/common';

import { GetOrganizationController } from 'src/modules/organizations/get-organization/get-organization.controller';
import { GetOrganizationService } from 'src/modules/organizations/get-organization/get-organization.service';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';

@Module({
  imports: [OrganizationRepositoryModule],
  providers: [GetOrganizationService],
  controllers: [GetOrganizationController],
  exports: [GetOrganizationService],
})
export class GetOrganizationModule {}
