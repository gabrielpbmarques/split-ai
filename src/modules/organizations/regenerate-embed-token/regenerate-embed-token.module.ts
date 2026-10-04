import { Module } from '@nestjs/common';

import { RegenerateEmbedTokenController } from 'src/modules/organizations/regenerate-embed-token/regenerate-embed-token.controller';
import { RegenerateEmbedTokenService } from 'src/modules/organizations/regenerate-embed-token/regenerate-embed-token.service';
import { OrganizationRepositoryModule } from 'src/modules/organizations/repositories/organization.repository.module';

@Module({
  imports: [OrganizationRepositoryModule],
  controllers: [RegenerateEmbedTokenController],
  providers: [RegenerateEmbedTokenService],
  exports: [RegenerateEmbedTokenService],
})
export class RegenerateEmbedTokenModule {}
