import { Module } from '@nestjs/common';

import { CreateApiKeyModule } from 'src/modules/api-keys/create-api-key/create-api-key.module';
import { ListApiKeysModule } from 'src/modules/api-keys/list-api-keys/list-api-keys.module';
import { RevokeApiKeyModule } from 'src/modules/api-keys/revoke-api-key/revoke-api-key.module';

@Module({
  imports: [CreateApiKeyModule, ListApiKeysModule, RevokeApiKeyModule],
  exports: [CreateApiKeyModule, ListApiKeysModule, RevokeApiKeyModule],
})
export class ApiKeysModule {}
