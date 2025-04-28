import { Module } from '@nestjs/common';
import { UpdateBankAccountModule } from './UpdateBankAccount/update-bank-account.module';
import { UpdatePixModule } from './UpdatePix/update-pix.module';

@Module({
  imports: [UpdateBankAccountModule, UpdatePixModule],
  exports: [UpdateBankAccountModule, UpdatePixModule],
})
export class FinancialManagementModule {}
