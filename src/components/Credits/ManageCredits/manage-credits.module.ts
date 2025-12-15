import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ManageCreditsService } from './manage-credits.service';

@Module({
  imports: [RepositoriesModule],
  providers: [ManageCreditsService],
  exports: [ManageCreditsService],
})
export class ManageCreditsModule {}
