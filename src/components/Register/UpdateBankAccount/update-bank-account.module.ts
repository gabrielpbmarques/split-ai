import { Module } from '@nestjs/common';
import { UpdateBankAccountService } from './update-bank-account.service';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Worker, WorkerSchema } from 'src/schemas/Worker.schema';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { BankAccountRepository } from 'src/repositories/BankAccount.repository';
import { BankAccount, BankAccountSchema } from 'src/schemas/BankAccount.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Worker.name, schema: WorkerSchema },
      { name: BankAccount.name, schema: BankAccountSchema },
    ]),
  ],
  providers: [
    UpdateBankAccountService,
    WorkerRepository,
    BankAccountRepository,
  ],
  exports: [UpdateBankAccountService],
})
export class UpdateBankAccountModule {}
