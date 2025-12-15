import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetCreditsController } from './get-credits.controller';
import { GetCreditsService } from './get-credits.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetCreditsService],
  controllers: [GetCreditsController],
  exports: [GetCreditsService],
})
export class GetCreditsModule {}
