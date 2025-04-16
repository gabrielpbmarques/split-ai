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
    bankAccount: Partial<BankAccount>,
    workerId: string,
    bankAccountId?: string,
  ): Promise<BankAccount> {
    let account: BankAccount;

    const worker = await this.workerRepository.findById(workerId);

    if (!bankAccountId && worker?.bankAccount) {
      bankAccountId = worker.bankAccount.toString();
    }

    const formattedBankAccount = this.formatBankAccountData(
      bankAccount,
      worker,
    );

    if (bankAccountId) {
      account = await this.bankAccountRepository.update(
        bankAccountId,
        formattedBankAccount,
      );
    } else {
      account = await this.bankAccountRepository.create(formattedBankAccount);

      await this.workerRepository.update(workerId, {
        bankAccount: account._id as unknown as ObjectId,
      });
    }

    return account;
  }

  private formatBankAccountData(
    data: Partial<BankAccount>,
    worker?: any,
  ): Partial<BankAccountSchema> {
    const formattedData = {
      bankCode: data.bankCode,
      agency: data.agency,
      account: data.account,
      accountDigit: data.accountDigit,
      type: data.type,
      name: data.name || (worker?.name ?? worker.name.toUpperCase()),
      cpf: data.cpf || worker?.cpf,
    };

    return Object.entries(formattedData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<BankAccount>);
  }
}
