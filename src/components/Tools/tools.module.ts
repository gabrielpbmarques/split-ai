import { Module } from '@nestjs/common';

import { BusinessContextToolModule } from './BusinessContext/business-context-tool.module';
import { DescribeTableToolModule } from './DescribeTable/describe-table-tool.module';
import { ExecuteSqlToolModule } from './ExecuteSql/execute-sql-tool.module';
import { ExploreSchemaToolModule } from './ExploreSchema/explore-schema-tool.module';
import { ValidateSqlToolModule } from './ValidateSql/validate-sql-tool.module';

@Module({
  imports: [
    ExploreSchemaToolModule,
    DescribeTableToolModule,
    ValidateSqlToolModule,
    ExecuteSqlToolModule,
    BusinessContextToolModule,
  ],
  exports: [
    ExploreSchemaToolModule,
    DescribeTableToolModule,
    ValidateSqlToolModule,
    ExecuteSqlToolModule,
    BusinessContextToolModule,
  ],
})
export class ToolsModule {}
