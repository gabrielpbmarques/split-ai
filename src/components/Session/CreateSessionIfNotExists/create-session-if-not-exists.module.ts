import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { CreateSessionIfNotExistsController } from './create-session-if-not-exists.controller';
import { CreateSessionIfNotExistsService } from './create-session-if-not-exists.service';

@Module({
  imports: [RepositoriesModule],
  providers: [CreateSessionIfNotExistsService],
  exports: [CreateSessionIfNotExistsService],
  controllers: [CreateSessionIfNotExistsController],
})
export class CreateSessionIfNotExistsModule {}
