import { Module } from '@nestjs/common';
import { SaveWorkerService } from './save-worker.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { UpdatePhoneNumberModule } from '../UpdatePhoneNumber/update-phone-number.module';
import { UpdateBankAccountModule } from '../UpdateBankAccount/update-bank-account.module';
import { UpdateAddressModule } from '../UpdateAddress/update-address.module';
import { UpdateUserService } from '../UpdateUser/update-user.service';

@Module({
  imports: [
    RepositoriesModule,
    UpdatePhoneNumberModule,
    UpdateBankAccountModule,
    UpdateAddressModule,
  ],
  providers: [SaveWorkerService, UpdateUserService],
  exports: [SaveWorkerService],
})
export class SaveWorkerModule {}
