import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationFeatureEntity } from 'src/infrastructure/database/schema';
import { OrganizationFeatureRepository } from 'src/modules/organizations/repositories/organization-feature.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationFeatureEntity])],
  providers: [OrganizationFeatureRepository],
  exports: [OrganizationFeatureRepository],
})
export class OrganizationFeatureRepositoryModule {}
