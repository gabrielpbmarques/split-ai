import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiKeyEntity } from 'src/infrastructure/database/schema';
import { ApiKeyRepository } from 'src/modules/api-keys/repositories/api-key.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKeyEntity])],
  providers: [ApiKeyRepository],
  exports: [ApiKeyRepository],
})
export class ApiKeyRepositoryModule {}
