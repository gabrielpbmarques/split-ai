import { Module } from '@nestjs/common';
import { UpdateWorkerService } from 'src/components/Register/UpdateWorker/update-worker.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
// Imports dos componentes migrados
import { UpdatePhoneNumberModule } from 'src/components/ContactManagement/UpdatePhoneNumber/update-phone-number.module';
import { UpdateAddressModule } from 'src/components/ContactManagement/UpdateAddress/update-address.module';
import { UpdateBankAccountModule } from 'src/components/FinancialManagement/UpdateBankAccount/update-bank-account.module';
import { SaveSessionModule } from 'src/components/Register/SaveSession/save-session.module';
import { SaveWorkerModule } from 'src/components/Register/SaveWorker/save-worker.module';
import { VerifyExistingUserModule } from 'src/components/UserManagement/VerifyExistingUser/verify-existing-user.module';
import { CreateUserModule } from 'src/components/UserManagement/CreateUser/create-user.module';

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
