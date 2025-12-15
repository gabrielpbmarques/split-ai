import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ManageCreditsModule } from '../ManageCredits/manage-credits.module';

import { ConsumeCreditsService } from './consume-credits.service';

@Module({
  imports: [RepositoriesModule, ManageCreditsModule],
  providers: [ConsumeCreditsService],
  exports: [ConsumeCreditsService],
})
export class ConsumeCreditsModule {}
