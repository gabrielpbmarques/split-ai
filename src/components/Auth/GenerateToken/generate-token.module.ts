import { Module } from '@nestjs/common';
import { UserTokenRepositoryModule } from 'src/repositories/user-token.repository.module';

import { GenerateTokenService } from './generate-token.service';

@Module({
  imports: [UserTokenRepositoryModule],
  providers: [GenerateTokenService],
  exports: [GenerateTokenService],
})
export class GenerateTokenModule {}
