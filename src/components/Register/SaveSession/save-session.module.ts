import { Module } from '@nestjs/common';
import { SaveSessionService } from 'src/components/Register/SaveSession/save-session.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [SaveSessionService],
  exports: [SaveSessionService],
})
export class SaveSessionModule {}
