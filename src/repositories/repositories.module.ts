import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { WorkerRepository } from './Worker.repository';
import { BankAccount, BankAccountSchema } from 'src/schemas/BankAccount.schema';
import { BankAccountRepository } from './BankAccount.repository';
import { Session, SessionSchema } from 'src/schemas/Session.schema';
import { SessionRepository } from './Session.repository';
import { Address, AddressSchema } from 'src/schemas/Address.schema';
import { AddressRepository } from './Address.repository';
import { Phone, PhoneSchema } from 'src/schemas/Phone.schema';
import { PhoneRepository } from './Phone.repository';
import { User, UserSchema } from 'src/schemas/User.schema';
import { UserRepository } from './User.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
      { name: BankAccount.name, schema: BankAccountSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Phone.name, schema: PhoneSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [
    WorkerRepository,
    BankAccountRepository,
    SessionRepository,
    AddressRepository,
    PhoneRepository,
    UserRepository,
  ],
  exports: [
    WorkerRepository,
    BankAccountRepository,
    SessionRepository,
    AddressRepository,
    PhoneRepository,
    UserRepository,
  ],
})
export class RepositoriesModule {}
