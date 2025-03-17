import { ObjectId } from "mongoose";
import { TokenType } from "src/types/TokenType";

export interface Token {
  _id?: ObjectId;
  token: string;
  expiresAt: Date;
  activityId: ObjectId;
  workerId: ObjectId;
  type: TokenType;
  createdAt?: Date;
  updatedAt?: Date;
}
