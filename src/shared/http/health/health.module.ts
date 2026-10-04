import { Module } from '@nestjs/common';
import { DatabaseHealthIndicator } from 'src/shared/http/health/database.health';
import { HealthLiveController } from 'src/shared/http/health/health-live.controller';
import { HealthReadyController } from 'src/shared/http/health/health-ready.controller';
import { HealthStartupController } from 'src/shared/http/health/health-startup.controller';
import { MemoryHealthIndicator } from 'src/shared/http/health/memory.health';

@Module({
  controllers: [
    HealthStartupController,
    HealthLiveController,
    HealthReadyController,
  ],
  providers: [DatabaseHealthIndicator, MemoryHealthIndicator],
})
export class HealthModule {}
