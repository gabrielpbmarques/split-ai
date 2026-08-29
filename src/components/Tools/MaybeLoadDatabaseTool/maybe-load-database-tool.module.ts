import { Module } from '@nestjs/common';
import { OrganizationFeatureRepositoryModule } from 'src/repositories/organization-feature.repository.module';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { LoadDatabaseToolModule } from '../LoadDatabaseTool/load-database-tool.module';

import { MaybeLoadDatabaseToolService } from './maybe-load-database-tool.service';

@Module({
  imports: [
    LoadDatabaseToolModule,
    OrganizationFeatureRepositoryModule,
    OrganizationRepositoryModule,
  ],
  providers: [MaybeLoadDatabaseToolService],
  exports: [MaybeLoadDatabaseToolService],
})
export class MaybeLoadDatabaseToolModule {}
