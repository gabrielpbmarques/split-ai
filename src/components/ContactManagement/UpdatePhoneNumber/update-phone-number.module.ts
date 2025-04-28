import { Module } from '@nestjs/common';
import { UpdatePhoneNumberService } from './update-phone-number.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdatePhoneNumberService],
  exports: [UpdatePhoneNumberService],
})
export class UpdatePhoneNumberModule {}
