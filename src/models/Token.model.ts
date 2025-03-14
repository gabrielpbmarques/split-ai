import { ObjectId } from "mongoose";

export interface Token {
  _id?: ObjectId;
  token: string;
  expiresAt: Date;
  activityId: ObjectId;
  workerId: ObjectId;
  type: "checkIn" | "checkOut";
  createdAt?: Date;
  updatedAt?: Date;
}
