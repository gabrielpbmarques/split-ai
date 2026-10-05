import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/auth/auth.module';
import { MIGRATIONS } from 'src/infrastructure/database/migrations';
import { ENTITIES } from 'src/infrastructure/database/schema';
import { useUtcForTimestampColumns } from 'src/infrastructure/database/utc-timestamps';
import { IntegrationModule } from 'src/infrastructure/integration/integration.module';
import { AgentConnectionsModule } from 'src/modules/agent-connections/agent-connections.module';
import { AgentRuntimeModule } from 'src/modules/agent-runtime/agent-runtime.module';
import { AgentRuntimeContractsModule } from 'src/modules/agent-runtime/contracts/agent-runtime-contracts.module';
import { AgentsModule } from 'src/modules/agents/agents.module';
import { AuthFlowsModule } from 'src/modules/auth-flows/auth-flows.module';
import { ChatModule } from 'src/modules/chat/chat.module';
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
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        useUtcForTimestampColumns();
        return {
          type: 'postgres' as const,
          url: env.DATABASE_URL,
          entities: ENTITIES,
          migrations: MIGRATIONS,
          migrationsRun: false,
          synchronize: false,
          poolSize: env.DATABASE_POOL_MAX,
          extra: {
            min: env.DATABASE_POOL_MIN,
            max: env.DATABASE_POOL_MAX,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT_MS,
            statement_timeout: env.DATABASE_STATEMENT_TIMEOUT_MS,
            query_timeout: env.DATABASE_STATEMENT_TIMEOUT_MS,
            idle_in_transaction_session_timeout: 60_000,
            keepAlive: true,
          },
        };
      },
    }),
    ...(env.isTest
      ? []
      : [DevtoolsModule.register({ http: !env.isProduction })]),
    IntegrationModule,
    AuthModule,
    HealthModule,
    AgentConnectionsModule,
    AgentRuntimeModule,
    AgentRuntimeContractsModule,
    AgentsModule,
    AuthFlowsModule,
    ChatModule,
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
