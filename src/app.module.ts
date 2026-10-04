import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { ComponentsModule } from 'src/components/components.module';
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
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    DevtoolsModule.register({
      http: !env.isProduction,
    }),
    AuthModule,
    HealthModule,
    ComponentsModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class AppModule {}
