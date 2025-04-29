import { Module } from '@nestjs/common';
import { UpdatePhoneNumberService } from 'src/components/ContactManagement/UpdatePhoneNumber/update-phone-number.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdatePhoneNumberService],
  exports: [UpdatePhoneNumberService],
})
export class UpdatePhoneNumberModule {}
