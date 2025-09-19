import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListAgentsController } from './list-agents.controller';
import { ListAgentsService } from './list-agents.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [ListAgentsController],
  providers: [ListAgentsService],
  exports: [ListAgentsService],
})
export class ListAgentsModule {}
