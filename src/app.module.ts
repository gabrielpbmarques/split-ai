import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { RegisterModule } from './components/Auth/Register/register.module';
@Module({
  imports: [DatabaseModule, HealthModule, RegisterModule],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
