import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentConnectionEntity } from 'src/entities';

import { AgentConnectionRepository } from './agent-connection.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AgentConnectionEntity])],
  providers: [AgentConnectionRepository],
  exports: [AgentConnectionRepository],
})
export class AgentConnectionRepositoryModule {}
