import { Module } from '@nestjs/common';

import { ApiKeyRepositoryModule } from 'src/modules/api-keys/repositories/api-key.repository.module';
import { RevokeApiKeyController } from 'src/modules/api-keys/revoke-api-key/revoke-api-key.controller';
import { RevokeApiKeyService } from 'src/modules/api-keys/revoke-api-key/revoke-api-key.service';

@Module({
  imports: [ApiKeyRepositoryModule],
  controllers: [RevokeApiKeyController],
  providers: [RevokeApiKeyService],
  exports: [RevokeApiKeyService],
})
export class RevokeApiKeyModule {}
