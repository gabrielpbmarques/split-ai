import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserEntity,
  OrganizationEntity,
  UserTokenEntity,
  SmsVerificationEntity,
  NotificationEntity,
  SessionEntity,
  MessageEntity,
  AgentEntity,
  AgentInstructionEntity,
} from 'src/entities';

import { NotificationRepository } from './notification.repository';
import { OrganizationRepository } from './organization.repository';
import { SmsVerificationRepository } from './sms-verification.repository';
import { UserTokenRepository } from './user-token.repository';
import { UserRepository } from './user.repository';
import { SessionRepository } from './session.repository';
import { MessageRepository } from './message.repository';
import { AgentRepository } from './agent.repository';
import { AgentInstructionRepository } from './agent-instruction.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      OrganizationEntity,
      UserTokenEntity,
      SmsVerificationEntity,
      NotificationEntity,
      SessionEntity,
      MessageEntity,
      AgentEntity,
      AgentInstructionEntity,
    ]),
  ],
  providers: [
    OrganizationRepository,
    UserRepository,
    UserTokenRepository,
    SmsVerificationRepository,
    NotificationRepository,
    SessionRepository,
    MessageRepository,
    AgentRepository,
    AgentInstructionRepository,
  ],
  exports: [
    OrganizationRepository,
    UserRepository,
    UserTokenRepository,
    SmsVerificationRepository,
    NotificationRepository,
    SessionRepository,
    MessageRepository,
    AgentRepository,
    AgentInstructionRepository,
  ],
})
export class RepositoriesModule {}
