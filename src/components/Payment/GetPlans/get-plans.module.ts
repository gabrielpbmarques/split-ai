import { Module } from '@nestjs/common';
import { RepositoriesModule } from 'src/repositories/repositories.module';

import { GetPlansController } from './get-plans.controller';
import { GetPlansService } from './get-plans.service';

@Module({
  imports: [RepositoriesModule],
  providers: [GetPlansService],
  controllers: [GetPlansController],
  exports: [GetPlansService],
})
export class GetPlansModule {}
