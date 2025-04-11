import { Injectable } from '@nestjs/common';
import { BankAccountRepository } from 'src/repositories/BankAccount.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { BankAccount as BankAccountSchema } from 'src/schemas/BankAccount.schema';
import { BankAccount } from 'src/models/BankAccount.model';
import { ObjectId } from 'mongoose';

@Injectable()
export class UpdateBankAccountService {
  constructor(
    private readonly bankAccountRepository: BankAccountRepository,
    private readonly workerRepository: WorkerRepository,
  ) {}

  async execute(
    bankAccount: Partial<BankAccountSchema>,
    workerId: string,
    bankAccountId?: string,
  ): Promise<BankAccount> {
    let account: BankAccount;

    if (bankAccountId) {
      account = await this.bankAccountRepository.update(
        bankAccountId,
        bankAccount,
      );
    } else {
      account = await this.bankAccountRepository.create(bankAccount);
      await this.workerRepository.update(workerId, {
        bankAccount: account._id as unknown as ObjectId,
      });
    }

    return account;
  }
}
