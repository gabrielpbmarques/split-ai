import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourceEntity } from 'src/entities';

import { SourceRepository } from './source.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SourceEntity])],
  providers: [SourceRepository],
  exports: [SourceRepository],
})
export class SourceRepositoryModule {}
