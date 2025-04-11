import { Module } from '@nestjs/common';
import { UpdateWorkerService } from './update-worker.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from '../../../schemas/Worker.schema';
import { User, UserSchema } from '../../../schemas/User.schema';
import { Session, SessionSchema } from '../../../schemas/Session.schema';
import { WorkerRepository } from '../../../repositories/Worker.repository';
import { UserRepository } from '../../../repositories/User.repository';
import { SessionRepository } from '../../../repositories/Session.repository';
import { DatabaseModule } from '../../../database/database.module';
import { UpdatePhoneNumberModule } from '../UpdatePhoneNumber/update-phone-number.module';
import { UpdateAddressModule } from '../UpdateAddress/update-address.module';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
      { name: User.name, schema: UserSchema },
      { name: Session.name, schema: SessionSchema },
    ]),
    UpdatePhoneNumberModule,
    UpdateAddressModule,
  ],
  providers: [
    UpdateWorkerService,
    WorkerRepository,
    UserRepository,
    SessionRepository,
  ],
  exports: [UpdateWorkerService],
})
export class UpdateWorkerModule {}
