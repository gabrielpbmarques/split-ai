import { Module } from '@nestjs/common';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';
import { ResolveAgentService } from './resolve-agent.service';

@Module({
  imports: [SupabaseRepositoriesModule],
  providers: [ResolveAgentService],
  exports: [ResolveAgentService],
})
export class ResolveAgentModule {}
