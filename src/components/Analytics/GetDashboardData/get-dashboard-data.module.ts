import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetDashboardDataController } from './get-dashboard-data.controller';
import { GetDashboardDataService } from './get-dashboard-data.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetDashboardDataService],
  exports: [GetDashboardDataService],
  controllers: [GetDashboardDataController],
})
export class GetDashboardDataModule {}
