import { ObjectId } from "mongoose";

export interface User {
  readonly id: ObjectId;

  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  document?: string;
  insertedAt: Date;
  updatedAt: Date;
}
