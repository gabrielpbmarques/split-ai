import { Module } from '@nestjs/common';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';
import { UpdateAgentController } from './update-agent.controller';
import { UpdateAgentService } from './update-agent.service';

@Module({
  imports: [SupabaseRepositoriesModule],
  controllers: [UpdateAgentController],
  providers: [UpdateAgentService],
  exports: [UpdateAgentService],
})
export class UpdateAgentModule {}
