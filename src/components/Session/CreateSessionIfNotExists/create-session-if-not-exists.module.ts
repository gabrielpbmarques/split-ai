import { Module } from '@nestjs/common';
import { CreateSessionIfNotExistsService } from './create-session-if-not-exists.service';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';
import { CreateSessionIfNotExistsController } from './create-session-if-not-exists.controller';

@Module({
  imports: [SupabaseRepositoriesModule],
  providers: [CreateSessionIfNotExistsService],
  exports: [CreateSessionIfNotExistsService],
  controllers: [CreateSessionIfNotExistsController],
})
export class CreateSessionIfNotExistsModule {}
