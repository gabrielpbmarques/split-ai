import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListOrganizationsController } from './list-organizations.controller';
import { ListOrganizationsService } from './list-organizations.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ListOrganizationsService],
  controllers: [ListOrganizationsController],
  exports: [ListOrganizationsService],
})
export class ListOrganizationsModule {}
