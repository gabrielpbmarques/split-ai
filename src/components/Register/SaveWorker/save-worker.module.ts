import { Module } from '@nestjs/common';
import { SaveWorkerService } from './save-worker.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';
import { UpdatePhoneNumberModule } from '../../ContactManagement/UpdatePhoneNumber/update-phone-number.module';
import { UpdatePixModule } from '../../FinancialManagement/UpdatePix/update-pix.module';
import { UpdateAddressModule } from '../../ContactManagement/UpdateAddress/update-address.module';
import { UpdateUserService } from '../../UserManagement/UpdateUser/update-user.service';

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
