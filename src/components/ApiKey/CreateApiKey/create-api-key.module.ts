import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateApiKeyController } from './create-api-key.controller';
import { CreateApiKeyService } from './create-api-key.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [CreateApiKeyController],
  providers: [CreateApiKeyService],
  exports: [CreateApiKeyService],
})
export class CreateApiKeyModule {}
