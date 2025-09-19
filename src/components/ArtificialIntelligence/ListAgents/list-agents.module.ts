import { Module } from '@nestjs/common';
import { ListAgentsController } from './list-agents.controller';
import { ListAgentsService } from './list-agents.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [ListAgentsController],
  providers: [ListAgentsService],
  exports: [ListAgentsService],
})
export class ListAgentsModule {}
