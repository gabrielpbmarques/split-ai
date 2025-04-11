import { Module } from '@nestjs/common';
import { UpdatePhoneNumberService } from './update-phone-number.service';
import { DatabaseModule } from 'src/database/database.module';
import { PhoneRepository } from 'src/repositories/Phone.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { Phone, PhoneSchema } from 'src/schemas/Phone.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
      { name: Phone.name, schema: PhoneSchema },
    ]),
  ],
  providers: [UpdatePhoneNumberService, PhoneRepository, WorkerRepository],
  exports: [UpdatePhoneNumberService],
})
export class UpdatePhoneNumberModule {}
