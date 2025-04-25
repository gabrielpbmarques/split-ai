import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { HealthModule } from 'src/health/health.module';
import { ComponentsModule } from 'src/components/components.module';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';
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
