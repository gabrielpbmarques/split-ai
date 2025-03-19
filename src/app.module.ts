import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateTokenModule } from './components/Token/CreateToken/CreateToken.module';
import { DatabaseModule } from './database/database.module';
import { ValidateTokenModule } from './components/Token/ValidateToken/ValidateToken.module';
import { HealthModule } from './health/health.module';
import { CheckActivityTokenNeedModule } from './components/Activity/CheckActivityTokenNeed/CheckActivityTokenNeed.module';
import { CheckEstablishmentFeatureAccessModule } from './components/Establishment/CheckEstablishmentFeatureAccess/CheckEstablishmentFeatureAccess.module';
@Module({
  imports: [
    DatabaseModule,
    CreateTokenModule,
    ValidateTokenModule,
    HealthModule,
    CheckActivityTokenNeedModule,
    CheckEstablishmentFeatureAccessModule,
  ],
  controllers: [],
  providers: [JwtService],
})
export class AppModule {}
