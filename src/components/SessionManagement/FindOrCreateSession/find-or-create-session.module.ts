import { Module } from '@nestjs/common';
import { FindOrCreateSessionService } from 'src/components/SessionManagement/FindOrCreateSession/find-or-create-session.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { SaveSessionService } from 'src/components/Register/SaveSession/save-session.service';

@Module({
  imports: [RepositoriesModule],
  providers: [FindOrCreateSessionService, SaveSessionService],
  exports: [FindOrCreateSessionService],
})
export class FindOrCreateSessionModule {}
