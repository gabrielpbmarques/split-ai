import { ObjectId } from "mongoose";
import { TokenType } from "src/types/TokenType";

export class ValidateTokenDTO {
  activityId: ObjectId;
  token: string;
  type: TokenType;
}
