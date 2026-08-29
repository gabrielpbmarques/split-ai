import { Module } from '@nestjs/common';

import { CreateApiKeyModule } from './CreateApiKey/create-api-key.module';
import { ListApiKeysModule } from './ListApiKeys/list-api-keys.module';
import { RevokeApiKeyModule } from './RevokeApiKey/revoke-api-key.module';

@Module({
  imports: [CreateApiKeyModule, ListApiKeysModule, RevokeApiKeyModule],
})
export class ApiKeyModule {}
