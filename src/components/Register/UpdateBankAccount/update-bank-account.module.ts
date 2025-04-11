import { Module } from '@nestjs/common';
import { UpdateBankAccountService } from './update-bank-account.service';

@Module({
  providers: [UpdateBankAccountService],
})
export class UpdateBankAccountModule {}
