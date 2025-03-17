import { TokenType } from "src/types/TokenType";

export class CreateTokenDTO {
  activityId: string;
  workerId: string;
  type: TokenType;
  expiresAt?: Date;
}
