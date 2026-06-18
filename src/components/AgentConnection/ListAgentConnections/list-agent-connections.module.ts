import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { ListAgentConnectionsController } from './list-agent-connections.controller';
import { ListAgentConnectionsService } from './list-agent-connections.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [ListAgentConnectionsController],
  providers: [ListAgentConnectionsService],
  exports: [ListAgentConnectionsService],
})
export class ListAgentConnectionsModule {}
