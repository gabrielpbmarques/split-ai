import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationEntity } from 'src/infrastructure/database/schema';
import { OrganizationRepository } from 'src/modules/organizations/repositories/organization.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity])],
  providers: [OrganizationRepository],
  exports: [OrganizationRepository],
})
export class OrganizationRepositoryModule {}
