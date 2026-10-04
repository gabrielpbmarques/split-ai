import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth/auth.module';
import { ENTITIES } from 'src/infrastructure/database/schema';
import { AgentConnectionsModule } from 'src/modules/agent-connections/agent-connections.module';
import { AgentRuntimeModule } from 'src/modules/agent-runtime/agent-runtime.module';
import { AgentRuntimeContractsModule } from 'src/modules/agent-runtime/contracts/agent-runtime-contracts.module';
import { AgentsModule } from 'src/modules/agents/agents.module';
import { ApiKeysModule } from 'src/modules/api-keys/api-keys.module';
import { AuthFlowsModule } from 'src/modules/auth-flows/auth-flows.module';
import { BillingModule } from 'src/modules/billing/billing.module';
import { ChatModule } from 'src/modules/chat/chat.module';
import { MembersModule } from 'src/modules/members/members.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';
import { OrganizationsModule } from 'src/modules/organizations/organizations.module';
import { ReportsModule } from 'src/modules/reports/reports.module';
import { RetrievalModule } from 'src/modules/retrieval/retrieval.module';
import { SessionsModule } from 'src/modules/sessions/sessions.module';
import { SourcesModule } from 'src/modules/sources/sources.module';
import { UsersModule } from 'src/modules/users/users.module';
import { VoiceModule } from 'src/modules/voice/voice.module';
import { WhatsappModule } from 'src/modules/whatsapp/whatsapp.module';
import { env } from 'src/shared/config/env';
import { GlobalExceptionFilter } from 'src/shared/http/exception.filter';
import { HealthModule } from 'src/shared/http/health/health.module';
import { AppLoggerModule } from 'src/shared/observability/logger.module';

@Module({
  imports: [
    AppLoggerModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: env.DATABASE_URL,
      entities: ENTITIES,
      synchronize: true,
    }),
    DevtoolsModule.register({
      http: !env.isProduction,
    }),
    AuthModule,
    HealthModule,
    AgentConnectionsModule,
    AgentRuntimeModule,
    AgentRuntimeContractsModule,
    AgentsModule,
    ApiKeysModule,
    AuthFlowsModule,
    BillingModule,
    ChatModule,
    MembersModule,
    NotificationsModule,
    OrganizationsModule,
    ReportsModule,
    RetrievalModule,
    SessionsModule,
    SourcesModule,
    UsersModule,
    VoiceModule,
    WhatsappModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class AppModule {}
