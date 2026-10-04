import { Module } from '@nestjs/common';

import { GetTokenUsageController } from 'src/modules/billing/get-token-usage/get-token-usage.controller';
import { GetTokenUsageService } from 'src/modules/billing/get-token-usage/get-token-usage.service';
import { TokenUsageRepositoryModule } from 'src/modules/billing/repositories/token-usage.repository.module';

@Module({
  imports: [TokenUsageRepositoryModule],
  controllers: [GetTokenUsageController],
  providers: [GetTokenUsageService],
  exports: [GetTokenUsageService],
})
export class GetTokenUsageModule {}
