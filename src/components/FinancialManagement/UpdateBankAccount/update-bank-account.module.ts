import { Module } from '@nestjs/common';
import { UpdateBankAccountService } from 'src/components/FinancialManagement/UpdateBankAccount/update-bank-account.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdateBankAccountService],
  exports: [UpdateBankAccountService],
})
export class UpdateBankAccountModule {}
