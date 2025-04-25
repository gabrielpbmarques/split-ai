import { ObjectId } from 'mongoose';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  type?: string; // 'worker', 'admin', etc.
  validationCode?: string | null;
  permissions?: string[];
  isRemoved?: boolean;
  removedAt?: Date | null;
  workerId?: string;
  profilePictureId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
