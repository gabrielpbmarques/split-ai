import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenUsageEntity } from 'src/entities';

import { TokenUsageRepository } from './token-usage.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TokenUsageEntity])],
  providers: [TokenUsageRepository],
  exports: [TokenUsageRepository],
})
export class TokenUsageRepositoryModule {}
