import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentsModule } from 'src/components/components.module';
import { HealthModule } from 'src/health/health.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { config } from './config';
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: config.databaseUrl,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    HealthModule,
    ComponentsModule,
    InfrastructureModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
