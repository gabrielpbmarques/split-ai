import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateOrganizationController } from './create-organization.controller';
import { CreateOrganizationService } from './create-organization.service';

@Module({
  imports: [RepositoriesModule],
  providers: [CreateOrganizationService],
  controllers: [CreateOrganizationController],
  exports: [CreateOrganizationService],
})
export class CreateOrganizationModule {}
