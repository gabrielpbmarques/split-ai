import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { BankAccount, BankAccountSchema } from 'src/schemas/BankAccount.schema';
import { BankAccountRepository } from 'src/repositories/BankAccount.repository';
import { Session, SessionSchema } from 'src/schemas/Session.schema';
import { SessionRepository } from 'src/repositories/Session.repository';
import { Address, AddressSchema } from 'src/schemas/Address.schema';
import { AddressRepository } from 'src/repositories/Address.repository';
import { Phone, PhoneSchema } from 'src/schemas/Phone.schema';
import { PhoneRepository } from 'src/repositories/Phone.repository';
import { User, UserSchema } from 'src/schemas/User.schema';
import { UserRepository } from 'src/repositories/User.repository';
import { Picture, PictureSchema } from 'src/schemas/Picture.schema';
import { PictureRepository } from 'src/repositories/Picture.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
      { name: BankAccount.name, schema: BankAccountSchema },
      { name: Session.name, schema: SessionSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Phone.name, schema: PhoneSchema },
      { name: User.name, schema: UserSchema },
      { name: Picture.name, schema: PictureSchema },
    ]),
  ],
  providers: [
    WorkerRepository,
    BankAccountRepository,
    SessionRepository,
    AddressRepository,
    PhoneRepository,
    UserRepository,
    PictureRepository,
  ],
  exports: [
    WorkerRepository,
    BankAccountRepository,
    SessionRepository,
    AddressRepository,
    PhoneRepository,
    UserRepository,
    PictureRepository,
  ],
})
export class RepositoriesModule {}
