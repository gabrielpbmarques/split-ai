import { ObjectId } from "mongoose";

export class CreateTokenDTO {
  activityId: ObjectId;
  workerId: ObjectId;
  type: "checkIn" | "checkOut";
  expiresAt?: Date; // Opcional, pode ser definido no serviço se não for fornecido
}
