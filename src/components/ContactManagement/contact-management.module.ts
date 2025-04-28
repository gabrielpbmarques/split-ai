import { Module } from '@nestjs/common';
import { UpdateAddressModule } from './UpdateAddress/update-address.module';
import { UpdatePhoneNumberModule } from './UpdatePhoneNumber/update-phone-number.module';

@Module({
  imports: [UpdateAddressModule, UpdatePhoneNumberModule],
  exports: [UpdateAddressModule, UpdatePhoneNumberModule],
})
export class ContactManagementModule {}
