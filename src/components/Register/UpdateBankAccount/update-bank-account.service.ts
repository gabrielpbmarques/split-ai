import { Injectable, Logger } from '@nestjs/common';
import { BankAccountRepository } from 'src/repositories/BankAccount.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { BankAccount as BankAccountSchema } from 'src/schemas/BankAccount.schema';
import { BankAccount } from 'src/models/BankAccount.model';
import { ObjectId } from 'mongoose';

@Injectable()
export class UpdateBankAccountService {
  private readonly logger = new Logger(UpdateBankAccountService.name);
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

    // Buscar worker e verificar se já tem conta bancária associada
    const worker = await this.workerRepository.findById(workerId);
    this.logger.debug(
      `UpdateBankAccountService: worker encontrado: ${worker?._id}, bankAccount: ${worker?.bankAccount}`,
    );

    // Se o worker já tem uma conta bancária mas não recebemos o bankAccountId, use a conta existente
    if (!bankAccountId && worker?.bankAccount) {
      this.logger.debug(
        `UpdateBankAccountService: Usando conta bancária existente do worker: ${worker.bankAccount}`,
      );
      bankAccountId = worker.bankAccount.toString();
    }

    const formattedBankAccount = this.formatBankAccountData(
      bankAccount,
      worker,
    );
    this.logger.debug(
      `UpdateBankAccountService: dados formatados: ${JSON.stringify(formattedBankAccount)}`,
    );

    if (bankAccountId) {
      this.logger.debug(
        `UpdateBankAccountService: Atualizando conta bancária existente: ${bankAccountId}`,
      );
      account = await this.bankAccountRepository.update(
        bankAccountId,
        formattedBankAccount,
      );
    } else {
      this.logger.debug(
        `UpdateBankAccountService: Criando nova conta bancária para worker: ${workerId}`,
      );
      account = await this.bankAccountRepository.create(formattedBankAccount);

      // Garante que o worker tenha a referência para a conta bancária
      this.logger.debug(
        `UpdateBankAccountService: Vinculando conta bancária ${account._id} ao worker ${workerId}`,
      );
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
