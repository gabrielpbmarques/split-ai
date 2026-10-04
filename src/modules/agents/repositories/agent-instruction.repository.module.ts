import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentInstructionEntity } from 'src/infrastructure/database/schema';
import { AgentInstructionRepository } from 'src/modules/agents/repositories/agent-instruction.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AgentInstructionEntity])],
  providers: [AgentInstructionRepository],
  exports: [AgentInstructionRepository],
})
export class AgentInstructionRepositoryModule {}
