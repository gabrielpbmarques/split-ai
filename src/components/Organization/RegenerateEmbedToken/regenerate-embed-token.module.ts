import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { RegenerateEmbedTokenController } from './regenerate-embed-token.controller';
import { RegenerateEmbedTokenService } from './regenerate-embed-token.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [RegenerateEmbedTokenController],
  providers: [RegenerateEmbedTokenService],
  exports: [RegenerateEmbedTokenService],
})
export class RegenerateEmbedTokenModule {}
