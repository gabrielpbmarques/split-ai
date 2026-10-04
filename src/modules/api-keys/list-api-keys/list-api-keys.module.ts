import { Module } from '@nestjs/common';

import { ListApiKeysController } from 'src/modules/api-keys/list-api-keys/list-api-keys.controller';
import { ListApiKeysService } from 'src/modules/api-keys/list-api-keys/list-api-keys.service';
import { ApiKeyRepositoryModule } from 'src/modules/api-keys/repositories/api-key.repository.module';

@Module({
  imports: [ApiKeyRepositoryModule],
  controllers: [ListApiKeysController],
  providers: [ListApiKeysService],
  exports: [ListApiKeysService],
})
export class ListApiKeysModule {}
