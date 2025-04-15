import { Module } from '@nestjs/common';
import { UpdateAddressService } from './update-address.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdateAddressService],
  exports: [UpdateAddressService],
})
export class UpdateAddressModule {}
