import { Module } from '@nestjs/common';
import { ApiKeyRepositoryModule } from 'src/repositories/api-key.repository.module';

import { ListApiKeysController } from './list-api-keys.controller';
import { ListApiKeysService } from './list-api-keys.service';

@Module({
  imports: [ApiKeyRepositoryModule],
  controllers: [ListApiKeysController],
  providers: [ListApiKeysService],
  exports: [ListApiKeysService],
})
export class ListApiKeysModule {}
