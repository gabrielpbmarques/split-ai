import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtService } from '@nestjs/jwt';
import { HealthModule } from 'src/health/health.module';
import { ComponentsModule } from 'src/components/components.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
import { TypeOrmModule } from '@nestjs/typeorm';
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
