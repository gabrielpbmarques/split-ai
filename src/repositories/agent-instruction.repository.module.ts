import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentInstructionEntity } from 'src/entities';

import { AgentInstructionRepository } from './agent-instruction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AgentInstructionEntity])],
  providers: [AgentInstructionRepository],
  exports: [AgentInstructionRepository],
})
export class AgentInstructionRepositoryModule {}
