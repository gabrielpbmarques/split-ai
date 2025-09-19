import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetActiveSessionService } from './get-active-session.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetActiveSessionService],
  exports: [GetActiveSessionService],
})
export class GetActiveSessionModule {}
