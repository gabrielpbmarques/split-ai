import { Module } from '@nestjs/common';
import { SessionRepositoryModule } from 'src/repositories/session.repository.module';

import { CreateSessionIfNotExistsController } from './create-session-if-not-exists.controller';
import { CreateSessionIfNotExistsService } from './create-session-if-not-exists.service';

@Module({
  imports: [SessionRepositoryModule],
  providers: [CreateSessionIfNotExistsService],
  exports: [CreateSessionIfNotExistsService],
  controllers: [CreateSessionIfNotExistsController],
})
export class CreateSessionIfNotExistsModule {}
