import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentEntity } from 'src/infrastructure/database/schema';
import { AgentRepository } from 'src/modules/agents/repositories/agent.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity])],
  providers: [AgentRepository],
  exports: [AgentRepository],
})
export class AgentRepositoryModule {}
