import { Module } from '@nestjs/common';

import { CreateOrganizationModule } from './CreateOrganization/create-organization.module';
import { ListOrganizationsModule } from './ListOrganizations/list-organizations.module';

@Module({
  imports: [CreateOrganizationModule, ListOrganizationsModule],
  exports: [CreateOrganizationModule, ListOrganizationsModule],
})
export class OrganizationModule {}
