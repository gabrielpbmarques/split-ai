export interface Phone {
  _id?: string;
  countryCode: string;
  areaCode: string;
  number: string;
  createdAt: Date;
  updatedAt?: Date;
}
