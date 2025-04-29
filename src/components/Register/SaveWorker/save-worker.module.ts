import { Module } from '@nestjs/common';
import { SaveWorkerService } from 'src/components/Register/SaveWorker/save-worker.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { UpdatePhoneNumberModule } from 'src/components/ContactManagement/UpdatePhoneNumber/update-phone-number.module';
import { UpdatePixModule } from 'src/components/FinancialManagement/UpdatePix/update-pix.module';
import { UpdateAddressModule } from 'src/components/ContactManagement/UpdateAddress/update-address.module';
import { UpdateUserService } from 'src/components/UserManagement/UpdateUser/update-user.service';

@Module({
  imports: [
    RepositoriesModule,
    UpdatePhoneNumberModule,
    UpdatePixModule,
    UpdateAddressModule,
  ],
  providers: [SaveWorkerService, UpdateUserService],
  exports: [SaveWorkerService],
})
export class SaveWorkerModule {}
