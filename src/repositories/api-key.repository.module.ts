import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyEntity } from 'src/entities';

import { ApiKeyRepository } from './api-key.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity])],
  providers: [ApiKeyRepository],
  exports: [ApiKeyRepository],
})
export class ApiKeyRepositoryModule {}
