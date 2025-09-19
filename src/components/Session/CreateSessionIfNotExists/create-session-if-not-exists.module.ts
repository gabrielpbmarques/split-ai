import { Module } from '@nestjs/common';
import { CreateSessionIfNotExistsService } from './create-session-if-not-exists.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { CreateSessionIfNotExistsController } from './create-session-if-not-exists.controller';

@Module({
  imports: [RepositoriesModule],
  providers: [CreateSessionIfNotExistsService],
  exports: [CreateSessionIfNotExistsService],
  controllers: [CreateSessionIfNotExistsController],
})
export class CreateSessionIfNotExistsModule {}
