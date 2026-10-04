import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TokenUsageEntity } from 'src/infrastructure/database/schema';
import { TokenUsageRepository } from 'src/modules/billing/repositories/token-usage.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TokenUsageEntity])],
  providers: [TokenUsageRepository],
  exports: [TokenUsageRepository],
})
export class TokenUsageRepositoryModule {}
