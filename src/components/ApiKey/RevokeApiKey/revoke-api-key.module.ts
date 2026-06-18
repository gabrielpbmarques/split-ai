import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { RevokeApiKeyController } from './revoke-api-key.controller';
import { RevokeApiKeyService } from './revoke-api-key.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [RevokeApiKeyController],
  providers: [RevokeApiKeyService],
  exports: [RevokeApiKeyService],
})
export class RevokeApiKeyModule {}
