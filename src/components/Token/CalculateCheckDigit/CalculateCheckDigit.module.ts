import { Module } from '@nestjs/common';
import { CalculateCheckDigitService } from './CalculateCheckDigit.service';

@Module({
  providers: [CalculateCheckDigitService],
})
export class CalculateCheckDigitModule {}
