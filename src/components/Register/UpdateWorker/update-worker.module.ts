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
import { UpdateBankAccountModule } from '../UpdateBankAccount/update-bank-account.module';
import { SaveSessionModule } from '../SaveSession/save-session.module';
import { SaveWorkerModule } from '../SaveWorker/save-worker.module';
import { VerifyExistingUserModule } from '../VerifyExistingUser/verify-existing-user.module';
import { CreateUserModule } from '../CreateUser/create-user.module';

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
    UpdateBankAccountModule,
    SaveSessionModule,
    SaveWorkerModule,
    VerifyExistingUserModule,
    CreateUserModule,
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
