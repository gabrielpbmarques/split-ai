import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureEntity } from 'src/entities';

import { FeatureRepository } from './feature.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureEntity])],
  providers: [FeatureRepository],
  exports: [FeatureRepository],
})
export class FeatureRepositoryModule {}
