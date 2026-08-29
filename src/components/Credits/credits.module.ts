import { Module } from '@nestjs/common';

import { ManageCreditsModule } from './ManageCredits/manage-credits.module';

@Module({
  imports: [ManageCreditsModule],
})
export class CreditsModule {}
