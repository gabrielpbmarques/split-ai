import { Module } from '@nestjs/common';
import { UpdateWorkerService } from './update-worker.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
// Imports dos componentes migrados
import { UpdatePhoneNumberModule } from '../../ContactManagement/UpdatePhoneNumber/update-phone-number.module';
import { UpdateAddressModule } from '../../ContactManagement/UpdateAddress/update-address.module';
import { UpdateBankAccountModule } from '../../FinancialManagement/UpdateBankAccount/update-bank-account.module';
import { SaveSessionModule } from '../SaveSession/save-session.module';
import { SaveWorkerModule } from '../SaveWorker/save-worker.module';
import { VerifyExistingUserModule } from '../../UserManagement/VerifyExistingUser/verify-existing-user.module';
import { CreateUserModule } from '../../UserManagement/CreateUser/create-user.module';

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
