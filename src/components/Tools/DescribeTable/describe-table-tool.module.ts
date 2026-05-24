import { Module } from '@nestjs/common';
import { InfrastructureModule } from 'src/infrastructure/infrastructure.module';

import { DescribeTableToolService } from './describe-table-tool.service';

@Module({
  imports: [InfrastructureModule],
  providers: [DescribeTableToolService],
  exports: [DescribeTableToolService],
})
export class DescribeTableToolModule {}
