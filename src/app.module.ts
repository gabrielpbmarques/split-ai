import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ComponentsModule } from './components/components.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    ComponentsModule,
    InfrastructureModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
