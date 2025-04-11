export interface Address {
  _id?: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  cityCode: string;
  createdAt: Date;
  updatedAt?: Date;
}
