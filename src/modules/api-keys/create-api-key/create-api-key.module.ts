import { Module } from '@nestjs/common';

import { CreateApiKeyController } from 'src/modules/api-keys/create-api-key/create-api-key.controller';
import { CreateApiKeyService } from 'src/modules/api-keys/create-api-key/create-api-key.service';
import { ApiKeyRepositoryModule } from 'src/modules/api-keys/repositories/api-key.repository.module';

@Module({
  imports: [ApiKeyRepositoryModule],
  controllers: [CreateApiKeyController],
  providers: [CreateApiKeyService],
  exports: [CreateApiKeyService],
})
export class CreateApiKeyModule {}
