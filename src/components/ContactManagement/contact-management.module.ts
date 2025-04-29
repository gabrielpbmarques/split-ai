import { Module } from '@nestjs/common';
import { UpdateAddressModule } from 'src/components/ContactManagement/UpdateAddress/update-address.module';
import { UpdatePhoneNumberModule } from 'src/components/ContactManagement/UpdatePhoneNumber/update-phone-number.module';

@Module({
  imports: [UpdateAddressModule, UpdatePhoneNumberModule],
  exports: [UpdateAddressModule, UpdatePhoneNumberModule],
})
export class ContactManagementModule {}
