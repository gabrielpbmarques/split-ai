import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentConnectionEntity } from 'src/infrastructure/database/schema';
import { AgentConnectionRepository } from 'src/modules/agent-connections/repositories/agent-connection.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AgentConnectionEntity])],
  providers: [AgentConnectionRepository],
  exports: [AgentConnectionRepository],
})
export class AgentConnectionRepositoryModule {}
