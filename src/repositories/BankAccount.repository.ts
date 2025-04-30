import { Injectable } from '@nestjs/common';
import { BankAccount } from 'src/models/BankAccount.model';
import { BankAccount as BankAccountSchema } from 'src/schemas/BankAccount.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { flatten } from 'src/utils/mongoose.utils';

export interface IBankAccountRepository {
  create(bankAccount: Partial<BankAccount>): Promise<BankAccount | null>;
  findOne(query: Partial<BankAccount>): Promise<BankAccount | null>;
  update(
    id: string,
    payload: Partial<BankAccount>,
  ): Promise<BankAccount | null>;
}

@Injectable()
export class BankAccountRepository implements IBankAccountRepository {
  constructor(
    @InjectModel(BankAccountSchema.name)
    private readonly bankAccountModel: Model<BankAccount>,
  ) {}

  async create(bankAccount: Partial<BankAccount>): Promise<BankAccount | null> {
    const newBankAccount = new this.bankAccountModel(bankAccount);
    const createdBankAccount = await newBankAccount.save();
    return createdBankAccount
      ? (createdBankAccount.toObject() as unknown as BankAccount)
      : null;
  }

  async findOne(query: Partial<BankAccount>): Promise<BankAccount | null> {
    const bankAccount = await this.bankAccountModel.findOne(query).exec();
    return bankAccount
      ? (bankAccount.toObject() as unknown as BankAccount)
      : null;
  }

  async update(
    id: string,
    payload: Partial<BankAccount>,
  ): Promise<BankAccount | null> {
    // Remove campos imutáveis do MongoDB no nível raiz apenas
    const { _id, __v, createdAt, updatedAt, ...safePayload } = payload as any;

    const updatedBankAccount = await this.bankAccountModel
      .findByIdAndUpdate(id, { $set: flatten(safePayload) }, { new: true })
      .exec();

    return updatedBankAccount
      ? (updatedBankAccount.toObject() as unknown as BankAccount)
      : null;
  }
}
