import { Module } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
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
  providers: [
    JwtService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
