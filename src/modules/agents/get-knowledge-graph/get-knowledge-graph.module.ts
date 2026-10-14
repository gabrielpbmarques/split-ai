import { Module } from '@nestjs/common';

import { GetKnowledgeGraphController } from 'src/modules/agents/get-knowledge-graph/get-knowledge-graph.controller';
import { GetKnowledgeGraphService } from 'src/modules/agents/get-knowledge-graph/get-knowledge-graph.service';
import { AgentRepositoryModule } from 'src/modules/agents/repositories/agent.repository.module';
import { SourceRepositoryModule } from 'src/modules/sources/repositories/source.repository.module';
import { LoadStoreModule } from 'src/modules/store/load-store/load-store.module';

@Module({
  imports: [AgentRepositoryModule, SourceRepositoryModule, LoadStoreModule],
  controllers: [GetKnowledgeGraphController],
  providers: [GetKnowledgeGraphService],
  exports: [GetKnowledgeGraphService],
})
export class GetKnowledgeGraphModule {}
