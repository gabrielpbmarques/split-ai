import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserTokenRepositoryModule } from 'src/repositories/user-token.repository.module';

import { GenerateTokenService } from './generate-token.service';

@Module({
  imports: [ConfigModule, UserTokenRepositoryModule],
  providers: [GenerateTokenService, JwtService],
  exports: [GenerateTokenService],
})
export class GenerateTokenModule {}
