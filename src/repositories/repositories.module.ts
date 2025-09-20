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

import {
  AgentInstructionRepository,
  AgentRepository,
  MessageRepository,
  NotificationRepository,
  OrganizationRepository,
  SessionRepository,
  SmsVerificationRepository,
  UserRepository,
  UserTokenRepository,
} from '.';

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
