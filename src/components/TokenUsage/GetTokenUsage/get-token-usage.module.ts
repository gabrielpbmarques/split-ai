import { Module } from '@nestjs/common';
import { TokenUsageRepositoryModule } from 'src/repositories/token-usage.repository.module';

import { GetTokenUsageController } from './get-token-usage.controller';
import { GetTokenUsageService } from './get-token-usage.service';

@Module({
  imports: [TokenUsageRepositoryModule],
  controllers: [GetTokenUsageController],
  providers: [GetTokenUsageService],
  exports: [GetTokenUsageService],
})
export class GetTokenUsageModule {}
