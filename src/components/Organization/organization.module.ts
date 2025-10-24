import { Module } from '@nestjs/common';

import { CreateOrganizationModule } from './CreateOrganization/create-organization.module';
import { GetOrganizationModule } from './GetOrganization/get-organization.module';
import { ListOrganizationsModule } from './ListOrganizations/list-organizations.module';

@Module({
  imports: [
    CreateOrganizationModule,
    ListOrganizationsModule,
    GetOrganizationModule,
  ],
  exports: [
    CreateOrganizationModule,
    ListOrganizationsModule,
    GetOrganizationModule,
  ],
})
export class OrganizationModule {}
