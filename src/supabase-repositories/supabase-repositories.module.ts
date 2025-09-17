import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionRepository } from './session.repository';
import { SessionEntity } from 'src/entities/session.entity';
import { MessageEntity } from 'src/entities/message.entity';
import { MessageRepository } from './message.repository';
import { AgentEntity } from 'src/entities/agent.entity';
import { AgentInstructionEntity } from 'src/entities/agent-instruction.entity';
import { AgentRepository } from './agent.repository';
import { AgentInstructionRepository } from './agent-instruction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionEntity,
      MessageEntity,
      AgentEntity,
      AgentInstructionEntity,
    ]),
  ],
  providers: [
    SessionRepository,
    MessageRepository,
    AgentRepository,
    AgentInstructionRepository,
  ],
  exports: [
    SessionRepository,
    MessageRepository,
    AgentRepository,
    AgentInstructionRepository,
  ],
})
export class SupabaseRepositoriesModule {}
