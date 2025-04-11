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
  ): Promise<BankAccount> {
    const newBankAccount = await this.bankAccountRepository.create(bankAccount);

    await this.workerRepository.update(workerId, {
      bankAccount: newBankAccount._id as unknown as ObjectId,
    });

    return newBankAccount;
  }
}
