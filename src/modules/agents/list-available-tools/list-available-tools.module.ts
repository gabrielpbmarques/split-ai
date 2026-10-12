import { Module } from '@nestjs/common';

import { ListAvailableToolsController } from 'src/modules/agents/list-available-tools/list-available-tools.controller';
import { ListAvailableToolsService } from 'src/modules/agents/list-available-tools/list-available-tools.service';

@Module({
  controllers: [ListAvailableToolsController],
  providers: [ListAvailableToolsService],
  exports: [ListAvailableToolsService],
})
export class ListAvailableToolsModule {}
