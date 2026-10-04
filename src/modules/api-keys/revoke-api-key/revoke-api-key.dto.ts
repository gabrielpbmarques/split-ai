import { IsNotEmpty, IsUUID } from 'class-validator';

export class RevokeApiKeyDto {
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
