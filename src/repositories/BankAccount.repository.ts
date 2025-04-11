import { Injectable } from '@nestjs/common';
import { BankAccount as BankAccountSchema } from 'src/schemas/BankAccount.schema';
import { BankAccount } from 'src/models/BankAccount.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class BankAccountRepository {
  constructor(
    @InjectModel(BankAccountSchema.name)
    private readonly bankAccountModel: Model<BankAccount>,
  ) {}

  async create(bankAccount: Partial<BankAccount>): Promise<BankAccount> {
    const newBankAccount = new this.bankAccountModel(bankAccount);
    return newBankAccount.save();
  }

  async findOne(query: Partial<BankAccount>): Promise<BankAccount> {
    return this.bankAccountModel.findOne(query).exec();
  }

  async update(
    id: string,
    payload: Partial<BankAccount>,
  ): Promise<BankAccount> {
    return this.bankAccountModel
      .findByIdAndUpdate(id, payload, { new: true })
      .exec();
  }
}
