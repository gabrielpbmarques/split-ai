import { Module } from '@nestjs/common';
import { CheckActiveTokenService } from './CheckActiveToken.service';

@Module({
  providers: [CheckActiveTokenService],
})
export class CheckActiveTokenModule {}
