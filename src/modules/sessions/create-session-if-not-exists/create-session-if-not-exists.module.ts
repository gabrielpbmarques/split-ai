import { Module } from '@nestjs/common';

import { CreateSessionIfNotExistsController } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.controller';
import { CreateSessionIfNotExistsService } from 'src/modules/sessions/create-session-if-not-exists/create-session-if-not-exists.service';
import { SessionRepositoryModule } from 'src/modules/sessions/repositories/session.repository.module';

@Module({
  imports: [SessionRepositoryModule],
  providers: [CreateSessionIfNotExistsService],
  exports: [CreateSessionIfNotExistsService],
  controllers: [CreateSessionIfNotExistsController],
})
export class CreateSessionIfNotExistsModule {}
