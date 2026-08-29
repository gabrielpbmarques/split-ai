import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationFeatureEntity } from 'src/entities';

import { OrganizationFeatureRepository } from './organization-feature.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationFeatureEntity])],
  providers: [OrganizationFeatureRepository],
  exports: [OrganizationFeatureRepository],
})
export class OrganizationFeatureRepositoryModule {}
