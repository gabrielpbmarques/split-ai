import { Module } from '@nestjs/common';
import { SaveWorkerService } from './save-worker.service';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { DatabaseModule } from 'src/database/database.module';
import { UpdatePhoneNumberModule } from '../UpdatePhoneNumber/update-phone-number.module';
import { UpdateBankAccountModule } from '../UpdateBankAccount/update-bank-account.module';
import { UpdateAddressModule } from '../UpdateAddress/update-address.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Worker.name, schema: WorkerSchema }]),
    UpdatePhoneNumberModule,
    UpdateBankAccountModule,
    UpdateAddressModule,
  ],
  providers: [SaveWorkerService, WorkerRepository],
  exports: [SaveWorkerService],
})
export class SaveWorkerModule {}
