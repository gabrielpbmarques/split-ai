import { Module } from '@nestjs/common';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';
import { CreateAgentController } from './create-agent.controller';
import { CreateAgentService } from './create-agent.service';

@Module({
  imports: [SupabaseRepositoriesModule],
  controllers: [CreateAgentController],
  providers: [CreateAgentService],
  exports: [CreateAgentService],
})
export class CreateAgentModule {}
