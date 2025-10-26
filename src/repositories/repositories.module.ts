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
  ReportEntity,
} from 'src/entities';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

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
  ReportRepository,
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
      ReportEntity,
    ]),
    InfrastructureModule,
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
    ReportRepository,
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
    ReportRepository,
  ],
})
export class RepositoriesModule {}
