import { Module } from '@nestjs/common';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { ListOrganizationsController } from './list-organizations.controller';
import { ListOrganizationsService } from './list-organizations.service';

@Module({
  imports: [OrganizationRepositoryModule],
  providers: [ListOrganizationsService],
  controllers: [ListOrganizationsController],
  exports: [ListOrganizationsService],
})
export class ListOrganizationsModule {}
