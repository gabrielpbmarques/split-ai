import { Module } from '@nestjs/common';
import { CreateSessionIfNotExistsModule } from './CreateSessionIfNotExists/create-session-if-not-exists.module';
import { GetActiveSessionModule } from './GetActiveSession/get-active-session.module';

@Module({
  imports: [CreateSessionIfNotExistsModule, GetActiveSessionModule],
  exports: [CreateSessionIfNotExistsModule, GetActiveSessionModule],
})
export class SessionModule {}
