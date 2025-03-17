import { Module } from '@nestjs/common';
import { UpdateActivityTokenController } from './update-activity-token.controller';
import { UpdateActivityTokenService } from './UpdateActivityToken.service';

@Module({
  controllers: [UpdateActivityTokenController],
  providers: [UpdateActivityTokenService]
})
export class UpdateActivityTokenModule {}
