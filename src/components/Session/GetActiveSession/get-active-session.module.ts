import { Module } from '@nestjs/common';
import { GetActiveSessionService } from './get-active-session.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [GetActiveSessionService],
  exports: [GetActiveSessionService],
})
export class GetActiveSessionModule {}
