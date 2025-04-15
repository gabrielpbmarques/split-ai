import { Module } from '@nestjs/common';
import { FindOrCreateSessionService } from './find-or-create-session.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { SaveSessionService } from '../SaveSession/save-session.service';

@Module({
  imports: [RepositoriesModule],
  providers: [FindOrCreateSessionService, SaveSessionService],
  exports: [FindOrCreateSessionService],
})
export class FindOrCreateSessionModule {}
