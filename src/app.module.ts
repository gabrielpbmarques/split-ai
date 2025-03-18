import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateTokenModule } from './components/Token/CreateToken/CreateToken.module';
import { DatabaseModule } from './database/database.module';
import { ValidateTokenModule } from './components/Token/ValidateToken/ValidateToken.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    DatabaseModule,
    CreateTokenModule,
    ValidateTokenModule,
    HealthModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
