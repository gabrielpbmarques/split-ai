import { Module } from '@nestjs/common';
import { ApiKeyRepositoryModule } from 'src/repositories/api-key.repository.module';

import { CreateApiKeyController } from './create-api-key.controller';
import { CreateApiKeyService } from './create-api-key.service';

@Module({
  imports: [ApiKeyRepositoryModule],
  controllers: [CreateApiKeyController],
  providers: [CreateApiKeyService],
  exports: [CreateApiKeyService],
})
export class CreateApiKeyModule {}
