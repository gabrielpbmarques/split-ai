import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
@Module({
  imports: [DatabaseModule, HealthModule],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
