import { ObjectId } from "mongoose";
import { TokenType } from "src/types/TokenType";

export class CreateTokenDTO {
  activityId: ObjectId;
  workerId: ObjectId;
  type: TokenType;
  expiresAt?: Date; // Opcional, pode ser definido no serviço se não for fornecido
}
