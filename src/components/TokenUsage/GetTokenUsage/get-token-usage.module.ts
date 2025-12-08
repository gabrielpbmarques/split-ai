import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetTokenUsageController } from './get-token-usage.controller';
import { GetTokenUsageService } from './get-token-usage.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [GetTokenUsageController],
  providers: [GetTokenUsageService],
  exports: [GetTokenUsageService],
})
export class GetTokenUsageModule {}
