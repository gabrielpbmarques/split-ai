import { Module } from '@nestjs/common';

import { ListOrganizationsController } from 'src/modules/organizations/list-organizations/list-organizations.controller';
import { ListOrganizationsService } from 'src/modules/organizations/list-organizations/list-organizations.service';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';

@Module({
  imports: [OrganizationRepositoryModule],
  providers: [ListOrganizationsService],
  controllers: [ListOrganizationsController],
  exports: [ListOrganizationsService],
})
export class ListOrganizationsModule {}
