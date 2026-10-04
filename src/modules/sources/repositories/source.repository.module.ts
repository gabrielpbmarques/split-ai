import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SourceEntity } from 'src/infrastructure/database/schema';
import { SourceRepository } from 'src/modules/sources/repositories/source.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SourceEntity])],
  providers: [SourceRepository],
  exports: [SourceRepository],
})
export class SourceRepositoryModule {}
