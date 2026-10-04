import { Module } from '@nestjs/common';

import { OrganizationFeatureRepositoryModule } from 'src/modules/organizations/repositories/organization-feature.repository.module';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';
import { LoadDatabaseToolModule } from 'src/modules/retrieval/load-database-tool/load-database-tool.module';
import { MaybeLoadDatabaseToolService } from 'src/modules/retrieval/maybe-load-database-tool/maybe-load-database-tool.service';

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
