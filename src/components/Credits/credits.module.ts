import { Module } from '@nestjs/common';

import { ConsumeCreditsModule } from './ConsumeCredits/consume-credits.module';
import { ManageCreditsModule } from './ManageCredits/manage-credits.module';

@Module({
  imports: [ConsumeCreditsModule, ManageCreditsModule],
  exports: [ConsumeCreditsModule, ManageCreditsModule],
})
export class CreditsModule {}
