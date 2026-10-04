import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureEntity } from 'src/infrastructure/database/schema';
import { FeatureRepository } from 'src/modules/organizations/repositories/feature.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureEntity])],
  providers: [FeatureRepository],
  exports: [FeatureRepository],
})
export class FeatureRepositoryModule {}
