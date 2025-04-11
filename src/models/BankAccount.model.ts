export interface BankAccount {
  _id?: string;
  bankCode: string;
  agency: string;
  account: string;
  accountDigit: string;
  type: string;
  name: string;
  cpf: string;
  createdAt: Date;
  updatedAt?: Date;
}
