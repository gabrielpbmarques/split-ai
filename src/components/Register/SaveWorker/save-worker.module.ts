import { Module } from '@nestjs/common';
import { SaveWorkerService } from './save-worker.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { UpdatePhoneNumberModule } from '../UpdatePhoneNumber/update-phone-number.module';
import { UpdateBankAccountModule } from '../UpdateBankAccount/update-bank-account.module';
import { UpdateAddressModule } from '../UpdateAddress/update-address.module';

@Module({
  imports: [
    RepositoriesModule,
    UpdatePhoneNumberModule,
    UpdateBankAccountModule,
    UpdateAddressModule,
  ],
  providers: [SaveWorkerService],
  exports: [SaveWorkerService],
})
export class SaveWorkerModule {}
