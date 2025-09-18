import { Module } from '@nestjs/common';
import { ListAgentsController } from './list-agents.controller';
import { ListAgentsService } from './list-agents.service';
import { SupabaseRepositoriesModule } from 'src/supabase-repositories/supabase-repositories.module';

@Module({
  imports: [SupabaseRepositoriesModule],
  controllers: [ListAgentsController],
  providers: [ListAgentsService],
  exports: [ListAgentsService],
})
export class ListAgentsModule {}
