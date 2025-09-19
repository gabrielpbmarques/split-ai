import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComponentsModule } from 'src/components/components.module';
import { HealthModule } from 'src/health/health.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { config } from './config';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.databaseHost,
      port: parseInt(config.databasePort || '5432', 10),
      username: config.databaseUserName,
      password: config.databasePassword,
      database: config.databaseName,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
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
