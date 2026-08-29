import { Module } from '@nestjs/common';
import { ApiKeyRepositoryModule } from 'src/repositories/api-key.repository.module';

import { RevokeApiKeyController } from './revoke-api-key.controller';
import { RevokeApiKeyService } from './revoke-api-key.service';

@Module({
  imports: [ApiKeyRepositoryModule],
  controllers: [RevokeApiKeyController],
  providers: [RevokeApiKeyService],
  exports: [RevokeApiKeyService],
})
export class RevokeApiKeyModule {}
