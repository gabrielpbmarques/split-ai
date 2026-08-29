import { Module } from '@nestjs/common';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { GetOrganizationController } from './get-organization.controller';
import { GetOrganizationService } from './get-organization.service';

@Module({
  imports: [OrganizationRepositoryModule],
  providers: [GetOrganizationService],
  controllers: [GetOrganizationController],
  exports: [GetOrganizationService],
})
export class GetOrganizationModule {}
