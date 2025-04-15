import { Module } from '@nestjs/common';
import { UpdateWorkerService } from './update-worker.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { UpdatePhoneNumberModule } from '../UpdatePhoneNumber/update-phone-number.module';
import { UpdateAddressModule } from '../UpdateAddress/update-address.module';
import { UpdateBankAccountModule } from '../UpdateBankAccount/update-bank-account.module';
import { SaveSessionModule } from '../SaveSession/save-session.module';
import { SaveWorkerModule } from '../SaveWorker/save-worker.module';
import { VerifyExistingUserModule } from '../VerifyExistingUser/verify-existing-user.module';
import { CreateUserModule } from '../CreateUser/create-user.module';

@Module({
  imports: [
    RepositoriesModule,
    UpdatePhoneNumberModule,
    UpdateAddressModule,
    UpdateBankAccountModule,
    SaveSessionModule,
    SaveWorkerModule,
    VerifyExistingUserModule,
    CreateUserModule,
  ],
  providers: [UpdateWorkerService],
  exports: [UpdateWorkerService],
})
export class UpdateWorkerModule {}
