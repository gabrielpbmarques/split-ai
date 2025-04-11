import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BankAccountDocument = HydratedDocument<BankAccount>;

@Schema({ timestamps: true })
export class BankAccount {
  @Prop({ type: String, required: true })
  bankCode: string;

  @Prop({ type: String, required: true })
  agency: string;

  @Prop({ type: String, required: true })
  account: string;

  @Prop({ type: String, required: true })
  accountDigit: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  cpf: string;
}

export const BankAccountSchema = SchemaFactory.createForClass(BankAccount);
