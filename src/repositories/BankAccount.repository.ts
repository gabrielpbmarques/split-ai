import { Injectable } from '@nestjs/common';
import { BankAccount } from 'src/models/BankAccount.model';
import { BankAccount as BankAccountSchema } from 'src/schemas/BankAccount.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { removeMongooseFields } from 'src/utils/mongoose.utils';

export interface IBankAccountRepository {
  create(bankAccount: Partial<BankAccount>): Promise<BankAccount>;
  findOne(query: Partial<BankAccount>): Promise<BankAccount>;
  update(id: string, payload: Partial<BankAccount>): Promise<BankAccount>;
}

@Injectable()
export class BankAccountRepository implements IBankAccountRepository {
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
    // Remove campos imutáveis do MongoDB
    const safePayload = removeMongooseFields(payload);

    return this.bankAccountModel
      .findByIdAndUpdate(id, safePayload, { new: true })
      .exec();
  }
}
