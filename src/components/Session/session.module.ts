import { Module } from '@nestjs/common';

import { CreateSessionIfNotExistsModule } from './CreateSessionIfNotExists/create-session-if-not-exists.module';

@Module({
  imports: [CreateSessionIfNotExistsModule],
  exports: [CreateSessionIfNotExistsModule],
})
export class SessionModule {}
