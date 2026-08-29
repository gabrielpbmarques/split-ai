import { Module } from '@nestjs/common';
import { OrganizationRepositoryModule } from 'src/repositories/organization.repository.module';

import { RegenerateEmbedTokenController } from './regenerate-embed-token.controller';
import { RegenerateEmbedTokenService } from './regenerate-embed-token.service';

@Module({
  imports: [OrganizationRepositoryModule],
  controllers: [RegenerateEmbedTokenController],
  providers: [RegenerateEmbedTokenService],
  exports: [RegenerateEmbedTokenService],
})
export class RegenerateEmbedTokenModule {}
