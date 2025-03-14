import { ObjectId } from "mongoose";

export class ValidateTokenDTO {
  activityId: ObjectId;
  workerId: ObjectId;
  token: string;
  type: "checkIn" | "checkOut";
}
