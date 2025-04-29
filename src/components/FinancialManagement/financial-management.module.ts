import { Module } from '@nestjs/common';
import { UpdateBankAccountModule } from 'src/components/FinancialManagement/UpdateBankAccount/update-bank-account.module';
import { UpdatePixModule } from 'src/components/FinancialManagement/UpdatePix/update-pix.module';

@Module({
  imports: [UpdateBankAccountModule, UpdatePixModule],
  exports: [UpdateBankAccountModule, UpdatePixModule],
})
export class FinancialManagementModule {}
