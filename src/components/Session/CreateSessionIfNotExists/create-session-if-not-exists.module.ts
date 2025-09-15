import { Module } from '@nestjs/common';
import { CreateSessionIfNotExistsService } from './create-session-if-not-exists.service';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';

@Module({
  imports: [SupabaseRepositoriesModule],
  providers: [CreateSessionIfNotExistsService],
  exports: [CreateSessionIfNotExistsService],
})
export class CreateSessionIfNotExistsModule {}
