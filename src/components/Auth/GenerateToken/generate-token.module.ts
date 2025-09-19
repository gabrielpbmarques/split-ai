import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GenerateTokenService } from './generate-token.service';

@Module({
  imports: [RepositoriesModule, ConfigModule],
  providers: [GenerateTokenService, JwtService],
  exports: [GenerateTokenService],
})
export class GenerateTokenModule {}
