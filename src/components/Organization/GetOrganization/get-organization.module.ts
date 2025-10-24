import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetOrganizationController } from './get-organization.controller';
import { GetOrganizationService } from './get-organization.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetOrganizationService],
  controllers: [GetOrganizationController],
  exports: [GetOrganizationService],
})
export class GetOrganizationModule {}
