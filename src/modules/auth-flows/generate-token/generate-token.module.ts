import { Module } from '@nestjs/common';

import { GenerateTokenService } from 'src/modules/auth-flows/generate-token/generate-token.service';
import { UserTokenRepositoryModule } from 'src/modules/auth-flows/repositories/user-token.repository.module';

@Module({
  imports: [UserTokenRepositoryModule],
  providers: [GenerateTokenService],
  exports: [GenerateTokenService],
})
export class GenerateTokenModule {}
