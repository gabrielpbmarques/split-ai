import { Module } from '@nestjs/common';
import { GetActiveSessionService } from './get-active-session.service';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';

@Module({
  imports: [SupabaseRepositoriesModule],
  providers: [GetActiveSessionService],
  exports: [GetActiveSessionService],
})
export class GetActiveSessionModule {}
