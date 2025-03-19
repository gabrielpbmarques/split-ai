import { Module } from '@nestjs/common';
import { CheckActivityTokenNeedService } from './check-activity-token-need.service';
import { CheckActivityTokenNeedController } from './check-activity-token-need.controller';

@Module({
  providers: [CheckActivityTokenNeedService],
  controllers: [CheckActivityTokenNeedController],
})
export class CheckActivityTokenNeedModule {}
