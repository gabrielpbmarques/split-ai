import { Module } from '@nestjs/common';
import { UpdateAddressService } from './update-address.service';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from 'src/schemas/Address.schema';
import { AddressRepository } from 'src/repositories/Address.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Address.name, schema: AddressSchema },
      { name: Worker.name, schema: WorkerSchema },
    ]),
  ],
  providers: [UpdateAddressService, AddressRepository, WorkerRepository],
  exports: [UpdateAddressService],
})
export class UpdateAddressModule {}
