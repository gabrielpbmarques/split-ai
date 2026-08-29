import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentEntity } from 'src/entities';

import { AgentRepository } from './agent.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AgentEntity])],
  providers: [AgentRepository],
  exports: [AgentRepository],
})
export class AgentRepositoryModule {}
